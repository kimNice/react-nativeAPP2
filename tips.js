import React, {
  Component,
} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  ImageBackground,
  Image
} from 'react-native';
import {
  connect
} from 'react-redux'; // 引入connect函数
import * as userAction from '../redux/action/userAction';
import Swiper from 'react-native-swiper';
import Title from '../components/title';
import I18n from '../I18n/index.js';
import {
  resize_rem
} from '../common/CommonUtils';
import Styles from '../common/Styles';
import {
  CommonActions
} from '@react-navigation/native';
import {
  goBack,
  goTo
} from '../common/common';
var rem = resize_rem();
export class tips extends Component {
  constructor() {
    super();
    this.state = {};
  }

  _activeDot() {
    return (
      <View style={this.props.mode=='light'?styles.pointItem1:styles.pointItem1Dark}></View>
    );
  }

  _dot() {
    return (
      <View style={this.props.mode=='light'?styles.pointItem:styles.pointItemDark}></View>
    );
  }

  componentDidMount() {
    this.listener();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  listener() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      if (this.props.language && this.props.language != '') {
        I18n.setLocale(this.props.language);
      } else if (I18n.locale.indexOf('zh-Hans') > -1 || I18n.locale == 'zh-CN') {
        I18n.setLocale('zh-CN');
      } else if (I18n.locale.indexOf('zh-') > -1) {
        I18n.setLocale('zh-TW');
      }
    });
  }

  resize() { //重置路由状态
    this.props.setAutoSearch(true);
    this.props.setHasInfo(null);
    this.props.route.params.deviceDisconnect().then(() => { //断开连接
      console.log('disconnect first, and it return.');
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{
            name: 'login'
          }],
        })
      );
    }).catch(err => {
      console.log('disconnect first, but failed:', err);
    });
  }

  render() {
    return (
      <View style={{flex:1}}>
        {
          this.props.mode=='light'?
          <View style={styles.slide}>
            <Title title={I18n.t('help')} mode={'light'} showLeft={true} showRight={false} goBack={()=>this.props.navigation.goBack()}/>
            <Swiper style={styles.wrapper} loop={false} paginationStyle={{bottom: 2*rem}} activeDot={this._activeDot()} dot={this._dot()}>
              <View style={[styles.slide,{paddingLeft:2*rem,paddingRight:2*rem}]}>
                <Image style={styles.bg} source={require('../res/tip1.png')} resizeMode={'contain'}/>
                <View style={styles.title}>
                  <View style={styles.round}>
                    <Text style={styles.roundText}>1</Text>
                  </View>
                  <Text style={styles.roundText1}>{I18n.t('helpTitle1')}</Text>
                </View>
                <Text style={styles.text}>{I18n.t('helpTips1')}</Text>
                <Text style={styles.text}>{I18n.t('helpTips2')}</Text>
              </View>
              <View style={[styles.slide,{paddingLeft:2*rem,paddingRight:2*rem}]}>
                <Image style={styles.bg} source={require('../res/tip2.png')} resizeMode={'contain'}/>
                <View style={styles.title}>
                  <View style={styles.round}>
                    <Text style={styles.roundText}>2</Text>
                  </View>
                  <Text style={styles.roundText1}>{I18n.t('helpTitle2')}</Text>
                </View>
                <Text style={styles.text}>{I18n.t('helpTips3')}</Text>
                <Text style={styles.text}>{I18n.t('helpTips4')}</Text>
                <TouchableOpacity style={styles.button} onPress={()=>this.resize()}>
                  <Text style={styles.buttonText}>{I18n.t('search')}</Text>
                </TouchableOpacity>
              </View>
            </Swiper>
          </View>
          :<View style={styles.slideDark}>
            <Title title={I18n.t('help')} mode={'dark'} showLeft={true} showRight={false} goBack={()=>this.props.navigation.goBack()}/>
            <Swiper style={styles.wrapper} loop={false} paginationStyle={{bottom: 2*rem}} activeDot={this._activeDot()} dot={this._dot()}>
              <View style={[styles.slideDark,{paddingLeft:2*rem,paddingRight:2*rem}]}>
                <Image style={styles.bg} source={require('../res/tip1Dark.png')} resizeMode={'contain'}/>
                <View style={styles.title}>
                  <View style={styles.roundDark}>
                    <Text style={styles.roundTextDark}>1</Text>
                  </View>
                  <Text style={styles.roundText1}>{I18n.t('helpTitle1')}</Text>
                </View>
                <Text style={styles.textDark}>{I18n.t('helpTips1')}</Text>
                <Text style={styles.textDark}>{I18n.t('helpTips2')}</Text>
              </View>
              <View style={[styles.slideDark,{paddingLeft:2*rem,paddingRight:2*rem}]}>
                <Image style={styles.bg} source={require('../res/tip2Dark.png')} resizeMode={'contain'}/>
                <View style={styles.title}>
                  <View style={styles.roundDark}>
                    <Text style={styles.roundTextDark}>2</Text>
                  </View>
                  <Text style={styles.roundText1}>{I18n.t('helpTitle2')}</Text>
                </View>
                <Text style={styles.textDark}>{I18n.t('helpTips3')}</Text>
                <Text style={styles.textDark}>{I18n.t('helpTips4')}</Text>
                <TouchableOpacity style={styles.buttonDark} onPress={()=>this.resize()}>
                  <Text style={styles.buttonTextDark}>{I18n.t('search')}</Text>
                </TouchableOpacity>
              </View>
            </Swiper>
          </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#62AAE2'
  },
  slideDark: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212'
  },
  pointItem: {
    width: 0.4 * rem,
    height: 0.4 * rem,
    borderRadius: 0.2 * rem,
    borderWidth: 1,
    borderColor: '#fff',
    marginRight: 0.4 * rem
  },
  pointItem1: {
    width: 0.4 * rem,
    height: 0.4 * rem,
    borderRadius: 0.2 * rem,
    backgroundColor: '#F7F7F7',
    marginRight: 0.4 * rem
  },
  pointItemDark: {
    width: 0.4 * rem,
    height: 0.4 * rem,
    borderRadius: 0.2 * rem,
    borderWidth: 1,
    borderColor: '#404040',
    marginRight: 0.4 * rem
  },
  pointItem1Dark: {
    width: 0.4 * rem,
    height: 0.4 * rem,
    borderRadius: 0.2 * rem,
    backgroundColor: '#404040',
    marginRight: 0.4 * rem
  },
  bg: {
    width: 14 * rem,
    height: 9 * rem,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2 * rem
  },
  round: {
    width: 1 * rem,
    height: 1 * rem,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0.5 * rem,
    backgroundColor: '#fff',
    marginRight: 0.6 * rem
  },
  roundText: {
    fontSize: 0.6 * rem,
    color: '#0061AC',
    fontWeight: 'bold'
  },
  roundDark: {
    width: 1 * rem,
    height: 1 * rem,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0.5 * rem,
    backgroundColor: '#262626',
    marginRight: 0.6 * rem
  },
  roundTextDark: {
    fontSize: 0.6 * rem,
    color: '#fff',
    fontWeight: 'bold'
  },
  roundText1: {
    fontSize: 0.7 * rem,
    color: '#fff',
    fontWeight: 'bold'
  },
  text: {
    fontSize: 0.65 * rem,
    color: '#fff',
    marginVertical: 0.3 * rem,
    lineHeight: 1 * rem
  },
  textDark: {
    fontSize: 0.65 * rem,
    color: '#D9D9D9',
    marginVertical: 0.3 * rem,
    lineHeight: 1 * rem
  },
  button: {
    backgroundColor: 'rgba(0, 97, 172, 0.3)',
    width: 9 * rem,
    height: 2.5 * rem,
    borderRadius: 0.5 * rem,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5 * rem
  },
  buttonText: {
    fontSize: 0.65 * rem,
    color: '#fff',
  },
  buttonDark: {
    backgroundColor: '#262626',
    width: 9 * rem,
    height: 2.5 * rem,
    borderRadius: 0.5 * rem,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5 * rem
  },
  buttonTextDark: {
    fontSize: 0.65 * rem,
    color: '#D9D9D9',
  },
});

export default connect(
  (state) => ({ //全局属性
    hasInfo: state.user.hasInfo,
    language: state.user.language,
    mode: state.user.mode,
  }),
  (dispatch) => ({ //传参改变全局属性
    setUserInfo: (tag) => dispatch(userAction.setUserInfo(tag)),
    setAutoSearch: (tag) => dispatch(userAction.setAutoSearch(tag)),
    setHasInfo: (tag) => dispatch(userAction.setHasInfo(tag)),
  })
)(tips)