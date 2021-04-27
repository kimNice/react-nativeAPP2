import React, {
  Component,
} from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  Platform,
  StatusBar,
  ImageBackground,
  NativeEventEmitter,
  NativeModules,
  Appearance,
  Text,
  AppState
} from 'react-native';
import {
  connect
} from 'react-redux'; // 引入connect函数
import * as userAction from '../redux/action/userAction';
import {
  resize_rem
} from '../common/CommonUtils';
import Styles from '../common/Styles';
import SplashScreen from 'react-native-splash-screen';
import AppService from '../service/core';
import BleManager from 'react-native-ble-manager';
import FP from '../service/FridgeProtocol.js';
import {
  UNIT_C,
  UNIT_F,
  FridgeData,
} from '../service/FridgeData';
//// 实际的搜索到的设备信息以及当前已连接的设备的信息，
//// Redux中store存储的是设备的简要信息，
let gCurrDev = null;

// 记录当前数据，用以在数据轮询时比较是否有数据发生了变化，
// 如果没有变化就不用更新state。
let gCurrFD = null;

// react-native-ble-manager库定义的蓝牙数据接书机制
const gBleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
let gEventHandlers = null;

// 读缓冲区，冰箱发来的消息，有的一次发不完，会分两个消息过来。
let gReadBuf = null;

// Bind命令发出后，调用者会挂起并等待返回，并设置该结果回传入口。
let gBindWaitingCallback = null;

// 用以不断向冰箱发送查询命令的计时器ID
let gReadTimerID = null;

// 最近一次连接的设备，用于断线重连。
let gLastDevId = null;

// let flag = true;

// 需要识别的设备的蓝牙特征
let ALPICOOL_BLE_NAME = 'A1-XXXXXXXXXXXX';
let ALPICOOL_BLE_UUID_SERVICE = '00001234-0000-1000-8000-00805f9b34fb';
let ALPICOOL_BLE_UUID_CHAR_WRITE = '00001235-0000-1000-8000-00805f9b34fb';
let ALPICOOL_BLE_UUID_CHAR_READ = '00001236-0000-1000-8000-00805f9b34fb';
let ALPICOOL_BLE_UUID_CHAR_NOTIFY = '00001236-0000-1000-8000-00805f9b34fb';
if (Platform.OS === 'ios') {
  ALPICOOL_BLE_UUID_SERVICE = '1234';
  ALPICOOL_BLE_UUID_CHAR_WRITE = '1235';
  ALPICOOL_BLE_UUID_CHAR_READ = '1236';
  ALPICOOL_BLE_UUID_CHAR_NOTIFY = '1236';
}
import {
  goBack,
  goTo,
} from '../common/common';
import I18n from '../I18n/index.js';
var rem = resize_rem();
// react-native-ble-manager库定义的蓝牙数据接书机制
export class login extends Component {
  constructor() {
    super();
    this.state = {
      acount: '',
      pw: '',
    };
  }

