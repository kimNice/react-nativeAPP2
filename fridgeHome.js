import React, {
  Component,
} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  Dimensions,
  Platform
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
import {
  CommonActions
} from '@react-navigation/native';
import I18n from '../I18n/index.js';
import AwesomeAlert from 'react-native-awesome-alerts';
import Title from '../components/title';
var {
  height,
  width
} = Dimensions.get('window');
var rem = resize_rem();
const STATUS_BAR_HEIGHT = (Platform.OS === 'ios' ? 1.1 * rem : 0.5 * rem);
export class fridgeHome extends Component {
  constructor() {
    super();
    this.state = {
      flag: false
    };
  }

  componentDidMount() {
    this.listener();
    this.props.setIsConnect(0); //防止进页面出现弹框
  }

  componentWillUnmount() {
    this._unsubscribe();
    this.timer3 && clearTimeout(this.timer3);
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

  setFlag() {
    this.setState({
      flag: true
    });
    this.timerFlag = setTimeout(() => {
      this.setState({
        flag: false
      }, () => this.timerFlag && clearTimeout(this.timerFlag));
    }, 600);
  }

  deviceConnect(item) {
    this.setFlag();

    if (item.id == this.props.hasInfo.id) {
      Toust(I18n.t('connect'));
      return;
    }

    this.props.route.params.deviceDisconnect();
    this.props.route.params.stopReadTimer();
    this.props.setHasInfo(null);

    this.props.route.params.deviceConnect(item.id).then(result => {
      console.log('绑定结果', result);
      if (result > 0) {
        this.props.setHasInfo(item);
        this.props.route.params.startReadTimer();
        this.props.setChangeFridge(true);
        this.timer3 = setTimeout(() => { //缓冲时间
          this.props.setIsConnect(0);
          this.props.navigation.goBack()
        }, 1000);
      } else {
        this.props.route.params.deviceDisconnect(); //断开设备      
        this.timer3 = setTimeout(() => { //缓冲时间
          this.props.setIsConnect(0);
          this.props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{
                name: 'login'
              }],
            })
          );
        }, 1000);
      }
    }).catch(err => {
      this.props.setIsConnect(0);
      this.props.route.params.deviceDisconnect(); //断开设备
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{
            name: 'login'
          }],
        })
      );
    });
  }

  resize() { //重置路由状态
    this.props.setHasInfo(null);
    this.props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{
          name: 'login'
        }],
      })
    );
  }

  _renderItem({
    item,
    index
  }) {
    return (
      <View>
        {
          this.props.mode=='light'?
          <TouchableOpacity disabled={this.state.flag} style={[styles.fridge,index%2==0?{marginRight:0.5*rem}:null]} onPress={()=>this.deviceConnect(item)}>
            <Image style={styles.fridgeImg} resizeMode={'contain'} source={require('../res/fridge.png')}/>
            {
              this.props.hasInfo!=null&&item.id == this.props.hasInfo.id?
              <Text style={[styles.fridgeText,{color:'#62AAE2'}]} numberOfLines={1}>{item.name}</Text>
              :<Text style={styles.fridgeText} numberOfLines={1}>{item.name}</Text>
            }
            {
              this.props.hasInfo!=null&&item.id == this.props.hasInfo.id?
              <View style={styles.row}>
                <Image style={styles.link} resizeMode={'contain'} source={require('../res/linking.png')}/>
                <Text style={[styles.linkText,{color:'#62AAE2'}]}>{I18n.t('connect')}</Text>
              </View>
              :<View style={styles.row}>
                <Image style={styles.link} resizeMode={'contain'} source={require('../res/unlinking.png')}/>
                <Text style={styles.linkText}>{I18n.t('noConnect')}</Text>
              </View>
            }
          </TouchableOpacity>
          :<TouchableOpacity disabled={this.state.flag} style={[styles.fridgeDark,index%2==0?{marginRight:0.5*rem}:null]} onPress={()=>this.deviceConnect(item)}>
            <Image style={styles.fridgeImg} resizeMode={'contain'} source={require('../res/fridge.png')}/>
            {
              this.props.hasInfo!=null&&item.id == this.props.hasInfo.id?
              <Text style={[styles.fridgeTextDark,{color:'#62AAE2'}]} numberOfLines={1}>{item.name}</Text>
              :<Text style={styles.fridgeTextDark} numberOfLines={1}>{item.name}</Text>
            }
            {
              this.props.hasInfo!=null&&item.id == this.props.hasInfo.id?
              <View style={styles.row}>
                <Image style={styles.link} resizeMode={'contain'} source={require('../res/linking.png')}/>
                <Text style={[styles.linkTextDark,{color:'#62AAE2'}]}>{I18n.t('connect')}</Text>
              </View>
              :<View style={styles.row}>
                <Image style={styles.link} resizeMode={'contain'} source={require('../res/unlinking.png')}/>
                <Text style={styles.linkTextDark}>{I18n.t('noConnect')}</Text>
              </View>
            }
          </TouchableOpacity>
        }
      </View>
    );
  }

  _ListFooterComponent() {
    return (
      <View>
        {
          this.props.mode=='light'?
          <View style={styles.list}>
            <TouchableOpacity style={styles.buttonContain} onPress={()=>this.resize()}>
              <Image style={styles.button} resizeMode={'contain'} source={require('../res/add.png')}/>
              <Text style={styles.buttonText}>{I18n.t('add')}</Text>
            </TouchableOpacity>
          </View>
          :<View style={styles.list}>
            <TouchableOpacity style={styles.buttonContainDark} onPress={()=>this.resize()}>
              <Image style={styles.buttonDark} resizeMode={'contain'} source={require('../res/add.png')}/>
              <Text style={styles.buttonTextDark}>{I18n.t('add')}</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }

  _keyExtractor = (item, index) => index.toString();

  render() {
    return (
      <View style={{flex:1}}>
        {
          this.props.mode=='light'?
          <View style={styles.slide}>
            <Title title={I18n.t('myFridge')} mode={'light'} showLeft={true} showRight={false} goBack={()=>this.props.navigation.goBack()}/>
            <FlatList
              style={{flex:1}}
              data={this.props.fridgeArr}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem.bind(this)}
              ListFooterComponent={this._ListFooterComponent.bind(this)}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              numColumns={2}
            />
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
          </View>
          :<View style={styles.slideDark}>
            <Title title={I18n.t('myFridge')} mode={'dark'} showLeft={true} showRight={false} goBack={()=>this.props.navigation.goBack()}/>
            <FlatList
              style={{flex:1}}
              data={this.props.fridgeArr}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem.bind(this)}
              ListFooterComponent={this._ListFooterComponent.bind(this)}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              numColumns={2}
            />
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
          </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    position: 'relative'
  },
  slideDark: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
    position: 'relative'
  },
  list: {
    // width: width,
    marginTop: 3 * rem,
    alignItems: 'center',
  },
  fridge: {
    padding: 0.5 * rem,
    marginTop: 0.5 * rem,
    backgroundColor: '#fff',
    borderRadius: 0.3 * rem,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fridgeDark: {
    padding: 0.5 * rem,
    marginTop: 0.5 * rem,
    backgroundColor: '#161616',
    borderRadius: 0.3 * rem,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fridgeImg: {
    width: 1.5 * rem,
    height: 1.5 * rem
  },
  fridgeText: {
    width: 6 * rem,
    paddingVertical: 0.3 * rem,
    marginVertical: 0.5 * rem,
    backgroundColor: '#F7F7F7',
    textAlign: 'center',
    borderRadius: 0.3 * rem,
    fontSize: 0.6 * rem,
    color: '#222222',
    fontWeight: 'bold'
  },
  fridgeTextDark: {
    width: 6 * rem,
    paddingVertical: 0.3 * rem,
    marginVertical: 0.5 * rem,
    backgroundColor: '#404040',
    textAlign: 'center',
    borderRadius: 0.3 * rem,
    fontSize: 0.6 * rem,
    color: '#BFBFBF',
    fontWeight: 'bold'
  },
  buttonContain: {
    width: 8 * rem,
    height: 2 * rem,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 0.3 * rem
  },
  buttonContainDark: {
    width: 8 * rem,
    height: 2 * rem,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderRadius: 0.3 * rem
  },
  button: {
    width: 1 * rem,
    height: 1 * rem,
    marginRight: 0.5 * rem
  },
  buttonDark: {
    width: 1 * rem,
    height: 1 * rem,
    marginRight: 0.5 * rem,
    tintColor: '#BFBFBF'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: 6 * rem,
  },
  link: {
    width: 0.7 * rem,
    height: 0.7 * rem,
    marginRight: 0.5 * rem
  },
  linkText: {
    fontSize: 0.6 * rem,
    color: '#999999'
  },
  linkTextDark: {
    fontSize: 0.6 * rem,
    color: '#BFBFBF'
  },
  buttonText: {
    fontSize: 0.65 * rem,
    color: '#62AAE2'
  },
  buttonTextDark: {
    fontSize: 0.65 * rem,
    color: '#BFBFBF'
  }
});

export default connect(
  (state) => ({ //全局属性
    hasInfo: state.user.hasInfo,
    language: state.user.language,
    fridgeArr: state.user.fridgeArr,
    isConnect: state.user.isConnect,
    mode: state.user.mode,
  }),
  (dispatch) => ({ //传参改变全局属性
    setUserInfo: (tag) => dispatch(userAction.setUserInfo(tag)),
    setHasInfo: (tag) => dispatch(userAction.setHasInfo(tag)),
    setAutoSearch: (tag) => dispatch(userAction.setAutoSearch(tag)),
    setIsConnect: (tag) => dispatch(userAction.setIsConnect(tag)),
    setChangeFridge: (tag) => dispatch(userAction.setChangeFridge(tag)),
  })
)(fridgeHome)