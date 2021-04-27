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
  Modal,
  FlatList
} from 'react-native';
import {
  connect
} from 'react-redux'; // 引入connect函数
import * as userAction from '../redux/action/userAction';
import Title from '../components/title';
import {
  resize_rem
} from '../common/CommonUtils';
import Styles from '../common/Styles';
import I18n from '../I18n/index.js';
import {
  UNIT_C,
  UNIT_F,
  UNIT_C_STR,
  UNIT_F_STR,
  TTrans,
  ParamLimit
} from '../service/FridgeData';
import FD from '../service/FridgeData';
import {
  goBack,
  goTo
} from '../common/common';
var {
  height,
  width
} = Dimensions.get('window');
var rem = resize_rem();
export class adSet extends Component {
  constructor() {
    super();
    this.state = {
      flag: false,
      title: '',
      data: [],
      fb: () => {},
      unit: ''
    };
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

  onStartDelay(num) {
    this.props.route.params.deviceSetOthers({
      startDelay: num
    });
    this.close();
  }

  onLeftRetDiff(num) {
    this.props.route.params.deviceSetOthers({
      leftRetDiff: num
    });
    this.close();
  }

  onLeftTCHalt(num) {
    this.props.route.params.deviceSetOthers({
      leftTCHalt: num
    });
    this.close();
  }

  onLeftTCHot(num) {
    this.props.route.params.deviceSetOthers({
      leftTCHot: num
    });
    this.close();
  }

  onLeftTCMid(num) {
    this.props.route.params.deviceSetOthers({
      leftTCMid: num
    });
    this.close();
  }

  onLeftTCCold(num) {
    this.props.route.params.deviceSetOthers({
      leftTCCold: num
    });
    this.close();
  }

  onRightRetDiff(num) {
    this.props.route.params.deviceSetOthers({
      rightRetDiff: num
    });
    this.close();
  }

  onRightTCHalt(num) {
    this.props.route.params.deviceSetOthers({
      rightTCHalt: num
    });
    this.close();
  }

  onRightTCHot(num) {
    this.props.route.params.deviceSetOthers({
      rightTCHot: num
    });
    this.close();
  }

  onRightTCMid(num) {
    this.props.route.params.deviceSetOthers({
      rightTCMid: num
    });
    this.close();
  }

  onRightTCCold(num) {
    this.props.route.params.deviceSetOthers({
      rightTCCold: num
    });
    this.close();
  }

  openModal(title, min, max, fb, unit) {
    let data = [];
    for (let i = min; i <= max; i++) {
      data.push(i);
    }
    this.setState({
      flag: true,
      title: title,
      fb: fb,
      data: data,
      unit: unit
    });
  }

  close() {
    this.setState({
      flag: false
    });
  }

  _keyExtractor = (item, index) => index.toString();

  _renderItem({
    item,
    index
  }) {
    return (
      <TouchableOpacity onPress={()=>this.state.fb(item)}>
        <Text style={[styles.modeText,index==this.state.data.length-1?{borderBottomWidth:0}:null]}>{item}{this.state.unit}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={{flex:1}}>
        {
          this.props.mode=='light'?
          <View style={{flex:1,backgroundColor: '#62AAE2'}}>
            <Modal visible={this.state.flag} animationType={'fade'} onRequestClose={()=>{}} transparent={true}>
              <TouchableOpacity style={styles.mode} onPress={()=>this.close()}>
                <View style={styles.modeContain}>
                  <Text style={styles.modeTitle}>{this.state.title}</Text>
                  <FlatList
                    data={this.state.data}
                    keyExtractor={this._keyExtractor}
                    // contentContainerStyle={styles.center}
                    renderItem={this._renderItem.bind(this)}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
            <Title title={I18n.t('advance')} mode={'light'} showLeft={true} showRight={false} goBack={()=>this.props.navigation.goBack()}/>
            <ScrollView style={styles.slide} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
              <View style={styles.root}>
                <View style={[styles.contain,{marginBottom:2*rem}]}>
                  <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramStartDelay'),ParamLimit.startDelayMin,ParamLimit.startDelayMax,this.onStartDelay.bind(this),'M')}>
                    <Text style={styles.buttonText}>{I18n.t('paramStartDelay')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.text}>{this.props.nowFridge.startDelay + ' M'}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramLeftRetDiff'),ParamLimit.leftRetDiffMin[this.props.nowFridge.unit],ParamLimit.leftRetDiffMax[this.props.nowFridge.unit],this.onLeftRetDiff.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                    <Text style={styles.buttonText}>{I18n.t('paramLeftRetDiff')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.text}>{this.props.nowFridge.leftRetDiff}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramLeftTCHalt'),ParamLimit.leftTCHaltMin[this.props.nowFridge.unit],ParamLimit.leftTCHaltMax[this.props.nowFridge.unit],this.onLeftTCHalt.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                    <Text style={styles.buttonText}>{I18n.t('paramLeftTCHalt')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.text}>{this.props.nowFridge.leftTCHalt}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramLeftTCHot'),ParamLimit.leftTCHotMin[this.props.nowFridge.unit],ParamLimit.leftTCHotMax[this.props.nowFridge.unit],this.onLeftTCHot.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                    <Text style={styles.buttonText}>{I18n.t('paramLeftTCHot')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.text}>{this.props.nowFridge.leftTCHot}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramLeftTCMid'),ParamLimit.leftTCMidMin[this.props.nowFridge.unit],ParamLimit.leftTCMidMax[this.props.nowFridge.unit],this.onLeftTCMid.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                    <Text style={styles.buttonText}>{I18n.t('paramLeftTCMid')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.text}>{this.props.nowFridge.leftTCMid}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={FD.rightEmpty(this.props.nowFridge) === false ? styles.buttonRow : styles.buttonRow1} onPress={()=>this.openModal(I18n.t('paramLeftTCCold'),ParamLimit.leftTCColdMin[this.props.nowFridge.unit],ParamLimit.leftTCColdMax[this.props.nowFridge.unit],this.onLeftTCCold.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                    <Text style={styles.buttonText}>{I18n.t('paramLeftTCCold')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.text}>{this.props.nowFridge.leftTCCold}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  {
                    FD.rightEmpty(this.props.nowFridge) === false ?
                    <View>
                      <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramRightRetDiff'),ParamLimit.rightRetDiffMin[this.props.nowFridge.unit],ParamLimit.rightRetDiffMax[this.props.nowFridge.unit],this.onRightRetDiff.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                        <Text style={styles.buttonText}>{I18n.t('paramRightRetDiff')}</Text>
                        <View style={styles.row}>
                          <Text style={styles.text}>{this.props.nowFridge.rightRetDiff}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                          <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramRightTCHalt'),ParamLimit.rightTCHaltMin[this.props.nowFridge.unit],ParamLimit.rightTCHaltMax[this.props.nowFridge.unit],this.onRightTCHalt.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                        <Text style={styles.buttonText}>{I18n.t('paramRightTCHalt')}</Text>
                        <View style={styles.row}>
                          <Text style={styles.text}>{this.props.nowFridge.rightTCHalt}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                          <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramRightTCHot'),ParamLimit.rightTCHotMin[this.props.nowFridge.unit],ParamLimit.rightTCHotMax[this.props.nowFridge.unit],this.onRightTCHot.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                        <Text style={styles.buttonText}>{I18n.t('paramRightTCHot')}</Text>
                        <View style={styles.row}>
                          <Text style={styles.text}>{this.props.nowFridge.rightTCHot}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                          <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonRow} onPress={()=>this.openModal(I18n.t('paramRightTCMid'),ParamLimit.rightTCMidMin[this.props.nowFridge.unit],ParamLimit.rightTCMidMax[this.props.nowFridge.unit],this.onRightTCMid.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                        <Text style={styles.buttonText}>{I18n.t('paramRightTCMid')}</Text>
                        <View style={styles.row}>
                          <Text style={styles.text}>{this.props.nowFridge.rightTCMid}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                          <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonRow1} onPress={()=>this.openModal(I18n.t('paramRightTCCold'),ParamLimit.rightTCColdMin[this.props.nowFridge.unit],ParamLimit.rightTCColdMax[this.props.nowFridge.unit],this.onRightTCCold.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                        <Text style={styles.buttonText}>{I18n.t('paramRightTCCold')}</Text>
                        <View style={styles.row}>
                          <Text style={styles.text}>{this.props.nowFridge.rightTCCold}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                          <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                        </View>
                      </TouchableOpacity>
                    </View>
                    :null
                  }
                </View>
              </View>
            </ScrollView>
          </View>
          :<View style={{flex:1,backgroundColor: '#121212'}}>
            <Modal visible={this.state.flag} animationType={'fade'} onRequestClose={()=>{}} transparent={true}>
              <TouchableOpacity style={styles.mode} onPress={()=>this.close()}>
                <View style={styles.modeContain}>
                  <Text style={styles.modeTitle}>{this.state.title}</Text>
                  <FlatList
                    data={this.state.data}
                    keyExtractor={this._keyExtractor}
                    // contentContainerStyle={styles.center}
                    renderItem={this._renderItem.bind(this)}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
            <Title title={I18n.t('advance')} mode={'dark'} showLeft={true} showRight={false} goBack={()=>this.props.navigation.goBack()}/>
            <ScrollView style={styles.slideDark} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
              <View style={styles.rootDark}>
                <View style={[styles.containDark,{marginBottom:2*rem}]}>
                  <TouchableOpacity style={styles.buttonRowDark} onPress={()=>this.openModal(I18n.t('paramStartDelay'),ParamLimit.startDelayMin,ParamLimit.startDelayMax,this.onStartDelay.bind(this),'M')}>
                    <Text style={styles.buttonTextDark}>{I18n.t('paramStartDelay')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.textDark}>{this.props.nowFridge.startDelay + ' M'}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonRowDark} onPress={()=>this.openModal(I18n.t('paramLeftRetDiff'),ParamLimit.leftRetDiffMin[this.props.nowFridge.unit],ParamLimit.leftRetDiffMax[this.props.nowFridge.unit],this.onLeftRetDiff.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                    <Text style={styles.buttonTextDark}>{I18n.t('paramLeftRetDiff')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.textDark}>{this.props.nowFridge.leftRetDiff}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonRowDark} onPress={()=>this.openModal(I18n.t('paramLeftTCHalt'),ParamLimit.leftTCHaltMin[this.props.nowFridge.unit],ParamLimit.leftTCHaltMax[this.props.nowFridge.unit],this.onLeftTCHalt.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                    <Text style={styles.buttonTextDark}>{I18n.t('paramLeftTCHalt')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.textDark}>{this.props.nowFridge.leftTCHalt}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonRowDark} onPress={()=>this.openModal(I18n.t('paramLeftTCHot'),ParamLimit.leftTCHotMin[this.props.nowFridge.unit],ParamLimit.leftTCHotMax[this.props.nowFridge.unit],this.onLeftTCHot.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                    <Text style={styles.buttonTextDark}>{I18n.t('paramLeftTCHot')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.textDark}>{this.props.nowFridge.leftTCHot}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonRowDark} onPress={()=>this.openModal(I18n.t('paramLeftTCMid'),ParamLimit.leftTCMidMin[this.props.nowFridge.unit],ParamLimit.leftTCMidMax[this.props.nowFridge.unit],this.onLeftTCMid.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                    <Text style={styles.buttonTextDark}>{I18n.t('paramLeftTCMid')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.textDark}>{this.props.nowFridge.leftTCMid}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={FD.rightEmpty(this.props.nowFridge) === false ? styles.buttonRowDark : styles.buttonRow1}  onPress={()=>this.openModal(I18n.t('paramLeftTCCold'),ParamLimit.leftTCColdMin[this.props.nowFridge.unit],ParamLimit.leftTCColdMax[this.props.nowFridge.unit],this.onLeftTCCold.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                    <Text style={styles.buttonTextDark}>{I18n.t('paramLeftTCCold')}</Text>
                    <View style={styles.row}>
                      <Text style={styles.textDark}>{this.props.nowFridge.leftTCCold}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                      <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                    </View>
                  </TouchableOpacity>
                  {
                    FD.rightEmpty(this.props.nowFridge) === false ?
                    <View>
                      <TouchableOpacity style={styles.buttonRowDark} onPress={()=>this.openModal(I18n.t('paramRightRetDiff'),ParamLimit.rightRetDiffMin[this.props.nowFridge.unit],ParamLimit.rightRetDiffMax[this.props.nowFridge.unit],this.onRightRetDiff.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                        <Text style={styles.buttonTextDark}>{I18n.t('paramRightRetDiff')}</Text>
                        <View style={styles.row}>
                          <Text style={styles.textDark}>{this.props.nowFridge.rightRetDiff}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                          <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonRowDark} onPress={()=>this.openModal(I18n.t('paramRightTCHalt'),ParamLimit.rightTCHaltMin[this.props.nowFridge.unit],ParamLimit.rightTCHaltMax[this.props.nowFridge.unit],this.onRightTCHalt.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                        <Text style={styles.buttonTextDark}>{I18n.t('paramRightTCHalt')}</Text>
                        <View style={styles.row}>
                          <Text style={styles.textDark}>{this.props.nowFridge.rightTCHalt}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                          <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonRowDark} onPress={()=>this.openModal(I18n.t('paramRightTCHot'),ParamLimit.rightTCHotMin[this.props.nowFridge.unit],ParamLimit.rightTCHotMax[this.props.nowFridge.unit],this.onRightTCHot.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                        <Text style={styles.buttonTextDark}>{I18n.t('paramRightTCHot')}</Text>
                        <View style={styles.row}>
                          <Text style={styles.textDark}>{this.props.nowFridge.rightTCHot}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                          <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonRowDark} onPress={()=>this.openModal(I18n.t('paramRightTCMid'),ParamLimit.rightTCMidMin[this.props.nowFridge.unit],ParamLimit.rightTCMidMax[this.props.nowFridge.unit],this.onRightTCMid.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                        <Text style={styles.buttonTextDark}>{I18n.t('paramRightTCMid')}</Text>
                        <View style={styles.row}>
                          <Text style={styles.textDark}>{this.props.nowFridge.rightTCMid}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                          <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonRow1} onPress={()=>this.openModal(I18n.t('paramRightTCCold'),ParamLimit.rightTCColdMin[this.props.nowFridge.unit],ParamLimit.rightTCColdMax[this.props.nowFridge.unit],this.onRightTCCold.bind(this),this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR)}>
                        <Text style={styles.buttonTextDark}>{I18n.t('paramRightTCCold')}</Text>
                        <View style={styles.row}>
                          <Text style={styles.textDark}>{this.props.nowFridge.rightTCCold}{this.props.nowFridge.unit == UNIT_C ? UNIT_C_STR : UNIT_F_STR}</Text>
                          <Image style={styles.arrow} source={require('../res/left_button.png')} resizeMode={'contain'}/>
                        </View>
                      </TouchableOpacity>
                    </View>
                    :null
                  }
                </View>
              </View>
            </ScrollView>
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
    // alignItems: 'center',
    backgroundColor: '#f7f7f7'
  },
  root: {
    flex: 1,
    width: width,
    backgroundColor: '#f7f7f7',
    alignItems: 'center'
  },
  slideDark: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#121212'
  },
  rootDark: {
    flex: 1,
    width: width,
    backgroundColor: '#121212',
    alignItems: 'center'
  },
  contain: {
    backgroundColor: '#fff',
    borderRadius: 0.3 * rem,
    width: 15 * rem,
    padding: 0.5 * rem,
    paddingTop: 0,
    marginTop: 1 * rem
  },
  containDark: {
    backgroundColor: '#262626',
    borderRadius: 0.3 * rem,
    width: 15 * rem,
    padding: 0.5 * rem,
    paddingTop: 0,
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
    mode: state.user.mode,
  }),
  (dispatch) => ({ //传参改变全局属性
    setUserInfo: (tag) => dispatch(userAction.setUserInfo(tag)),
  })
)(adSet)