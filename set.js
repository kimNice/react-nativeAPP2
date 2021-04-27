import React, {
  Component,
} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  ImageBackground,
  Image,
  Dimensions,
  ScrollView,
  Linking,
  Modal,
  FlatList
} from 'react-native';
import {
  UNIT_C,
  UNIT_F,
  UNIT_C_STR,
  UNIT_F_STR,
  TTrans,
  ParamLimit
} from '../service/FridgeData';
import {
  Picker
} from '@react-native-community/picker';
import {
  connect
} from 'react-redux'; // 引入connect函数
import * as userAction from '../redux/action/userAction';
import Title from '../components/title';
import {
  resize_rem
} from '../common/CommonUtils';
import Styles from '../common/Styles';
import {
  goBack,
  goTo
} from '../common/common';
import I18n from '../I18n/index.js';
var {
  height,
  width
} = Dimensions.get('window');
var rem = resize_rem();
export class set extends Component {
  constructor() {
    super();
    this.state = {
      langs: [],
      langsFlag: false,
      flag: false,
      title: '',
      data: [],
      fb: () => {}
    };
  }

  componentDidMount() {
    this.getLangs();
    this.listener();
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
      }
    });
  }

  getLangs() {
    let objLangs = I18n.getLocales();

    console.log("获取语言", objLangs)
    this.setState({
      langs: objLangs
    });
    // Object.keys(objLangs).forEach(key => {
    //   langs.push(
    //     <Picker.Item key={key} label={objLangs[key]} value={key}/>
    //   );
    // });
    // return langs;
  }

  link(tag) {
    if (tag == 'url') {
      Linking.openURL('http://www.alpicool.com/').catch(err => console.error('An error occurred', err));
    } else if (tag == 'tel') {
      Linking.openURL('tel:400-800-3613').catch(err => console.error('An error occurred', err));
    }
  }

  openModal(title, min, max, fb) {
    let data = [];
    for (let i = min; i <= max; i++) {
      data.push(i);
    }
    this.setState({
      flag: true,
      title: title,
      fb: fb,
      data: data
    });
  }

  openLangs() {
    this.setState({
      langsFlag: true
    });
  }

  closeLangs() {
    this.setState({
      langsFlag: false
    });
  }

  close() {
    this.setState({
      flag: false
    });
  }

  setLanguage(label) {
    console.log(label)
    I18n.setLocale(label);
    this.props.setLanguage(label);
    this.closeLangs();
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
    this.props.route.params.changUnit(cfg);
    this.props.route.params.deviceSetOthers(cfg);
  }

  onTemMax(num) {
    this.props.route.params.deviceSetOthers({
      tempMax: num
    });
    this.close();
  }

  onTemMin(num) {
    this.props.route.params.deviceSetOthers({
      tempMin: num
    });
    this.close();
  }

  resize() {
    this.props.route.params.deviceReset().then(() => {
      this.props.setResizeFlag(true);
      this.timer3 = setTimeout(() => { //缓冲时间
        this.props.navigation.goBack();
      }, 500);
    });
  }

  _keyExtractor = (item, index) => index.toString();

  _renderItem({
    item,
    index
  }) {
    return (
      <TouchableOpacity onPress={()=>this.setLanguage(item.label)}>
        <Text style={[styles.modeText,index==this.state.langs.length-1?{borderBottomWidth:0}:null]}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  _renderItem1({
    item,
    index
  }) {
    return (
      <TouchableOpacity onPress={()=>this.state.fb(item)}>
        <Text style={[styles.modeText,index==this.state.data.length-1?{borderBottomWidth:0}:null]}>{item}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={{flex:1}}>
          <View style={{flex:1}}>
            <Modal visible={this.state.langsFlag} animationType={'fade'} onRequestClose={()=>{}} transparent={true}>
              <TouchableOpacity style={styles.mode} onPress={()=>this.closeLangs()}>
                <View style={styles.modeContain}>
                  <Text style={styles.modeTitle}>{I18n.t('setLanguage')}</Text>
                  <FlatList
                    data={this.state.langs}
                    keyExtractor={this._keyExtractor}
                    // contentContainerStyle={styles.center}
                    renderItem={this._renderItem.bind(this)}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
            <Modal visible={this.state.flag} animationType={'fade'} onRequestClose={()=>{}} transparent={true}>
              <TouchableOpacity style={styles.mode} onPress={()=>this.close()}>
                <View style={styles.modeContain}>
                  <Text style={styles.modeTitle}>{this.state.title}</Text>
                  <FlatList
                    data={this.state.data}
                    keyExtractor={this._keyExtractor}
                    // contentContainerStyle={styles.center}
                    renderItem={this._renderItem1.bind(this)}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
            <ImageBackground style={styles.root} source={require('../res/setBg.png')} resizeMode={'cover'}>
              <Title title={I18n.t('set')} mode={'light'} showLeft={true} showRight={false} goBack={()=>this.props.navigation.goBack()}/>
              <ScrollView style={styles.slide} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                <View style={styles.root}>
                  <View style={styles.contain}>
                    
                    {
                      /*<Text style={styles.title}>{I18n.t('generalSettings')}</Text>
                        <TouchableOpacity style={styles.buttonRow} onPress={()=>this.onUnitSwitch()}>
                          <Text style={styles.buttonText}>{I18n.t('toggleTem')}</Text>

                          <View style={styles.row}>
                            <Text style={styles.text}>{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                            <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramTempMax'),1,ParamLimit.tempMax[this.props.nowFridge.unit],this.onTemMax.bind(this))}>
                          <Text style={styles.buttonText}>{I18n.t('paramTempMax')}</Text>
                          <View style={styles.row}>
                            <Text style={styles.text}>{this.props.nowFridge.tempMax}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                            <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramTempMax'),ParamLimit.tempMin[this.props.nowFridge.unit],0,this.onTemMin.bind(this))}>
                          <Text style={styles.buttonText}>{I18n.t('paramTempMin')}</Text>
                          <View style={styles.row}>
                            <Text style={styles.text}>{this.props.nowFridge.tempMin}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                            <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                          </View>
                        </TouchableOpacity>
                         <TouchableOpacity style={styles.buttonRow} onPress={()=>{goTo(this,'adSet',this.props.route.params)}}>
                          <Text style={styles.buttonText}>{I18n.t('advance')}</Text>
                          <View style={styles.row}>
                            <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonRow1} onPress={()=>this.resize()}>
                          <Text style={styles.buttonText}>{I18n.t('reset')}</Text>
                          <View style={styles.row}>
                            <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                          </View>
                        </TouchableOpacity> 
                      */
                    }
                    
                    
                    
                    <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openLangs()}>
                      <Text style={styles.buttonText}>{I18n.t('setLanguage')}</Text>
                      <View style={styles.row}>
                        <Text style={styles.text}>{I18n.t('nowLanguage')}</Text>
                        <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                      </View>
                    </TouchableOpacity>
                   
                  </View>
                  {
                    /*
                      <View style={[styles.contain,{marginBottom:2*rem}]}>
                        <Text style={styles.title}>{I18n.t('about')}</Text>
                        <TouchableOpacity style={styles.buttonRow} onPress={()=>this.link('url')}>
                          <Text style={styles.buttonText}>{I18n.t('web')}</Text>
                          <View style={styles.row}>   
                            <Text style={styles.text}>www.alpicool.com</Text>
                            <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.buttonRow,{display:'none'}]} onPress={()=>{goTo(this,'secret')}}>
                          {
                            this.props.language.length>0?
                            <Text style={styles.buttonText}>{this.props.language.toLowerCase().indexOf('zh') > -1  ? '用户协议与隐私政策' : 'User Agreement and Privacy Policy'}</Text>
                            :<Text style={styles.buttonText}>{I18n.locale.toLowerCase().indexOf('zh') > -1  ? '用户协议与隐私政策' : 'User Agreement and Privacy Policy'}</Text>
                          }
                          <View style={styles.row}>
                            <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonRow} onPress={()=>this.link('tel')}>
                          <Text style={styles.buttonText}>{I18n.t('tel')}</Text>
                          <View style={styles.row}>
                            <Text style={styles.text}>400-800-3613</Text>
                            <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                          </View>
                        </TouchableOpacity>
                        <View style={styles.buttonRow1}>
                          <Text style={styles.buttonText}>{I18n.t('app')}</Text>
                          <View style={styles.row}>
                            <Text style={styles.text}>{I18n.t('currentVersion')}2.0.2</Text>
                          </View>
                        </View>
                      </View>
                    */
                  }
                  
                </View>
              </ScrollView>
            </ImageBackground>
            
          </View>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#f7f7f7'
  },
  slideDark: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#121212'
  },
  root: {
    flex: 1,
    width: width,
    // backgroundColor: '#f7f7f7',
    alignItems: 'center'
  },
  rootDark: {
    flex: 1,
    width: width,
    backgroundColor: '#121212',
    alignItems: 'center'
  },
  contain: {
    // backgroundColor: '#fff',
    borderRadius: 0.3 * rem,
    width: 15 * rem,
    padding: 0.5 * rem,
    marginTop: 1 * rem
  },
  containDark: {
    backgroundColor: '#262626',
    borderRadius: 0.3 * rem,
    width: 15 * rem,
    padding: 0.5 * rem,
    marginTop: 1 * rem
  },
  title: {
    color: '#BCBCBC',
    fontWeight: 'bold',
    fontSize: 0.6 * rem,
    paddingBottom: 0.5 * rem,
    borderBottomWidth: 1,
    borderColor: '#f7f7f7'
  },
  titleDark: {
    color: '#F7F7F7',
    fontWeight: 'bold',
    fontSize: 0.6 * rem,
    paddingBottom: 0.5 * rem,
    borderBottomWidth: 1,
    borderColor: '#404040'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 0.5 * rem,
    borderBottomWidth: 1,
    borderColor: '#f7f7f7'
  },
  buttonRowDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 0.5 * rem,
    borderBottomWidth: 1,
    borderColor: '#404040'
  },
  buttonRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 0.5 * rem,
  },
  buttonText: {
    color: '#222',
    fontSize: 0.55 * rem
  },
  buttonTextDark: {
    color: '#F7F7F7',
    fontSize: 0.55 * rem
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  arrow: {
    width: 0.6 * rem,
    height: 0.6 * rem,
    marginLeft: 0.5 * rem
  },
  text: {
    fontSize: 0.55 * rem,
    color: '#999999'
  },
  textDark: {
    fontSize: 0.55 * rem,
    color: '#BFBFBF'
  },
  mode: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modeTitle: {
    fontSize: 0.6 * rem,
    width: 12 * rem,
    color: '#222',
    fontWeight: 'bold',
    paddingVertical: 0.4 * rem,
    borderBottomWidth: 1,
    borderColor: '#F1F1F1',
    textAlign: 'center'
  },
  modeText: {
    fontSize: 0.55 * rem,
    width: 12 * rem,
    color: '#222',
    paddingVertical: 0.7 * rem,
    borderBottomWidth: 1,
    borderColor: '#F1F1F1',
    textAlign: 'center'
  },
  buttonContain: {
    width: 12 * rem,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    fontSize: 0.6 * rem,
    color: '#fff',
    paddingVertical: 0.3 * rem,
    paddingHorizontal: 1.5 * rem,
    borderRadius: 0.5 * rem,
    borderWidth: 1,
    borderColor: '#fff'
  },
  picker: {
    width: 10 * rem,
    height: 4 * rem,
    // color: '#fff',
    marginVertical: 2 * rem
  },
  modeContain: {
    backgroundColor: '#fff',
    width: 12 * rem,
    maxHeight: 12 * rem,
    // justifyContent: 'center',
    alignItems: 'center'
  }
});

export default connect(
  (state) => ({ //全局属性
    hasInfo: state.user.hasInfo,
    language: state.user.language,
    nowFridge: state.user.nowFridge,
    resizeFlag: state.user.resizeFlag,
    mode: state.user.mode,
  }),
  (dispatch) => ({ //传参改变全局属性
    setUserInfo: (tag) => dispatch(userAction.setUserInfo(tag)),
    setLanguage: (tag) => dispatch(userAction.setLanguage(tag)),
    setResizeFlag: (tag) => dispatch(userAction.setResizeFlag(tag)),
  })
)(set)