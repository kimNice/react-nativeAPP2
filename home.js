import React, {
  Component,
} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  BackHandler,
  ImageBackground,
  Image,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import {
  UNIT_C,
  UNIT_F,
  UNIT_C_STR,
  UNIT_F_STR,
  TTrans,
} from '../service/FridgeData';
import FD from '../service/FridgeData';
import {
  AnimatedCircularProgress
} from 'react-native-circular-progress';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {
  CommonActions
} from '@react-navigation/native';
import {
  connect
} from 'react-redux'; // 引入connect函数
import * as userAction from '../redux/action/userAction';
import {
  resize_rem
} from '../common/CommonUtils';
import Styles from '../common/Styles';
import {
  goBack,
  goTo,
  Toust
} from '../common/common';
import I18n from '../I18n/index.js';
var {
  height,
  width
} = Dimensions.get('window');
var rem = resize_rem();
const STATUS_BAR_HEIGHT = (Platform.OS === 'ios' ? 2 * rem : 0.75 * rem);
export class home extends Component {
  constructor() {
    super();
    this.state = {
      snowRotate: new Animated.Value(0),
      num: 10,
      mode: 0, //0制冷1加热
      box: 0, //0左仓1右仓
      tem: 0, //0c1f
      setTem: 0, //设置温度
      title: '',
      first: true,
      // show: true,
      flag: false,
      fridgeFlag: false,
      showLoading: true,
      left: new Animated.Value(-12 * rem),
      max: 20,
      openHelp: false
    };
    this._panResponder = PanResponder.create({
      // 要求成为响应者：
      onStartShouldSetPanResponder: (evt, gestureState) => {
        if (gestureState.x0 = gestureState.moveX) { //点击时不成为响应者
          return false;
        }
        return true;
      },
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false, //点击的时候可以传递给子组件
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (gestureState.x0 = gestureState.moveX) {
          return false;
        }
        return true;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

      onPanResponderGrant: (evt, gestureState) => {
        // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！

        // gestureState.{x,y} 现在会被设置为0
      },
      onPanResponderMove: (evt, gestureState) => {
        // 最近一次的移动距离为gestureState.move{X,Y}

        // 从成为响应者开始时的累计手势移动距离为gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.x0 > gestureState.moveX) { //左滑
          this.close();
        }
        // 用户放开了所有的触摸点，且此时视图已经成为了响应者。
        // 一般来说这意味着一个手势操作已经成功完成。
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
        // 默认返回true。目前暂时只支持android。
        return true;
      },
    });
  }

  componentDidMount() {
    this.setState({
      title: this.props.hasInfo.name
    });
    this.changUnit(this.props.nowFridge);
    this.listener();
    this.startSnowAnim();
    // 安卓返回键
    if (Platform.OS === 'android') {
      this.androidBackHandler = () => goBack(this);
      BackHandler.addEventListener('hardwareBackPress', this.androidBackHandler);
    }
    // this.checkInfo();
  }

  componentWillUnmount() {
    // this.timer3 && clearTimeout(this.timer3);
    this.deviceDisconnect();
    this.setState({
      first: true,
    });
    this._unsubscribe();
    this.stopSnowAnim();
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.androidBackHandler);
    }
  }

  open() {
    this.setState({
      fridgeFlag: true
    });
    Animated.timing(
      this.state.left, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false
      },
    ).start();
  }

  close() {
    Animated.timing(
      this.state.left, {
        toValue: -12 * rem,
        duration: 100,
        useNativeDriver: false
      },
    ).start(() => {
      this.setState({
        fridgeFlag: false
      });
    });
  }

  goHome() {
    this.setState({
      fridgeFlag: false
    }, () => {
      goTo(this, 'fridgeHome', this.props.route.params);
    });
  }

  goTips() {
    this.setState({
      fridgeFlag: false
    }, () => {
      goTo(this, 'tips', this.props.route.params);
    });
  }

  goSet() {
    let api = this.props.route.params;
    api.changUnit = this.changUnit.bind(this);
    this.setState({
      fridgeFlag: false
    }, () => {
      goTo(this, 'set', api);
    });
  }

  out() {
    BackHandler.exitApp();
  }

  deviceDisconnect() {
    this.props.setHasInfo(null);
    this.props.setNowFridge({}); //清空冰箱数据
    this.props.route.params.stopReadTimer(); //关闭轮询
    this.props.route.params.deviceDisconnect().then(() => { //断开连接
      console.log('disconnect first, and it return.');
    }).catch(err => {
      console.log('disconnect first, but failed:', err);
    });
  }

  onUnitSwitch() {
    let fd = this.props.nowFridge;

    // 单位反转
    let cfg = {
      unit: fd.unit == UNIT_C ? UNIT_F : UNIT_C,
    };

    // 温度转换
    // （设置unit的同时也要将其他配置信息一起传过去，
    // 所以必须保证unit切换后其他数值不变。）
    // ℉ = ℃*9/5 + 32
    // △℉ = △℃*9/5
    let T, TR;
    if (cfg.unit == UNIT_F) { // C -> F
      T = TTrans.C2F;
      TR = TTrans.C2FR;
    } else { // F -> C
      T = TTrans.F2C;
      TR = TTrans.F2CR;
    }

    cfg.tempMin = T(fd.tempMin);
    cfg.tempMax = T(fd.tempMax);

    cfg.leftTarget = T(fd.leftTarget);
    cfg.leftRetDiff = TR(fd.leftRetDiff);
    cfg.leftTCHot = TR(fd.leftTCHot);
    cfg.leftTCMid = TR(fd.leftTCMid);
    cfg.leftTCCold = TR(fd.leftTCCold);
    cfg.leftTCHalt = TR(fd.leftTCHalt);

    cfg.rightTarget = T(fd.rightTarget);
    cfg.rightRetDiff = TR(fd.rightRetDiff);
    cfg.rightTCHot = TR(fd.rightTCHot);
    cfg.rightTCMid = TR(fd.rightTCMid);
    cfg.rightTCCold = TR(fd.rightTCCold);
    cfg.rightTCHalt = TR(fd.rightTCHalt);
    this.changUnit(cfg);
    this.props.route.params.deviceSetOthers(cfg);
  }

  changUnit(cfg) {
    this.setFlag();
    if (this.state.box == 0) {
      this.setState({
        setTem: cfg.leftTarget,
        max: cfg.tempMax + 1,
        // show: false
      });
      if (!FD.rightEmpty(this.props.nowFridge)) {
        this.changNum(cfg.rightTarget, cfg.tempMax, cfg.leftTarget);
      } else {
        this.changNum(cfg.tempMin, cfg.tempMax, cfg.leftTarget);
      }
    } else {
      this.setState({
        setTem: cfg.rightTarget,
        max: cfg.tempMax + 1,
        // show: false
      });
      this.changNum(cfg.tempMin, cfg.tempMax, cfg.rightTarget);
    }
    // this.timer = setTimeout(() => {
    //   this.setState({
    //     show: true
    //   }, () => this.timer && clearTimeout(this.timer));
    // }, 600);
  }

  onLockSwitch() {
    this.setFlag();
    this.props.route.params.deviceSetOthers({
      locked: this.props.nowFridge.locked == 0 ? 1 : 0,
    });
  }

  onRunModeSwitch() {
    this.setFlag();
    this.props.route.params.deviceSetOthers({
      runMode: this.props.nowFridge.runMode == 0 ? 1 : 0,
    });
  }

  onBatSaverSwitch(level) {
    this.setFlag();
    this.props.route.params.deviceSetOthers({
      batSaver: level,
    });
  }

  onPoweredOnSwitch() {
    this.setFlag();
    this.props.route.params.deviceSetOthers({
      poweredOn: this.props.nowFridge.poweredOn == 1 ? 0 : 1,
    });
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
    }, 400);
  }

  listener() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      if (this.props.language && this.props.language != '') {
        I18n.setLocale(this.props.language);
      }

      if (this.props.resizeFlag) {
        this.changUnit(this.props.nowFridge);
        this.props.setResizeFlag(false);
      }
    });
  }

  resize() { //重置路由状态
    this.deviceDisconnect();
    // this.timer3 = setTimeout(() => { //缓冲时间
    //   this.props.navigation.dispatch(
    //     CommonActions.reset({
    //       index: 0,
    //       routes: [{
    //         name: 'login'
    //       }],
    //     })
    //   );
    // }, 800);
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{
          name: 'login'
        }],
      })
    );
  }

  changMode(tag) {
    this.setState({
      mode: tag
    });
  }

  changeBox(tag) {
    if (tag == this.state.box) return;
    if (tag == 0) {
      this.setState({
        box: tag,
        setTem: this.props.nowFridge.leftTarget
      });
      if (!FD.rightEmpty(this.props.nowFridge)) {
        this.changNum(this.props.nowFridge.rightTarget, this.props.nowFridge.tempMax, this.props.nowFridge.leftTarget);
      } else {
        this.changNum(this.props.nowFridge.tempMin, this.props.nowFridge.tempMax, this.props.nowFridge.leftTarget);
      }
    } else {
      this.setState({
        box: tag,
        setTem: this.props.nowFridge.rightTarget
      });
      this.changNum(this.props.nowFridge.tempMin, this.props.nowFridge.tempMax, this.props.nowFridge.rightTarget);
    }
  }

  changTem() {
    let tag = this.state.tem == 0 ? 1 : 0;
    this.setState({
      tem: tag
    })
  }
  getCalculateCurrent(value) {

    if (this.props.language === 'langAR') {
      let res = (this.props.nowFridge.unit == UNIT_C ? 'c' : 'f')
      let str = value < 0 ? String(value).replace('-', '') + '-' : value
      return res + String(str || 0)
    } else {
      let res = this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR
      return String(value || 0) + res
    }
  }
  startSnowAnim() {
    // 雪花旋转
    let anim = Animated.timing(
      this.state.snowRotate, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true
      },
    );
    this.snowAnim = Animated.loop(anim);
    this.snowAnim.start();
  }

  stopSnowAnim() {
    if (this.snowAnim != null) {
      this.snowAnim.stop();
      this.snowAnim = null;
      this.state.snowRotate.setValue(0);
    }
  }

  changNum(min, max, value) { //需要算份数,0临界值，正数加上最少值，数当前占的份数(设定min<0)
    console.log('-----', min);
    let total;
    let percent;
    if (min < 0) {
      total = Math.abs(max) + Math.abs(min);
      if (value < 0) {
        percent = Math.abs(min) - Math.abs(value);
      } else if (value == 0) {
        percent = Math.abs(min);
      } else {
        percent = Math.abs(min) + value;
      }
    } else {
      total = max + min;
      percent = value - min;
    }
    let number = (percent / total) * 100;
    console.log('-----', number);
    this.setState({
      num: number
    });
  }

  changStateTem(tag, value) {
    console.log('发送命令', tag, value)
    if (this.props.flag) { //flag为true时滑动后复原并且不发命令
      if (tag == 0) {
        this.setState({
          setTem: this.props.nowFridge.leftTarget,
        });
        // Toust(I18n.t('太快了'));
        setTimeout(() => {
          this.changStateTem(tag, value)
        }, 400)
        // this.changNum(this.props.nowFridge.tempMin, this.props.nowFridge.tempMax, this.props.nowFridge.leftTarget);
        return;
      }
      if (tag == 1) {
        this.setState({
          setTem: this.props.nowFridge.rightTarget,
        });
        // Toust(I18n.t('太快了'));

        setTimeout(() => {
          this.changStateTem(tag, value)
        }, 400)
        // this.changNum(this.props.nowFridge.tempMin, this.props.nowFridge.tempMax, this.props.nowFridge.rightTarget);
        return;
      }
    }
    this.setFlag();
    if (tag == 0 && !FD.rightEmpty(this.props.nowFridge) && this.props.nowFridge.rightTarget > value[0]) {
      this.setState({
        setTem: this.props.nowFridge.rightTarget,
      });
      this.changNum(this.props.nowFridge.tempMin, this.props.nowFridge.tempMax, this.props.nowFridge.rightTarget);
      this.props.route.params.deviceSetLeft(this.props.nowFridge.rightTarget);
      return;
    }
    let min = this.props.nowFridge.tempMin;
    if (value[0] < min || value[0] > this.props.nowFridge.tempMax) return;

    if (tag == 0) {
      this.props.route.params.deviceSetLeft(value[0]);
    } else {
      this.props.route.params.deviceSetRight(value[0]);
    }
    // this.changNum(this.props.nowFridge.tempMin, this.props.nowFridge.tempMax, value[0]);
    this.setState({
      setTem: value[0],
      max: this.props.nowFridge.tempMax + 1
    });
  }

  openHelp() {
    this.setState({
      openHelp: true
    });
    console.log(11111111)
  }

  closeHelp() {
    this.setState({
      openHelp: false
    });
  }

  shouldComponentUpdate(nextProps, nextState) { //刷新规则
    if (this.state.first == true) { //解决滑块进入时不能滑到最大值
      this.setState({
        first: false,
        setTem: nextProps.nowFridge.leftTarget,
        max: nextProps.nowFridge.tempMax + 1
      }, () => {
        this.showTimer = setTimeout(() => {
          // if (nextProps.nowFridge.leftTarget || !FD.rightEmpty(this.props.nowFridge) && nextProps.nowFridge.rightTarget) {
          //   //不做操作
          // } else {
          //   // Toust(I18n.t('error'));
          //   this.resize();
          // }
          this.setState({
            showLoading: false,
          }, () => this.showTimer && clearTimeout(this.showTimer));
        }, 1000);
      });
      if (this.state.box == 0 && !FD.rightEmpty(this.props.nowFridge)) {
        this.changNum(nextProps.nowFridge.rightTarget, nextProps.nowFridge.tempMax, nextProps.nowFridge.leftTarget);
      } else {
        this.changNum(nextProps.nowFridge.tempMin, nextProps.nowFridge.tempMax, nextProps.nowFridge.leftTarget);
      }
    }

    if (this.props.changeFridge == true) {
      this.props.setChangeFridge(false);
      this.setState({
        setTem: nextProps.nowFridge.leftTarget,
        max: nextProps.nowFridge.tempMax + 1,
        box: 0
      });
      if (!FD.rightEmpty(this.props.nowFridge)) {
        this.changNum(nextProps.nowFridge.rightTarget, nextProps.nowFridge.tempMax, nextProps.nowFridge.leftTarget);
      } else {
        this.changNum(nextProps.nowFridge.tempMin, nextProps.nowFridge.tempMax, nextProps.nowFridge.leftTarget);
      }
    }

    if (nextProps.nowFridge.tempMax != this.props.nowFridge.tempMax) {
      this.setState({
        max: nextProps.nowFridge.tempMax + 1
      });
    }
    // if (nextProps.nowFridge.tempMin != this.props.nowFridge.tempMin || nextProps.nowFridge.tempMax != this.props.nowFridge.tempMax || nextState.box != this.state.box) { //重新刷新滑动条，不然没法拉到最大值
    //   this.setState({
    //     show: false
    //   });
    //   this.timer = setTimeout(() => {
    //     this.setState({
    //       show: true
    //     }, () => this.timer && clearTimeout(this.timer));
    //   }, 200);
    // }

    if (this.state.box == 0 && this.props.nowFridge.leftTarget != nextProps.nowFridge.leftTarget && this.props.nowFridge.unit == nextProps.nowFridge.unit) { //更新左仓数据
      if (!FD.rightEmpty(this.props.nowFridge)) {
        this.changNum(this.props.nowFridge.rightTarget, this.props.nowFridge.tempMax, nextProps.nowFridge.leftTarget);
      } else {
        this.changNum(this.props.nowFridge.tempMin, this.props.nowFridge.tempMax, nextProps.nowFridge.leftTarget);
      }
      this.setState({
        setTem: nextProps.nowFridge.leftTarget
      });
    }

    if (this.state.box == 1 && this.props.nowFridge.rightTarget != nextProps.nowFridge.rightTarget && this.props.nowFridge.unit == nextProps.nowFridge.unit) { //更新右仓数据
      this.changNum(this.props.nowFridge.tempMin, this.props.nowFridge.tempMax, nextProps.nowFridge.rightTarget);
      this.setState({
        setTem: nextProps.nowFridge.rightTarget
      });
    }
    return true;
  }

  maker() {
    return (<Image style={{width:1.3*rem,height:1.3*rem}} resizeMode={'contain'} source={require('../res/home.png')}/>);
  }

  render() {
    return (
      <View style={{flex:1}}>
          <View style={{flex:1}}>
            <Modal visible={this.state.fridgeFlag} animationType={'fade'} onRequestClose={()=>{}} transparent={true}>
              <TouchableOpacity style={{backgroundColor:'rgba(0,0,0,0.6)',width:width,height:height,zIndex:10}} activeOpacity={1} onPress={()=>this.close()}>
              </TouchableOpacity>
              <Animated.View style={[styles.drawer,{left:this.state.left}]} {...this._panResponder.panHandlers}>
                <View style={styles.top}>
                  <Image style={styles.drawerImg} resizeMode={'contain'} source={require('../res/drawerImg.png')}/>
                  <View style={styles.nav}>
                    <TouchableOpacity style={styles.navContain} onPress={()=>this.goHome()}>
                      <View style={styles.navRow}>
                        <Image style={styles.icon} resizeMode={'contain'} source={require('../res/d1.png')}/>
                        <Text style={styles.iconText}>{I18n.t('myFridge')}</Text>
                      </View>
                      <Image style={styles.icon1} resizeMode={'contain'} source={require('../res/left_button.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navContain} onPress={()=>this.goTips()}>
                      <View style={styles.navRow}>
                        <Image style={styles.icon} resizeMode={'contain'} source={require('../res/d2.png')}/>
                        <Text style={styles.iconText}>{I18n.t('use')}</Text>
                      </View>
                      <Image style={styles.icon1} resizeMode={'contain'} source={require('../res/left_button.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navContain,{display:'none'}]}>
                      <View style={styles.navRow}>
                        <Image style={styles.icon} resizeMode={'contain'} source={require('../res/d3.png')}/>
                        <Text style={styles.iconText}>{I18n.t('shop')}</Text>
                      </View>
                      <Image style={styles.icon1} resizeMode={'contain'} source={require('../res/left_button.png')}/>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.bottom}>
                  <TouchableOpacity style={[styles.navRow,{marginBottom:0.5*rem,display:'none'}]}>
                    <Image style={styles.icon} resizeMode={'contain'} source={require('../res/b1.png')}/>
                    <Text style={styles.iconText}>{I18n.t('night')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.navRow,{marginBottom:0.5*rem}]} onPress={()=>this.goSet()}>
                    <Image style={styles.icon} resizeMode={'contain'} source={require('../res/b2.png')}/>
                    <Text style={styles.iconText}>{I18n.t('set')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.navRow,{marginBottom:0.5*rem}]} onPress={()=>this.out()}>
                    <Image style={styles.icon} resizeMode={'contain'} source={require('../res/b3.png')}/>
                    <Text style={styles.iconText}>{I18n.t('out')}</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Modal>
            <Modal visible={this.state.openHelp} animationType={'fade'} onRequestClose={()=>{}} transparent={true}>
              <TouchableOpacity style={styles.helpBg} activeOpacity={1} onPress={()=>this.closeHelp()}>
                <View style={styles.helpMain}>
                  <Text style={styles.helpTitle}>{I18n.t('controlTitle')}</Text>
                  <Text style={styles.helpText}>{I18n.t('controlText')}</Text>
                  <TouchableOpacity style={styles.confirm} onPress={()=>this.closeHelp()}>
                    <Text style={styles.helpText}>{I18n.t('confirm')}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
            <Modal visible={this.state.showLoading} animationType={'fade'} onRequestClose={()=>{}} transparent={true}>
              <View style={[styles.helpBg,styles.loading]}>
                <ActivityIndicator size="large" color="#999" />
              </View>
            </Modal>
          <StatusBar
            hidden={false}
            barStyle={this.props.mode =='light'?'dark-content':'dark-content'}
            backgroundColor='rgba(0,0,0,0)'
            translucent={true}
          />
         
          <ImageBackground style={styles.root} source={require('../res/homeBg.png')} resizeMode={'cover'}>
             <View style={styles.titleContain}>
                <TouchableOpacity style={styles.left} >
                  
                  {
                    /*onPress={()=>this.open()}
                        <Image style={styles.home} resizeMode={'contain'} source={require('../res/more.png')}/>
                    */
                  }
                </TouchableOpacity>
                <Image style={styles.logo} resizeMode={'contain'} source={require('../res/logo.png')}/>
                <TouchableOpacity style={styles.setContain} onPress={()=>this.goSet()}>
                  <Image style={styles.set} resizeMode={'contain'} source={require('../res/set.png')}/>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={height<750?styles.scrolV:styles.scrolV2} bounces={false}>
              <View style={styles.fridgeContain}>
              {
                /*
                  <View style={styles.center}>
                    <Text style={styles.tagTop}>{this.props.nowFridge.batPercent}%</Text>
                    <Text style={styles.tagBottom}>{I18n.t('currentBattery')}</Text>
                  </View>
                  <View style={styles.center}>
                    <Image style={styles.fridge} resizeMode={'contain'} source={require('../res/fridge_white.png')}/>
                    <Text style={styles.tagBottom}>{I18n.t('voltage')}{this.props.nowFridge.batVolInt}.{this.props.nowFridge.batVolDec}V</Text>
                  </View>
                  <View style={styles.center}>
                    {
                      this.state.box==0?
                      <Text style={styles.tagTop}>{this.props.nowFridge.leftCurrent}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      :<Text style={styles.tagTop}>{FD.rightEmpty(this.props.nowFridge) ? '--' : this.props.nowFridge.rightCurrent}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                    }            
                    <Text style={styles.tagBottom}>{I18n.t('currentTemperature')}</Text>
                  </View>
                */
              }
              {
                this.props.nowFridge.runMode==0?
                <TouchableOpacity disabled={this.props.flag} style={[styles.center,styles.topItem]} onPress={()=>this.onRunModeSwitch()}>
                   <Image style={[styles.fridge]} resizeMode={'contain'} source={require('../res/eco_off.png')}/>
                    <Text style={styles.tagBottomOff}>{I18n.t('mode')}</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity disabled={this.props.flag} style={[styles.center,styles.topItem,{backgroundColor:'#FFF'}]} onPress={()=>this.onRunModeSwitch()}>
                   <Image style={styles.fridge} resizeMode={'contain'} source={require('../res/eco_on.png')}/>
                    <Text style={styles.tagBottom}>{I18n.t('mode')}</Text>
                </TouchableOpacity>
                
              }
              {
                this.props.nowFridge.locked==0?
                <TouchableOpacity disabled={this.props.flag} style={[styles.center,styles.topItem]} onPress={()=>this.onLockSwitch()}>
                  <Image style={[styles.fridge]} resizeMode={'contain'} source={require('../res/lock_off.png')}/>
                  <Text style={styles.tagBottomOff}>{I18n.t('lock')}</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity disabled={this.props.flag} style={[styles.center,styles.topItem,{backgroundColor:'#FFF'}]} onPress={()=>this.onLockSwitch()}>
                  <Image style={[styles.fridge]} resizeMode={'contain'} source={require('../res/lock_on.png')}/>
                  <Text style={styles.tagBottom}>{I18n.t('lock')}</Text>
                </TouchableOpacity>
                
                
              }
              {
                this.props.nowFridge.poweredOn==1?
                <TouchableOpacity disabled={this.props.flag} style={[styles.center,styles.topItem,{backgroundColor:'#FFF'}]} onPress={() => this.onPoweredOnSwitch()}>
                  <Image style={[styles.fridge]} resizeMode={'contain'} source={require('../res/power_on.png')}/>
                  <Text style={styles.tagBottom}>{I18n.t('open')}</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity disabled={this.props.flag} style={[styles.center,styles.topItem]} onPress={() => this.onPoweredOnSwitch()}>
                  <Image style={[styles.fridge]} resizeMode={'contain'} source={require('../res/power_off.png')}/>
                  <Text style={styles.tagBottomOff}>{I18n.t('close')}</Text>
                </TouchableOpacity>
              }
              
               <TouchableOpacity disabled={this.props.flag} style={[styles.center,styles.topItem]} onPress={()=>this.resize()}>
                 <Image style={[styles.fridge]} resizeMode={'contain'} source={require('../res/link.png')}/>
                  <Text style={styles.tagBottomOff}>{I18n.t('link')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.temContain}>
              {
                /*
                <View style={styles.boxContain}>
                <TouchableOpacity style={[styles.boxTop,this.state.mode==0?styles.active:null]} onPress={()=>this.changMode(0)}>
                  <Image style={[styles.cntImg,this.state.mode==0?styles.activeImg:null]} resizeMode={'contain'} source={require('../res/snow.png')}/>
                  <Text style={[styles.cntText,this.state.mode==0?styles.activeText:null]}>{I18n.t('cold')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.boxBottom,this.state.mode==1?styles.active:null]} onPress={()=>this.changMode(1)}>
                  <Image style={[styles.cntImg,this.state.mode==1?styles.activeImg:null]} resizeMode={'contain'} source={require('../res/hot.png')}/>
                  <Text style={[styles.cntText,this.state.mode==1?styles.activeText:null]}>{I18n.t('hot')}</Text>
                </TouchableOpacity>
              </View>


              <View style={styles.row}>
                <TouchableOpacity style={[styles.controllLeft,this.state.box==0?styles.active:null]} onPress={()=>this.changeBox(0)}>
                  <Image style={[styles.boxImg,this.state.box==0?styles.activeImg:styles.commonImg]} resizeMode={'contain'} source={require('../res/left.png')}/>
                  <Text style={[styles.cntText1,this.state.box==0?styles.activeText:null]}>{I18n.t('left')}</Text>
                  <Text style={[styles.cntText,this.state.box==0?styles.activeText:null]}>{this.props.nowFridge.leftCurrent}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={FD.rightEmpty(this.props.nowFridge)} style={[styles.controllRight,this.state.box==1?styles.active:null]} onPress={()=>this.changeBox(1)}>
                  <Image style={[styles.boxImg,this.state.box==1?styles.activeImg:styles.commonImg]} resizeMode={'contain'} source={require('../res/right.png')}/>
                  <Text style={[styles.cntText1,this.state.box==1?styles.activeText:null]}>{I18n.t('right')}</Text>
                  <Text style={[styles.cntText,this.state.box==1?styles.activeText:null]}>{FD.rightEmpty(this.props.nowFridge) ? '--' : this.props.nowFridge.rightCurrent}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                </TouchableOpacity>
                {
                  this.state.box==0&&!FD.rightEmpty(this.props.nowFridge)?
                  <TouchableOpacity style={styles.helpContain} onPress={()=>this.openHelp()}> 
                    <Image style={styles.helpImg} resizeMode={'contain'} source={require('../res/help.png')}/>
                  </TouchableOpacity>
                  :null
                }
              </View>
                */
              }
              <View style={{position:'relative',justifyContent:'center',marginTop:1*rem,width:15*rem,minHeight:!FD.rightEmpty(this.props.nowFridge)? 14 * rem :9*rem}}>
                <View style={{position:'absolute',top:10,left:0}}>
                  <AnimatedCircularProgress
                  size={15*rem}
                  width={0.6*rem}
                  fill={this.state.num}
                  tintColor="#FF7575"
                  onAnimationComplete={() => console.log('onAnimationComplete')}
                  lineCap={'round'}
                  rotation={-80}
                  arcSweepAngle={160}
                  backgroundColor="#fff" />
                </View>
                
                

                <View style={styles.cntView}>
                    <View style={[styles.center,{flexDirection:'row',marginBottom:0.4*rem}]}>
                      <Text style={styles.tagBottomDark}>{this.props.nowFridge.batVolInt}.{this.props.nowFridge.batVolDec}V</Text>
                      <View style={{position:'relative'}}>
                        <Image style={styles.homeBat} resizeMode={'contain'} source={require('../res/battery.png')}/>
                        <Text style={styles.batText}>{this.props.nowFridge.batPercent}</Text>
                      </View>
                      
                    </View>
                    <Text style={styles.tempC}>{I18n.t('currentTemperature')}</Text>
                    <TouchableOpacity disabled={this.props.flag}>
                      <Text style={styles.temText}>{this.getCalculateCurrent(this.props.nowFridge.leftCurrent)}</Text>
                    </TouchableOpacity>
                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                      <Text style={styles.lrText}>{ this.state.box == 0 ? I18n.t('left') : I18n.t('right') }</Text>
                      <Text style={[styles.lrText,{paddingHorizontal:0.2*rem,color:'#01014A'}]}>|</Text>
                      <Text style={styles.lrText}>{I18n.t('cool')}</Text>
                    </View>
                      
                </View>
                {
                  !FD.rightEmpty(this.props.nowFridge)?
                  <View style={styles.row}>
                    <TouchableOpacity style={[styles.controllLeft,this.state.box==0?styles.active:styles.commonActive]} onPress={()=>this.changeBox(0)}>
                      <Image style={[styles.boxImg,this.state.box==0?styles.activeImg:styles.commonImg]} resizeMode={'contain'} source={require('../res/left.png')}/>
                      <Text style={[styles.cntText1,this.state.box==0?styles.activeText:null]}>{I18n.t('Aleft')}</Text>

                    </TouchableOpacity>
                    <TouchableOpacity disabled={FD.rightEmpty(this.props.nowFridge)} style={[styles.controllRight,this.state.box==1?styles.active:styles.commonActive]} onPress={()=>this.changeBox(1)}>
                      <Image style={[styles.boxImg,this.state.box==1?styles.activeImg:styles.commonImg]} resizeMode={'contain'} source={require('../res/right.png')}/>
                      <Text style={[styles.cntText1,this.state.box==1?styles.activeText:null]}>{I18n.t('Aright')}</Text>
                      
                    </TouchableOpacity>
                  </View>:null
                }
                
              </View>
              
              
              {
                /*
                  <Animated.Image 
                    style={[styles.ball,{
                          transform: [
                            { 
                              rotate: this.state.snowRotate.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['360deg', '0deg'],
                              }),
                            },
                          ],
                        }]} 
                    source={this.state.mode==0?require('../res/ball.png'):require('../res/ball_hot.png')} 
                  />
                  <TouchableOpacity disabled={this.state.flag} style={styles.up} onPress={()=>this.changStateTem(this.state.box,[this.state.setTem+1])}>
                <Image style={styles.button} source={require('../res/up.png')} resizeMode={'contain'}/>
              </TouchableOpacity>
              <TouchableOpacity disabled={this.state.flag} style={styles.tem} onPress={()=>this.onUnitSwitch()}>
                <Text style={styles.temText}>{this.state.setTem}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={this.state.flag} style={styles.down} onPress={()=>this.changStateTem(this.state.box,[this.state.setTem-1])}>
                <Image style={styles.button} source={require('../res/down.png')} resizeMode={'contain'}/>
              </TouchableOpacity>
                */
              }
              
             
            </View>
            <View>
               <View style={styles.sliderBox}>
                <View style={{marginTop:0.6*rem,flexDirection:'row',alignItems:'center'}}>
                  <Text style={styles.tempC}>{I18n.t('setRature')} </Text>
                  <Text style={[styles.tempC,{color:'#FF7575',fontSize:0.85*rem}]}> {this.getCalculateCurrent(this.state.setTem)}</Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:0.3*rem}}>
                  <TouchableOpacity style={styles.addAndsub} disabled={this.props.flag}  onPress={()=>this.changStateTem(this.state.box,[this.state.setTem-1])}>
                    <Image style={styles.control} resizeMode={'contain'} source={require('../res/jian.png')}/>
                  </TouchableOpacity>
                  <View>
                    <MultiSlider
                      values={[this.state.setTem]}
                      min={this.props.nowFridge.tempMin}
                      max={this.props.nowFridge.tempMax}
                      step={1}
                      onValuesChange={(value)=> this.setState({setTem: value[0]})}
                      onValuesChangeFinish={(value)=> this.changStateTem(this.state.box,value)}
                      snapped={true}
                      sliderLength={10 * rem}
                      markerStyle={styles.marker}
                      selectedStyle={styles.selectedStyle}
                      unselectedStyle={styles.unselectedStyle}
                    />
                    {
                      this.state.box==0&&!FD.rightEmpty(this.props.nowFridge)?
                      <View>
                        <Text style={styles.textLeft}>{this.getCalculateCurrent(this.props.nowFridge.rightTarget)}</Text>
                        <Text style={styles.textRight}>{this.getCalculateCurrent(this.props.nowFridge.tempMax)}</Text>
                      </View>
                      :<View>
                        <Text style={styles.textLeft}>{this.getCalculateCurrent(this.props.nowFridge.tempMin)}</Text>
                        <Text style={styles.textRight}>{this.getCalculateCurrent(this.props.nowFridge.tempMax)}</Text>
                      </View>
                    }
                  </View>
                  <TouchableOpacity style={styles.addAndsub} disabled={this.props.flag}  onPress={()=>this.changStateTem(this.state.box,[this.state.setTem+1])}>
                    <Image style={styles.control} resizeMode={'contain'} source={require('../res/jia.png')}/>
                  </TouchableOpacity>
                </View>
                
              </View>
              
              {
                /*
                  <View style={styles.powerContain}>
                    <TouchableOpacity disabled={this.state.flag} style={styles.imgCenter} onPress={() => this.onPoweredOnSwitch()}>
                      <Image style={styles.power} resizeMode={'contain'} source={this.props.nowFridge.poweredOn==1?require('../res/power_on.png'):require('../res/power_off.png')}/>
                      <Text style={this.props.nowFridge.poweredOn==1?styles.onText:styles.offText}>{this.props.nowFridge.poweredOn==1?I18n.t('open'):I18n.t('close')}</Text>
                    </TouchableOpacity>
                  </View>

                  {
                  this.props.nowFridge.batSaver==2?
                  <TouchableOpacity disabled={this.state.flag} style={styles.imgCenter} onPress={() => this.onBatSaverSwitch(1)}>
                    <Image style={styles.buttonImg} resizeMode={'contain'} source={require('../res/H.png')}/>
                    <Text style={styles.H}>{I18n.t('workPower')}</Text>
                  </TouchableOpacity>
                  :null
                }
                {
                  this.props.nowFridge.batSaver==1?
                  <TouchableOpacity disabled={this.state.flag} style={styles.imgCenter} onPress={() => this.onBatSaverSwitch(0)}>
                    <Image style={styles.buttonImg} resizeMode={'contain'} source={require('../res/M.png')}/>
                    <Text style={styles.M}>{I18n.t('workPower')}</Text>
                  </TouchableOpacity>
                  :null
                }
                {
                  this.props.nowFridge.batSaver==0?
                  <TouchableOpacity disabled={this.state.flag} style={styles.imgCenter} onPress={() => this.onBatSaverSwitch(2)}>
                    <Image style={styles.buttonImg} resizeMode={'contain'} source={require('../res/L.png')}/>
                    <Text style={styles.L}>{I18n.t('workPower')}</Text>
                  </TouchableOpacity>
                  :null
                }
                <TouchableOpacity disabled={this.state.flag} style={styles.imgCenter} onPress={()=>this.onRunModeSwitch()}>
                  {
                    this.props.nowFridge.runMode==0?
                    <View>
                      <Image style={styles.buttonImg} resizeMode={'contain'} source={require('../res/eco_on.png')}/>
                      <Text style={styles.offText}>{I18n.t('mode')}</Text>
                    </View>
                    :<View>
                      <Image style={styles.buttonImg} resizeMode={'contain'} source={require('../res/eco_on.png')}/>
                      <Text style={styles.onText}>{I18n.t('mode')}</Text>
                    </View>
                  }
                </TouchableOpacity>
                <TouchableOpacity disabled={this.state.flag} style={styles.imgCenter} onPress={()=>this.onLockSwitch()}>
                  {
                    this.props.nowFridge.locked==0?
                    <View>
                      <Image style={styles.buttonImg} resizeMode={'contain'} source={require('../res/lock_off.png')}/>
                      <Text style={styles.offText}>{I18n.t('lock')}</Text>
                    </View>
                    :<View>
                      <Image style={styles.buttonImg} resizeMode={'contain'} source={require('../res/lock_on.png')}/>
                      <Text style={styles.onText}>{I18n.t('lock')}</Text>
                    </View>
                  }
                </TouchableOpacity>
                */
              }
              <View style={styles.buttonContain}>
                <Text style={styles.tempC,{width:5.6 * rem,textAlign:'left',color:'#01014A',fontSize:0.75*rem,alignItems:'center',justifyContent:'center'}} numberOfLines={1}>{I18n.t('voltage')}</Text>
                <View style={styles.btnVolt}>
                  
                  {
                    this.props.nowFridge.batSaver==2?
                    <TouchableOpacity disabled={this.props.flag} style={[styles.voltItme,{backgroundColor:'#FFF'}]} onPress={() => this.onBatSaverSwitch(2)}>
                      <Image style={styles.btnVlotImg} resizeMode={'contain'} source={require('../res/H_atv.png')}/>
                      <View style={{flexDirection:'column'}}>
                        <Text style={styles.onText}>HIGH</Text>
                        <Text style={styles.onText}>12.0V</Text>
                      </View>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity disabled={this.props.flag} style={styles.voltItme} onPress={() => this.onBatSaverSwitch(2)}>
                      <Image style={styles.btnVlotImg} resizeMode={'contain'} source={require('../res/H.png')}/>
                      <View style={{flexDirection:'column'}}>
                        <Text style={styles.offText}>HIGH</Text>
                        <Text style={styles.offText}>12.0V</Text>
                      </View>
                    </TouchableOpacity>
                  }
                  {
                    this.props.nowFridge.batSaver==1?
                    <TouchableOpacity disabled={this.props.flag} style={[styles.voltItme,{backgroundColor:'#FFF'}]} onPress={() => this.onBatSaverSwitch(1)}>
                      <Image style={styles.btnVlotImg} resizeMode={'contain'} source={require('../res/M_atv.png')}/>
                      <View style={{flexDirection:'column'}}>
                        <Text style={styles.onText}>MED</Text>
                        <Text style={styles.onText}>11.5V</Text>
                      </View>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity disabled={this.props.flag} style={styles.voltItme} onPress={() => this.onBatSaverSwitch(1)}>
                      <Image style={styles.btnVlotImg} resizeMode={'contain'} source={require('../res/M.png')}/>
                      <View style={{flexDirection:'column'}}>
                        <Text style={styles.offText}>MED</Text>
                        <Text style={styles.offText}>11.5V</Text>
                      </View>
                    </TouchableOpacity>
                  }
                  {
                    this.props.nowFridge.batSaver==0?
                    <TouchableOpacity disabled={this.props.flag} style={[styles.voltItme,{marginRight:0,backgroundColor:'#FFF'}]} onPress={() => this.onBatSaverSwitch(0)}>
                      <Image style={styles.btnVlotImg} resizeMode={'contain'} source={require('../res/L_atv.png')}/>
                      <View style={{flexDirection:'column'}}>
                        <Text style={styles.onText}>LOW</Text>
                        <Text style={styles.onText}>9.0V</Text>
                      </View>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity disabled={this.props.flag} style={[styles.voltItme,{marginRight:0}]} onPress={() => this.onBatSaverSwitch(0)}>
                      <Image style={styles.btnVlotImg} resizeMode={'contain'} source={require('../res/L.png')}/>
                      <View style={{flexDirection:'column'}}>
                        <Text style={styles.offText}>LOW</Text>
                        <Text style={styles.offText}>9.0V</Text>
                      </View>
                    </TouchableOpacity>
                  }
                  
                </View>
              </View>
            </View>
            </ScrollView>
            
          </ImageBackground>
          </View>
          
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff'
  },
  scrolV: {
    // flex:1,

    width: width,
    justifyContent: 'space-around',
    paddingTop: 0.4 * rem,
  },
  scrolV2: {
    flex: 1,
    width: width,
    justifyContent: 'space-around'
  },
  titleContain: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: STATUS_BAR_HEIGHT + 10,
    // paddingTop: STATUS_BAR_HEIGHT,
    paddingBottom: 0.3 * rem,
    paddingHorizontal: 0.5 * rem,

  },
  title: {
    fontSize: 0.8 * rem,
    fontWeight: 'bold',
    color: '#fff'
  },
  set: {
    width: 0.85 * rem,
    height: 0.85 * rem,
    tintColor: '#01014A'
  },
  home: {
    width: 0.8 * rem,
    height: 0.8 * rem,
    tintColor: '#01014A'
  },
  logo: {
    width: 2.2 * rem,
    height: 2 * rem
  },
  setContain: {
    width: 1.5 * rem,
    height: 0.7 * rem,
    justifyContent: 'center',
    alignItems: 'center',
  },
  left: {
    width: 1.5 * rem,
    height: 0.7 * rem,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fridgeContain: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 0.3 * rem,
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',

  },
  topItem: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 0.5 * rem,
    paddingVertical: 0.3 * rem,
    maxWidth: 3.5 * rem,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tagTop: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 1 * rem,
    marginBottom: 0.3 * rem
  },
  tagBottom: {
    color: '#FF7575',
    fontSize: 0.55 * rem,
    minWidth: 3.5 * rem,
    textAlign: 'center',
  },
  tempC: {
    color: '#01014A',
    fontSize: 0.75 * rem,
    paddingHorizontal: 0.2 * rem
  },
  tagBottomOff: {
    color: '#fff',
    fontSize: 0.55 * rem,
    minWidth: 3.4 * rem,
    textAlign: 'center',
  },
  tagBottomDark: {
    color: '#FFF',
    fontSize: 0.6 * rem
  },
  fridge: {
    width: 1.5 * rem,
    height: 1.5 * rem,
    marginBottom: 0.3 * rem
  },
  cntView: {
    position: 'absolute',
    top: 1.4 * rem,
    justifyContent: 'center',
    alignItems: 'center',
    width: 15 * rem,
    height: 6 * rem
  },
  homeBat: {
    tintColor: '#FFF',
    width: 2 * rem,
    height: 1.3 * rem,
    marginLeft: 0.5 * rem
  },
  batText: {
    position: 'absolute',
    left: 0.7 * rem,
    top: 0.3 * rem,
    fontSize: 0.5 * rem,
    color: '#FFF'
  },
  lrText: {
    color: '#FFF',
    fontSize: 0.75 * rem,
    marginTop: 0.5 * rem
  },
  temContain: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 2 * rem,
    width: 15 * rem
  },
  controllLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    // width: 4 * rem,
    // height: 1.5 * rem,
    paddingVertical: 0.4 * rem,
    paddingHorizontal: 1.2 * rem,
    borderTopLeftRadius: 0.3 * rem,
    borderBottomLeftRadius: 0.3 * rem,
  },
  controllRight: {
    justifyContent: 'center',
    alignItems: 'center',
    // width: 4 * rem,
    // height: 1.5 * rem,
    paddingVertical: 0.4 * rem,
    paddingHorizontal: 1.2 * rem,
    borderTopRightRadius: 0.3 * rem,
    borderBottomRightRadius: 0.3 * rem,
  },
  controllLeftDark: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // width: 4 * rem,
    // height: 1.5 * rem,
    paddingVertical: 0.4 * rem,
    paddingHorizontal: 0.7 * rem,
    borderTopLeftRadius: 0.3 * rem,
    borderBottomLeftRadius: 0.3 * rem,
    borderWidth: 1,
    borderColor: '#BFBFBF'
  },
  controllRightDark: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // width: 4 * rem,
    // height: 1.5 * rem,
    paddingVertical: 0.4 * rem,
    paddingHorizontal: 0.7 * rem,
    borderTopRightRadius: 0.3 * rem,
    borderBottomRightRadius: 0.3 * rem,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#BFBFBF'
  },
  cntImg: {
    width: 0.7 * rem,
    height: 0.7 * rem,
  },
  cntText: {
    fontSize: 0.65 * rem,
    color: '#fff'
  },
  cntText1: {
    fontSize: 0.75 * rem,
    color: '#fff',
    marginHorizontal: 0.3 * rem
  },
  cntTextDark: {
    fontSize: 0.65 * rem,
    color: '#BFBFBF'
  },
  cntText1Dark: {
    fontSize: 0.65 * rem,
    color: '#BFBFBF',
    marginHorizontal: 0.3 * rem
  },
  active: {
    backgroundColor: '#FFF'
  },
  commonActive: {
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  activeDark: {
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  activeText: {
    color: '#FF7575'
  },
  activeImg: {
    tintColor: '#FF7575'
  },
  commonImg: {
    tintColor: '#fff'
  },
  commonImgDark: {
    tintColor: '#FFF'
  },
  boxContain: {
    position: 'absolute',
    left: 0 * rem,
    bottom: 4 * rem
  },
  boxTop: {
    // width: 2 * rem,
    // height: 2.5 * rem,
    paddingVertical: 0.5 * rem,
    paddingHorizontal: 0.3 * rem,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 0.3 * rem,
    borderTopRightRadius: 0.3 * rem,
    borderWidth: 1,
    borderColor: '#fff'
  },
  boxBottom: {
    // width: 2 * rem,
    // height: 2.5 * rem,
    paddingVertical: 0.5 * rem,
    paddingHorizontal: 0.3 * rem,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 0.3 * rem,
    borderBottomRightRadius: 0.3 * rem,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fff'
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxImg: {
    width: 1 * rem,
    height: 1 * rem,
    marginBottom: 0.2 * rem,
  },
  boxImgDark: {
    width: 0.7 * rem,
    height: 0.7 * rem,
    tintColor: '#BFBFBF'
  },
  ball: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 8 * rem,
    height: 8 * rem,
    position: 'absolute',
    // left: 0 * rem,
    top: 2.75 * rem
  },
  tem: {
    position: 'absolute',
    width: 4 * rem,
    height: 3 * rem,
    justifyContent: 'center',
    alignItems: 'center',
    top: 1 * rem
  },
  temText: {
    color: '#01014A',
    fontWeight: 'bold',
    fontSize: 1.3 * rem
  },
  temTextDark: {
    color: '#464646',
    fontWeight: 'bold',
    fontSize: 1.3 * rem
  },
  up: {
    position: 'absolute',
    // left: 0,
    top: 3.5 * rem
  },
  down: {
    position: 'absolute',
    // left: 0,
    bottom: 3 * rem
  },
  button: {
    width: 1.5 * rem,
    // height: 1.5 * rem,
  },
  marker: {
    width: 0.8 * rem,
    height: 0.8 * rem,
    borderRadius: 0.8 * rem,
    backgroundColor: '#fff',
    borderColor: "#FF7575",
    borderWidth: 4,
    top: 0.25 * rem
  },
  selectedStyle: {
    backgroundColor: '#FF7575',
    height: 0.4 * rem,
    borderRadius: 0.4 * rem
  },
  unselectedStyle: {
    backgroundColor: '#fff',
    height: 0.4 * rem,
    borderRadius: 0.4 * rem
  },
  markerDark: {
    width: 1 * rem,
    height: 1 * rem,
    borderRadius: 0.8 * rem,
    backgroundColor: '#62AAE2',
    top: 0.32 * rem
  },
  selectedStyleDark: {
    backgroundColor: '#464646',
    height: 0.6 * rem,
    borderRadius: 0.4 * rem
  },
  unselectedStyleDark: {
    backgroundColor: '#464646',
    height: 0.6 * rem,
    borderRadius: 0.4 * rem
  },
  addAndsub: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0.3 * rem,
    paddingVertical: 0.3 * rem,
  },
  textLeft: {
    fontSize: 0.75 * rem,
    color: '#fff',
    position: 'absolute',
    left: 0,
    bottom: -0.3 * rem
  },
  textRight: {
    fontSize: 0.75 * rem,
    color: '#fff',
    position: 'absolute',
    right: 0,
    bottom: -0.3 * rem
  },
  textLeftDark: {
    fontSize: 0.55 * rem,
    color: '#BFBFBF',
    position: 'absolute',
    left: 0,
    bottom: -0.3 * rem
  },
  control: {
    width: 1.2 * rem,
    height: 1.2 * rem
  },
  textRightDark: {
    fontSize: 0.55 * rem,
    color: '#BFBFBF',
    position: 'absolute',
    right: 0,
    bottom: -0.3 * rem
  },
  powerContain: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0.7 * rem,
  },
  power: {
    width: 3 * rem,
    height: 3 * rem
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  onText: {
    fontSize: 0.55 * rem,
    color: '#FF7575',
    textAlign: 'center'
  },
  offText: {
    fontSize: 0.55 * rem,
    color: '#FFF',
    textAlign: 'center'
  },
  offTextDark: {
    marginTop: 0.3 * rem,
    fontSize: 0.55 * rem,
    color: '#BFBFBF',
    textAlign: 'center'
  },
  buttonContain: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 0.2 * rem,
    marginHorizontal: 0.5 * rem,
    paddingVertical: 0.4 * rem,
    marginBottom: 0.5 * rem
  },
  btnVolt: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnVlotImg: {
    width: 0.6 * rem,
    height: 1.8 * rem,
    marginRight: 0.2 * rem
  },
  voltItme: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0.2 * rem,
    borderRadius: 0.4 * rem,
    paddingVertical: 0.5 * rem,
    paddingHorizontal: 0.2 * rem,
    color: '#FFF',
    backgroundColor: 'rgba(255,255,255,.2)'
  },
  sliderBox: {
    position: 'relative',
    marginHorizontal: 0.5 * rem,
    paddingHorizontal: 0.2 * rem,
    borderRadius: 0.2 * rem,
    paddingBottom: 1 * rem,
    marginBottom: 1.5 * rem,
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  H: {
    fontSize: 0.55 * rem,
    color: '#FFF',
    marginTop: 0.3 * rem,
  },
  M: {
    fontSize: 0.55 * rem,
    color: '#FFF',
    marginTop: 0.3 * rem,
  },
  L: {
    fontSize: 0.55 * rem,
    color: '#FFF',
    marginTop: 0.3 * rem,
  },
  buttonImg: {
    width: 2 * rem,
    height: 2 * rem,
  },
  drawer: {
    position: 'absolute',
    zIndex: 1000,
    width: 12 * rem,
    height: height,
    backgroundColor: '#fff',
    justifyContent: 'space-between'
  },
  drawerDark: {
    position: 'absolute',
    zIndex: 1000,
    width: 12 * rem,
    height: height,
    backgroundColor: '#121212',
    justifyContent: 'space-between'
  },
  drawerImg: {
    width: '100%',
    height: 7 * rem
  },
  nav: {
    marginTop: 0.5 * rem,
    alignItems: 'center',
  },
  navContain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    borderBottomWidth: 1,
    borderColor: '#F7F7F7',
    paddingVertical: 0.5 * rem,
  },
  navContainDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    borderBottomWidth: 1,
    borderColor: '#BFBFBF',
    paddingVertical: 0.5 * rem,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 0.7 * rem,
    height: 0.7 * rem
  },
  icon1: {
    width: 0.4 * rem,
    height: 0.4 * rem
  },
  iconDark: {
    width: 0.7 * rem,
    height: 0.7 * rem,
    tintColor: '#BFBFBF'
  },
  icon1Dark: {
    width: 0.4 * rem,
    height: 0.4 * rem,
    tintColor: '#BFBFBF'
  },
  iconText: {
    fontSize: 0.6 * rem,
    color: '#222',
    fontWeight: 'bold',
    marginLeft: 0.3 * rem
  },
  iconTextDark: {
    fontSize: 0.6 * rem,
    color: '#BFBFBF',
    fontWeight: 'bold',
    marginLeft: 0.3 * rem
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2 * rem,
    flexWrap: 'wrap',
    marginHorizontal: 1 * rem
  },
  helpContain: {
    position: 'absolute',
    right: 0 * rem,
    top: 3 * rem,
  },
  helpImg: {
    width: 0.9 * rem,
    height: 0.9 * rem,
  },
  helpMain: {
    width: 10 * rem,
    height: 8 * rem,
    backgroundColor: '#fff',
    borderRadius: 0.3 * rem,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0.5 * rem
  },
  helpMainDark: {
    width: 10 * rem,
    height: 8 * rem,
    backgroundColor: '#424242',
    borderRadius: 0.3 * rem,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0.5 * rem
  },
  helpBg: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: width,
    height: height,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  helpTitle: {
    fontSize: 0.6 * rem,
    fontWeight: 'bold',
    color: '#222'
  },
  helpText: {
    fontSize: 0.55 * rem,
    color: '#222',
    lineHeight: 0.9 * rem
  },
  helpTitleDark: {
    fontSize: 0.6 * rem,
    fontWeight: 'bold',
    color: '#BFBFBF'
  },
  helpTextDark: {
    fontSize: 0.55 * rem,
    color: '#BFBFBF',
    lineHeight: 0.9 * rem
  },
  confirm: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#62AAE2',
    width: 6 * rem,
    height: 1.8 * rem,
    borderRadius: 0.3 * rem
  },
  confirmDark: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#929292',
    width: 6 * rem,
    height: 1.8 * rem,
    borderRadius: 0.3 * rem
  },
  imgCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default connect(
  (state) => ({ //全局属性
    hasInfo: state.user.hasInfo,
    language: state.user.language,
    nowFridge: state.user.nowFridge,
    resizeFlag: state.user.resizeFlag,
    mode: state.user.mode,
    changeFridge: state.user.changeFridge,
    flag: state.user.flag,
  }),
  (dispatch) => ({ //传参改变全局属性
    setUserInfo: (tag) => dispatch(userAction.setUserInfo(tag)),
    setHasInfo: (tag) => dispatch(userAction.setHasInfo(tag)),
    setNowFridge: (tag) => dispatch(userAction.setNowFridge(tag)),
    setResizeFlag: (tag) => dispatch(userAction.setResizeFlag(tag)),
    setChangeFridge: (tag) => dispatch(userAction.setChangeFridge(tag)),
    setFlag: (tag) => dispatch(userAction.setFlag(tag)),
  })
)(home)