import React, {
  Component,
} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  BackHandler,
  Image,
  FlatList,
  Animated,
  Easing,
  Platform,
  ImageBackground,
  PermissionsAndroid,
  Appearance,
  StatusBar
} from 'react-native';
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
import Title from '../components/title';
import I18n from '../I18n/index.js';
import AppService from '../service/core';
import AwesomeAlert from 'react-native-awesome-alerts';
var rem = resize_rem();
export class search extends Component {
  constructor() {
    super();
    this.state = {
      opacity: new Animated.Value(1),
      data: []
    };
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      this.request();
    }
    this.listener();
    this.listener1();
    // 安卓返回键
    if (Platform.OS === 'android') {
      this.androidBackHandler = () => goBack(this);
      BackHandler.addEventListener('hardwareBackPress', this.androidBackHandler);
    }
  }

  componentWillUnmount() {
    this.timer3 && clearTimeout(this.timer3);
    this.props.setIsSearch(false);
    this.props.setIsConnect(0);
    this.props.route.params.stopReadTimer(); //关闭轮询
    this.props.route.params.deviceDisconnect().then(() => { //断开连接
      console.log('disconnect first, and it return.');
    }).catch(err => {
      console.log('disconnect first, but failed:', err);
    });
    this._unsubscribe();
    this._unsubscribe1();
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.androidBackHandler);
    }
    this.stopAnimated();
  }

  async request() {
    let req = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (req === PermissionsAndroid.RESULTS.GRANTED) {
      //同意授权
    } else {
      Toust(I18n.t('needLocPerm'));
    }
  }

  listener() {
    this._unsubscribe = this.props.navigation.addListener('blur', () => {
      // do something
      this.stopSearch();
    });
  }

  listener1() {
    this._unsubscribe1 = this.props.navigation.addListener('focus', () => {
      if (this.props.autoSearch) {
        this.props.setAutoSearch(false);
        this.search();
      }
      // do something
      this.props.setFridgeArr([]);
      if (this.props.language && this.props.language != '') {
        I18n.setLocale(this.props.language);
      }
    });
  }

  startAnimated() {
    let anim = Animated.sequence([
      Animated.timing(
        this.state.opacity, {
          toValue: 0.4,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true
        },
      ),
      Animated.delay(500), // 有点像 sleep 
      Animated.timing(
        this.state.opacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true
        },
      )
    ]);
    this.Anim = Animated.loop(anim);
    this.Anim.start();
  }

  stopAnimated() {
    if (this.Anim != null) {
      this.Anim.stop();
      this.Anim = null;
      this.state.opacity.setValue(1);
    }
  }

  search() {
    AppService.isBluetoothReady().then(isOpen => {
      if (!isOpen) {
        if (Platform.OS === 'android') {
          AppService.openBluetooth().then(() => {
            this.search();
          });
        } else {
          Toust(I18n.t('openBluetooth'));
        }
      } else {
        this.startAnimated();
        this.props.setIsSearch(true);
        AppService.startSearch();
      }
    });
  }

  stopSearch() {
    this.stopAnimated();
    AppService.stopSearch();
  }

  deviceConnect(id) {
    this.stopSearch();
    this.props.route.params.deviceConnect(id).then(result => {
      console.log('绑定结果', result);
      if (result > 0) {
        this.props.route.params.startReadTimer();
        let api = this.props.route.params;
        this.timer3 = setTimeout(() => { //缓冲时间
          this.props.setIsConnect(0);
          goTo(this, 'home', api);
        }, 1000);
      } else {
        this.props.route.params.deviceDisconnect(); //断开设备
        this.props.setIsConnect(0);
      }
    }).catch(err => {
      this.props.setIsConnect(0);
    });
  }

  _keyExtractor = (item, index) => index.toString();

  _renderItem({
    item,
    index
  }) {
    return (
      <TouchableOpacity style={[styles.center,styles.fridge]} onPress={()=>this.deviceConnect(item.id)}>
        <Image style={styles.fridgeImg} source={require('../res/fridge.png')} resizeMode={'contain'}/>
        <Text style={this.props.mode=='light'?styles.fridgeText:styles.fridgeTextDark} numberOfLines={1}>{item.name}</Text>
      </TouchableOpacity>
    );
  }


  render() {
    return (
      <View style={{flex:1}}>
        <StatusBar
            hidden={false}
            barStyle={this.props.mode =='light'?'dark-content':'dark-content'}
            backgroundColor='rgba(0,0,0,0)'
            translucent={true}
          />
        <ImageBackground style={styles.root} source={require('../res/homeBg.png')} resizeMode={'cover'}>
          <Title mode={'light'} title={I18n.t('addFridge')} showLeft={false} showRight={false}/>
          <View style={styles.contain}>
            <Animated.View style={[styles.round,{opacity:this.state.opacity}]} useNativeDriver={true}>
              <View style={styles.round1}>
                <View style={styles.round2}>
                  <Image style={styles.ble} source={require('../res/ble.png')} resizeMode={'contain'}/>
                </View>
              </View>
            </Animated.View>

              <View style={styles.fridgeContain}>
                <FlatList
                  data={this.props.fridgeArr}
                  keyExtractor={this._keyExtractor}
                  // contentContainerStyle={styles.center}
                  horizontal={true}
                  renderItem={this._renderItem.bind(this)}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>

            <View style={styles.bottom}>
              {
                !this.props.isSearch?
                <TouchableOpacity style={styles.button} onPress={()=>this.search()}>
                  <Text style={styles.buttonText}>{I18n.t('search')}</Text>
                  {this.stopAnimated()}
                </TouchableOpacity>
                :<TouchableOpacity style={styles.button} onPress={()=>this.stopSearch()}>
                  <Text style={styles.buttonText}>{I18n.t('stopSearch')}</Text>
                </TouchableOpacity>
              }
              {
                /*
                  <View style={styles.row}>
                    <Text style={styles.lastText}>{I18n.t('tips1')}</Text>
                    <TouchableOpacity onPress={()=>goTo(this,'tips',this.props.route.params)}>
                      <Text style={[styles.lastText,{color:'#0061AC'}]}>{I18n.t('tips2')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.row,{display:'none'}]}>
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('secret')}>
                      {
                        this.props.language.length>0?
                        <Text style={[styles.lastText,styles.line]}>{this.props.language.toLowerCase().indexOf('zh') > -1  ? '用户协议与隐私政策' : 'User Agreement and Privacy Policy'}</Text>
                        :<Text style={[styles.lastText,styles.line]}>{I18n.locale.toLowerCase().indexOf('zh') > -1  ? '用户协议与隐私政策' : 'User Agreement and Privacy Policy'}</Text>
                      }
                    </TouchableOpacity>
                  </View>
                */
              }
               
            </View>
          </View>
          <AwesomeAlert
            show={this.props.isConnect==1?true:false}
            showProgress={true}
            title={I18n.t('tips')}
            message={I18n.t('bindConfirm')}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={false}
            progressSize={1*rem}
            progressColor={'grey'}
          />
          <AwesomeAlert
            show={this.props.isConnect==2?true:false}
            showProgress={true}
            title={I18n.t('tips')}
            message={I18n.t('connecting')}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={false}
            progressSize={1*rem}
            progressColor={'grey'}
          />
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,

  },
  rootDark: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contain: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',

  },
  round: {
    backgroundColor: 'rgba(255,255,255,0.34)',
    width: 10 * rem,
    height: 10 * rem,
    borderRadius: 5 * rem,
    justifyContent: 'center',
    alignItems: 'center'
  },
  round1: {
    backgroundColor: 'rgba(255,255,255,0.54)',
    width: 7 * rem,
    height: 7 * rem,
    borderRadius: 3.5 * rem,
    justifyContent: 'center',
    alignItems: 'center'
  },
  round2: {
    backgroundColor: 'rgba(255,255,255,0.64)',
    width: 4 * rem,
    height: 4 * rem,
    borderRadius: 2 * rem,
    justifyContent: 'center',
    alignItems: 'center'
  },
  roundDark: {
    backgroundColor: 'rgba(98,98,98,0.15)',
    width: 10 * rem,
    height: 10 * rem,
    borderRadius: 5 * rem,
    justifyContent: 'center',
    alignItems: 'center'
  },
  round1Dark: {
    backgroundColor: 'rgba(98,98,98,0.45)',
    width: 7 * rem,
    height: 7 * rem,
    borderRadius: 3.5 * rem,
    justifyContent: 'center',
    alignItems: 'center'
  },
  round2Dark: {
    backgroundColor: 'rgba(98,98,98,0.6)',
    width: 4 * rem,
    height: 4 * rem,
    borderRadius: 2 * rem,
    justifyContent: 'center',
    alignItems: 'center'
  },
  ble: {
    width: 1.5 * rem,
    height: 1.5 * rem,
  },
  button: {
    backgroundColor: '#FFF',
    width: 12 * rem,
    height: 2.5 * rem,
    borderRadius: 1.25 * rem,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDark: {
    backgroundColor: '#262626',
    width: 9 * rem,
    height: 2.5 * rem,
    borderRadius: 0.5 * rem,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 0.65 * rem,
    color: '#01014A',
  },
  buttonTextDark: {
    fontSize: 0.65 * rem,
    color: '#D9D9D9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 0.7 * rem
  },
  lastText: {
    fontSize: 0.55 * rem,
    color: '#fff'
  },
  lastTextDark: {
    fontSize: 0.55 * rem,
    color: '#BFBFBF'
  },
  fridgeContain: {
    width: 13 * rem,
    // height: 4 * rem,
    alignItems: 'center',
  },
  bottom: {
    marginBottom: 2 * rem
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fridgeText: {
    fontSize: 0.5 * rem,
    color: '#01014A',
  },
  fridgeTextDark: {
    fontSize: 0.5 * rem,
    color: '#D9D9D9',
  },
  fridge: {
    width: 3.6 * rem,
    height: 3.6 * rem,
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: 0.5 * rem,
    marginHorizontal: 0.3 * rem,
    paddingHorizontal: 0.3 * rem,
    overflow: 'hidden',
  },
  fridgeDark: {
    width: 3.6 * rem,
    height: 3.6 * rem,
    backgroundColor: '#262626',
    borderRadius: 0.5 * rem,
    marginHorizontal: 0.3 * rem,
    paddingHorizontal: 0.3 * rem,
    overflow: 'hidden',
  },
  fridgeImg: {
    width: 1.5 * rem,
    height: 1.5 * rem,
    marginBottom: 0.5 * rem
  },
  lineDark: {
    borderBottomWidth: 1,
    borderColor: '#BFBFBF',
    borderStyle: 'solid'
  },
  line: {
    borderBottomWidth: 1,
    borderColor: '#fff',
    borderStyle: 'solid'
  }
});

export default connect(
  (state) => ({ //全局属性
    hasInfo: state.user.hasInfo,
    fridgeArr: state.user.fridgeArr,
    language: state.user.language,
    isSearch: state.user.isSearch,
    isConnect: state.user.isConnect,
    autoSearch: state.user.autoSearch,
    mode: state.user.mode,
  }),
  (dispatch) => ({ //传参改变全局属性
    setHasInfo: (tag) => dispatch(userAction.setHasInfo(tag)),
    setFridgeArr: (tag) => dispatch(userAction.setFridgeArr(tag)),
    setIsSearch: (tag) => dispatch(userAction.setIsSearch(tag)),
    setIsConnect: (tag) => dispatch(userAction.setIsConnect(tag)),
    setNowFridge: (tag) => dispatch(userAction.setNowFridge(tag)),
    setAutoSearch: (tag) => dispatch(userAction.setAutoSearch(tag)),
  })
)(search)