  componentDidMount() {
    this.props.setFlag(false); //初始化flag，确保每次进入都是false
    this.checkMode();
    this.props.setIsConnect(0); //确保每次进入不会弹框
    this.props.setIsSearch(false);
    if (this.props.hasInfo == null) {
      this.props.setNowFridge(this.getInitData());
    }
    this.init();
    this.listener1()
    //性能优化，release版本不打印log
    if (!__DEV__) {
      global.console = {
        info: () => {},
        log: () => {},
        assert: () => {},
        warn: () => {},
        debug: () => {},
        error: () => {},
        time: () => {},
        timeEnd: () => {},
      };
    }
    this.timer3 = setTimeout(() => {
      SplashScreen.hide();
      this.checkInfo(); //自动连接蓝牙设备ios13好像需要做延迟处理
    }, 1300);
    // 安卓返回键
    if (Platform.OS === 'android') {
      this.androidBackHandler = () => goBack(this);
      BackHandler.addEventListener('hardwareBackPress', this.androidBackHandler);
    }
    if (this.props.language && this.props.language != '') {
      I18n.setLocale(this.props.language);
    }
    //app当前状态监听
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount() {
    this.dispose();
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.androidBackHandler);
    }
    this.timer3 && clearTimeout(this.timer3);
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    if (nextAppState == 'active') {
      this.checkMode();
    }
  };
  listener1() {
    if (this.props.language && this.props.language != '') {
      console.log('设置语言', this.props.language)
      I18n.setLocale(this.props.language);
    }

  }
  checkMode() {
    //检测是否深色模式
    let colorScheme = Appearance.getColorScheme();
    console.log(colorScheme);
    if (colorScheme != this.props.mode) {
      this.props.setMode(colorScheme);
    }
  }

  // 初始化资源，返回一个Promise.
  init() {
    this.dbg('init()');
    if (gEventHandlers != null) {
      return Promise.resolve();
    }

    return BleManager.start({
      showAlert: true
    }).then(() => {
      gEventHandlers = [
        gBleManagerEmitter.addListener(
          'BleManagerDiscoverPeripheral', (dev) => this.onDevDiscovered(dev),
        ),
        gBleManagerEmitter.addListener(
          'BleManagerStopScan', (dev) => this.onScanStop(),
        ),
        gBleManagerEmitter.addListener(
          'BleManagerConnectPeripheral', (data) => this.onDevConnected(data),
        ),
        gBleManagerEmitter.addListener(
          'BleManagerDisconnectPeripheral', (data) => this.onDevDisconnected(data),
        ),
        gBleManagerEmitter.addListener(
          'BleManagerDidUpdateValueForCharacteristic', (data) => this.onCharacteristicValueUpdated(data)
        ),
      ];
    });
  }

  dispose() {
    this.dbg('dispose()');

    if (gEventHandlers == null) {
      return;
    }

    gEventHandlers.forEach(handler => {
      handler.remove();
    });
    gEventHandlers = null;
  }

  dbg(...args) {
    console.log('|||', ...args);
  }


  // 判断dev是否是我们的目标设备
  isMyType(dev) {
    if (dev == null || dev.name == null) {
      return false;
    }

    let ns = dev.name.toUpperCase();
    return ns.indexOf('A1-') === 0 || ns == 'WT-0001';
  }

  getFoundFridge(devId) {
    let fridges = this.props.fridgeArr;
    this.dbg('getFoundFridge: ', devId, fridges);

    if (fridges == null || fridges.length < 1) {
      return null;
    }
    for (let i = 0; i < fridges.length; ++i) {
      if (fridges[i].id == devId) {
        return fridges[i];
      }
    }
    return null;
  }
  setFlag() {
    this.props.setFlag(true);
    // this.setState({
    //   flag: true
    // });
    this.timerFlag = setTimeout(() => {
      this.props.setFlag(false);
      this.timerFlag && clearTimeout(this.timerFlag)
      // this.setState({
      //   flag: false
      // }, () => this.timerFlag && clearTimeout(this.timerFlag));
    }, 500);
  }
  // 事件：发现新设备
  // 不能把device直接存入state，Immuatble处理它会发生调用栈溢出。
  onDevDiscovered(dev) {
    if (this.isMyType(dev)) {
      this.dbg('IS MY TYPE!!!');
      let fridge = {
        id: dev.id,
        name: dev.name,
        isBound: false,
        // isOnline: false,
        rssi: dev.rssi,
      };

      console.log(fridge);
      //替换已有绑定的冰箱的isBound
      let arrCache = this.props.fridgeCache;
      console.log(this.props.fridgeArr)
      if (arrCache.length > 0) {
        for (let i = 0; i < arrCache.length; i++) {
          if (arrCache[i].id === fridge.id) {
            fridge.isBound = arrCache[i].isBound;
            break;
          }
        }
      }

      let arr = this.props.fridgeArr;
      if (arr.length > 0) {
        for (let i = 0; i < arr.length; i++) { //实时更新rssi
          if (arr[i].id === fridge.id) {
            arr[i] = fridge;
            break;
          }
          if (i == arr.length - 1 && arr[i].id != fridge.id) {
            arr.push(fridge);
          }
        }
      } else {
        arr.push(fridge);
      }
      // 按rssi从大到小排序
      arr.sort((first, second) => {
        if (isNaN(first.rssi) && isNaN(second.rssi)) {
          return 0;
        } else if (isNaN(first.rssi)) {
          return 1;
        } else if (isNaN(second.rssi)) {
          return -1;
        } else {
          return first.rssi < second.rssi;
        }
      });
      // if (flag) {
      //   console.log('----------');
      //   this.timer && clearTimeout(this.timer3);
      //   flag = false;
      //   this.timer = setTimeout(() => {
      //     flag = true;
      //   }, 1000);
      //   let arr1 = arr.concat(); //在redux内需要深拷贝才能正确触发刷新
      //   this.props.setFridgeArr(arr1);
      // }
      let arr1 = arr.concat(); //在redux内需要深拷贝才能正确触发刷新
      this.props.setFridgeArr(arr1);
    }
  }

  // 事件：停止扫描
  onScanStop() {
    this.dbg('onScanStop');
    // gFridgeActionsDispatcher.setIsSearching(false);
    this.props.setIsSearch(false);
  }

  // 事件：设备连接成功
  onDevConnected(data) {
    this.dbg('onDeviceConnected:', data);

  }

  // 事件：设备断开连接
  onDevDisconnected(data) {
    this.dbg('onDevDisconnected:', data);

    //if (gCurrDev != null) {
    //gFridgeActionsDispatcher.intendDisconnect();
    //}
    // 发送intendDisconnect消息的效果和直接点击断开按钮的效果一样。
    // 现在需求是已连接的设备在非人为操作下断开连接比如超出蓝牙距离，则自动重连。
    // gFridgeActionsDispatcher.setIsConnected(false);
  }

  // 事件：数据更新
  onCharacteristicValueUpdated(data) {
    this.dbg('onCharacteristicValueUpdated:', data.value);
    gReadBuf = gReadBuf == null ? data.value : gReadBuf.concat(data.value);

    // 将前面Header之外的内容清除——有时候前面会莫名其妙多出一个字节
    let headerIdx = FP.getHeaderIndex(gReadBuf);
    if (headerIdx < 0) { // 没有Header，丢弃之！
      this.dbg('do not contain header, discard it!');
      gReadBuf = null;
      return;
    } else if (headerIdx > 0) {
      this.dbg(headerIdx, 'jungle bytes discarded');
      gReadBuf.splice(0, headerIdx);
    }

    // 判断消息是否完整
    let end = FP.isMessageComplete(gReadBuf);
    if (end <= 0) {
      this.dbg('message not complete yet');
      return;
    }

    let result = null;
    try {
      result = FP.decodeResponse(gReadBuf.slice(0, end));
    } catch (err) {
      this.dbg(err);
    }

    if (gReadBuf.length == end) {
      gReadBuf = null;
    } else {
      gReadBuf.splice(0, end);
    }

    if (result == null) {
      this.dbg('UNKNOWN RESPONSE !!!');
      return;
    }
    this.dbg('response:', result);

    switch (result['cmd']) {
      case FP.RES_BIND:
        if (gBindWaitingCallback != null) {
          gBindWaitingCallback(result['data']);
        }
        break;
      case FP.RES_READ:
      case FP.RES_SET_OTHERS:
      case FP.RES_RESET:
        // 都已经能够读数据了，绑定应该是成功了吧！
        // ——有些时候第一次绑定时，用户在冰箱上按了确认键后，冰箱直接发送read结果，
        // 而不是绑定结果。
        if (gBindWaitingCallback != null) {
          gBindWaitingCallback(result['data']);
        }

        let fd = result['data'];
        if (fd.isEqualTo(this.props.nowFridge) == false) {
          // gFridgeActionsDispatcher.setFridgeData(fd);
          this.props.setNowFridge(fd);
          this.dbg('state changed!!!');
        } else {
          this.dbg('nothing happen');
        }
        break;
      case FP.RES_SET_LEFT:
        // gFridgeActionsDispatcher.setLeftTemperature(result['data']);
        break;
      case FP.RES_SET_RIGHT:
        // gFridgeActionsDispatcher.setRightTemperature(result['data']);
        break;
    }
  }

  deviceConnect(devId) {
    this.dbg(devId, 'connecting...');
    return new Promise((resolve, reject) => {
      let timerConnected = setTimeout(() => {
        reject(new Error("connect timeout"));
      }, 10000);
      BleManager.connect(devId).then(() => {
        this.dbg(devId, 'connected!');
        clearTimeout(timerConnected);
        gLastDevId = devId;

        // 记录当前选中的设备
        //let currDev = gDevs.find(dev => { return dev.id == devId; });
        //gCurrDev = currDev;
        if (this.props.hasInfo) {
          gCurrDev = this.props.hasInfo;
        } else {
          gCurrDev = this.getFoundFridge(devId);
        }

        // 再次确认是我们的设备
        // 蓝牙断开时，retrieveServices（）不返回
        let timerRetrieveServices = setTimeout(() => {
          reject(new Error('retrieveServices timeout'));
        }, 10000);

        BleManager.retrieveServices(devId).then(info => {
          clearTimeout(timerRetrieveServices);
          this.dbg('services retrieved:', info);

          //gCurrDev.isOnline = true;
          //gFridgeActionsDispatcher.setBound(gCurrDev); // update fridge
          // 直接设置gCurrDev的isOnline属性是设置不成功的，
          // 因为gCurrDev是已经被Immuatble处理的对象！
          // let fridge = {
          //   id: gCurrDev.id,
          //   name: gCurrDev.name,
          //   isBound: gCurrDev.isBound,
          //   isOnline: true,
          // };
          // gFridgeActionsDispatcher.setBound(fridge); // update fridge

          if (gCurrDev.isBound) {
            BleManager.startNotification(
              devId, ALPICOOL_BLE_UUID_SERVICE, ALPICOOL_BLE_UUID_CHAR_NOTIFY,
            ).then(() => {
              this.deviceRead();
              this.props.setIsConnect(2);
            }).then(() => {
              let fridge = {
                id: gCurrDev.id,
                name: gCurrDev.name,
                isBound: true,
                // isOnline: true,
              };
              this.props.setHasInfo(fridge);
              resolve(1);
            }).catch(err => {
              this.dbg(err);
              resolve(0);
            });
          } else {
            // 监听数据变化，发出绑定指令，然后发出第一次读数据指令。
            BleManager.startNotification(
              devId, ALPICOOL_BLE_UUID_SERVICE, ALPICOOL_BLE_UUID_CHAR_NOTIFY,
            ).then(() => {
              //超时返回
              let timeoutID = setTimeout(() => {
                this.dbg('Bind waiting timeout!');
                gBindWaitingCallback = null;
                resolve(0);
              }, 15000);

              // 用户操作返回 
              gBindWaitingCallback = (result) => {
                this.dbg('Bind result got!');
                gBindWaitingCallback = null;
                clearTimeout(timeoutID);

                // 如果是确认绑定，则记录绑定结果。
                if (result > 0) {
                  let fridge = {
                    id: gCurrDev.id,
                    name: gCurrDev.name,
                    isBound: true,
                    // isOnline: true,
                  };
                  let cache = this.props.fridgeCache;
                  this.props.setHasInfo(fridge);
                  this.props.setFridgeCache(cache.concat(fridge)); //记录下已绑定的冰箱
                  // gFridgePersistActionsDispatcher.addBoundFridge(fridge);
                  // gFridgeActionsDispatcher.setBound(fridge);
                }

                resolve(result);
              };

              this.deviceBind().catch(err => {
                gBindWaitingCallback = null;
                clearTimeout(timeoutID);
                reject(err);
              });
            }).catch(err => {
              this.dbg(err);
              reject(err);
            });
          }
        }).catch(err => {
          clearTimeout(timerRetrieveServices);
          this.dbg(err);
          reject(err);
        });
      }).catch(err => {
        clearTimeout(timerConnected);
        reject(err);
      });
    });
  }

  deviceBind() {
    if (gCurrDev == null) {
      return Promise.reject('no device connected');
    }
    this.dbg(gCurrDev.id, 'binding...');

    this.props.setIsConnect(1);

    //return BleManager.write( // old single box device
    //return BleManager.writeWithoutResponse( // new double box device
    return this.writeToDevice(
      gCurrDev.id,
      ALPICOOL_BLE_UUID_SERVICE,
      ALPICOOL_BLE_UUID_CHAR_WRITE,
      FP.encodeBind(),
    ).then(() => {
      this.dbg('deviceBind return');
      //).then(data => {
      //dbg('deviceBind return:', data);
    }).catch(err => {
      this.dbg('deviceBind error:', err);
      throw (err);
    });
  }

  writeToDevice(id, service, characteristic, data) {
    if (gCurrDev == null) {
      return Promise.reject('no device connected');
    }

    //if (gCurrDev.name.toUpperCase() === 'WT-0001') {
    //return BleManager.write(id, service, characteristic, data);
    //} else {
    //return BleManager.writeWithoutResponse(id, service, characteristic, data);
    //}
    return BleManager.write(id, service, characteristic, data).catch(err => {
      this.dbg('write error:', err, 'trying writeWithoutResponse!');
      return BleManager.writeWithoutResponse(id, service, characteristic, data);
    });
  }

  deviceRead() {
    if (gCurrDev == null) {
      return Promise.reject('no device connected');
    }
    this.dbg(gCurrDev.id, 'characteristic data reading...');


    // 是直接读呢，还是发送Query命令？
    //return BleManager.read(
    //gCurrDev.id,
    //ALPICOOL_BLE_UUID_SERVICE,
    //ALPICOOL_BLE_UUID_CHAR_READ,
    //).then(data => {
    //dbg('deviceRead return:', data);
    //}).catch(err => {
    //dbg('deviceRead error:', err);
    //throw(err);
    //});
    //return BleManager.write(
    //return BleManager.writeWithoutResponse(
    return this.writeToDevice(
      gCurrDev.id,
      ALPICOOL_BLE_UUID_SERVICE,
      ALPICOOL_BLE_UUID_CHAR_WRITE,
      FP.encodeQuery(),
    ).then(data => {
      this.dbg('deviceRead return:', data);

      // 读指令发送完成之后，清空已读数据，从帧头开始接收。
      // 如果上一帧数据接收失败，会有读取的残余数据，
      // 这里如果不清空，会导致新的数据追加之前的数据，结果就不是一帧合法数据了。
      gReadBuf = null;
    }).catch(err => {
      this.dbg('deviceRead error:', err);
      throw (err);
    });
  }

  // 开始冰箱的数据轮询
  startReadTimer() {
    this.dbg('startReadTimer()');
    if (gReadTimerID != null) {
      return;
    }

    gReadTimerID = setInterval(() => {
      if (this.props.hasInfo != null) {
        if (this.props.flag) return; //flag为false时不用发命令
        this.setFlag();
        this.deviceRead().then(() => {
          // gFridgeActionsDispatcher.setIsConnected(true);
        }).catch(() => {
          this.dbg('read timer error, stop it.');
          // gFridgeActionsDispatcher.setIsConnected(false);
          this.stopReadTimer();

          let tryConnect = () => {
            this.dbg('try to reconnect...');

            let nextTryTimer = setTimeout(() => {
              clearTimeout(nextTryTimer);
              tryConnect();
            }, 8000);

            this.deviceDisconnect().then(() => {
              this.dbg('disconnect first, and it return.');
              this.deviceConnect(gLastDevId).then(() => {
                this.dbg('reconnect ok');
                this.props.setIsConnect(0); //关闭连接中的弹框
                // 停止重连计时器
                clearTimeout(nextTryTimer);
                // 开始读计时器
                this.startReadTimer();
              }).catch(err => {
                this.dbg('reconnect failed:', err);
                //tryConnect();
              });
            }).catch(err => {
              this.dbg('disconnect first, but failed:', err);
            });
          };
          tryConnect();
        });
      }
      //调试模式轮询时间过快会导致右箱调节温度的时候蓝牙断开连接
    }, 2000); //rn版本问题？调试模式4s查询一次才不会出错，正常模式下2s一次
  }

  // 停止冰箱的数据轮询
  stopReadTimer() {
    this.dbg('stopReadTimer()');
    if (gReadTimerID != null) {
      clearInterval(gReadTimerID);
      gReadTimerID = null;
    }
  }

  deviceDisconnect() {
    // 断开连接
    if (gCurrDev == null) {
      return Promise.resolve();
    }
    this.dbg(gCurrDev.id, 'disconnecting...');

    let devId = gCurrDev.id;
    gCurrDev = null;
    return BleManager.disconnect(devId).then(() => {
      gCurrDev = null;
      gCurrFD = null; //解决第二次进入时更新数据时间过长
    }).catch(err => {
      this.dbg(err);
      gCurrDev = null;
    });
  }

  deviceSetLeft(temperature) {
    this.dbg('deviceSetLeft:', temperature);
    if (gCurrDev == null) {
      return Promise.reject('no device connected');
    }
    this.dbg(gCurrDev.id, 'setting left temperature to', temperature);

    //return BleManager.write(
    //return BleManager.writeWithoutResponse(
    return this.writeToDevice(
      gCurrDev.id,
      ALPICOOL_BLE_UUID_SERVICE,
      ALPICOOL_BLE_UUID_CHAR_WRITE,
      FP.encodeSetLeft(temperature),
    ).then(() => {
      this.dbg('deviceSetLeft return');
    }).catch(err => {
      this.dbg('deviceSetLeft error:', err);
      throw (err);
    });
  }

  deviceSetRight(temperature) {
    this.dbg('deviceSetRight:', temperature);
    if (gCurrDev == null) {
      return Promise.reject('no device connected');
    }
    this.dbg(gCurrDev.id, 'setting right temperature to', temperature);

    //return BleManager.writeWithoutResponse(
    return this.writeToDevice(
      gCurrDev.id,
      ALPICOOL_BLE_UUID_SERVICE,
      ALPICOOL_BLE_UUID_CHAR_WRITE,
      FP.encodeSetRight(temperature),
    ).then(() => {
      this.dbg('deviceSetRight return');
    }).catch(err => {
      this.dbg('deviceSetRight error:', err);
      throw (err);
    });
  }

  deviceSetOthers(cfg) {
    if (cfg == null) {
      return Promise.reject('nothing to set');
    }
    if (gCurrDev == null) {
      return Promise.reject('no device connected');
    }
    if (this.props.nowFridge == null) {
      return Promise.reject('write before first read');
    }

    let fd = new FridgeData(this.props.nowFridge);
    for (let prop in cfg) {
      fd[prop] = cfg[prop];
    }

    //return BleManager.write(
    //return BleManager.writeWithoutResponse(
    return this.writeToDevice(
      gCurrDev.id,
      ALPICOOL_BLE_UUID_SERVICE,
      ALPICOOL_BLE_UUID_CHAR_WRITE,
      FP.encodeSetOthers(fd),
    ).then(() => {
      this.dbg('deviceSetRight return');
    }).catch(err => {
      this.dbg('deviceSetRight error:', err);
      throw (err);
    });
  }

  deviceReset() {
    if (gCurrDev == null) {
      return Promise.reject('no device connected');
    }
    this.dbg(gCurrDev.id, 'reseting...');

    //return BleManager.write(
    //return BleManager.writeWithoutResponse(
    return this.writeToDevice(
      gCurrDev.id,
      ALPICOOL_BLE_UUID_SERVICE,
      ALPICOOL_BLE_UUID_CHAR_WRITE,
      FP.encodeReset(),
    ).then(() => {
      this.dbg('deviceReset return');
    }).catch(err => {
      this.dbg('deviceReset error:', err);
      throw (err);
    });
  }

  getInitData() {
    return new FridgeData();
  }

  checkInfo() {
    let api = {
      getInitData: this.getInitData.bind(this),
      deviceConnect: this.deviceConnect.bind(this),
      startReadTimer: this.startReadTimer.bind(this),
      stopReadTimer: this.stopReadTimer.bind(this),
      deviceDisconnect: this.deviceDisconnect.bind(this),
      deviceSetOthers: this.deviceSetOthers.bind(this),
      deviceSetLeft: this.deviceSetLeft.bind(this),
      deviceSetRight: this.deviceSetRight.bind(this),
      deviceReset: this.deviceReset.bind(this)
    };
    if (this.props.hasInfo) {
      this.deviceConnect(this.props.hasInfo.id).then(result => {
        console.log('绑定结果', result);
        if (result > 0) {
          goTo(this, 'home', api);
          this.startReadTimer();
        } else {
          this.deviceDisconnect(); //断开设备
          this.props.setHasInfo(null); //没连接上清空数据，进入搜索界面重新开始
          goTo(this, 'search', api);
        }
        this.props.setIsConnect(0);
      }).catch(err => {
        this.props.setHasInfo(null); //没连接上清空数据，进入搜索界面重新开始
        goTo(this, 'search', api);
        this.props.setIsConnect(0);
      });
    } else {
      goTo(this, 'search', api);
    }
  }

  // checkPw() {
  //   goTo(this, 'checkList');
  // }

  render() {
    return (
      <ImageBackground style={styles.root} source={require('../res/bg.png')} resizeMode={'cover'}>
        <StatusBar
          barStyle={this.props.mode =='light'?'light-content':'light-content'}
          backgroundColor='rgba(0,0,0,0)'//{this.props.mode =='light'?'#FFF':'#333333'}
          translucent={true}
        />
        <Text style={{position:'absolute',bottom:2*rem,textAlign:'center',width:'100%',height:4*rem,color:'#01014A',fontSize:1*rem, fontWeight: 'bold',}}>{I18n.t('loginBot')}</Text>

        </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    // alignItems: 'center',
    backgroundColor: '#fff'
  },
});

export default connect(
  (state) => ({ //全局属性
    hasInfo: state.user.hasInfo,
    language: state.user.language,
    fridgeArr: state.user.fridgeArr,
    fridgeCache: state.user.fridgeCache,
    isSearch: state.user.isSearch,
    isConnect: state.user.isConnect,
    nowFridge: state.user.nowFridge,
    mode: state.user.mode,
    flag: state.user.flag,
  }),
  (dispatch) => ({ //传参改变全局属性
    setHasInfo: (tag) => dispatch(userAction.setHasInfo(tag)),
    setLanguage: (tag) => dispatch(userAction.setLanguage(tag)),
    setFridgeArr: (tag) => dispatch(userAction.setFridgeArr(tag)),
    setFridgeCache: (tag) => dispatch(userAction.setFridgeCache(tag)),
    setIsSearch: (tag) => dispatch(userAction.setIsSearch(tag)),
    setIsConnect: (tag) => dispatch(userAction.setIsConnect(tag)),
    setNowFridge: (tag) => dispatch(userAction.setNowFridge(tag)),
    setMode: (tag) => dispatch(userAction.setMode(tag)),
    setFlag: (tag) => dispatch(userAction.setFlag(tag)),
  })
)(login)