import React, {
  Component,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import {
  connect,
} from 'react-redux';
import I18n from '../I18n/index.js';
import {
  resize_rem
} from '../common/CommonUtils';
var rem = resize_rem();

var {
  height,
  width
} = Dimensions.get('window');

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  title: {
    width: width,
    height: Platform.OS === 'ios' ? 4.5 * rem : 2 * rem,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 1 * rem
  },
  titleText: {
    fontSize: 0.65 * rem,
    color: '#000',
    fontWeight: 'bold'
  },
  titleTextDark: {
    fontSize: 0.65 * rem,
    color: '#F7F7F7',
    fontWeight: 'bold'
  },
  goBack: {
    // width: S.wScale(55),
    // height: S.wScale(35),
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButton: {
    width: 0.5 * rem,
    height: 0.5 * rem,
    borderTopWidth: 0.1 * rem,
    borderLeftWidth: 0.1 * rem,
    borderStyle: 'solid',
    borderColor: '#000',
    transform: [{
      rotate: '-45deg'
    }]
  },
  backButtonDark: {
    width: 0.5 * rem,
    height: 0.5 * rem,
    borderTopWidth: 0.1 * rem,
    borderLeftWidth: 0.1 * rem,
    borderStyle: 'solid',
    borderColor: '#737373',
    transform: [{
      rotate: '-45deg'
    }]
  },
  context: {
    paddingHorizontal: 1 * rem,
  },
  contextText: {
    fontSize: 0.6 * rem,
    color: '#333',
    marginBottom: 1 * rem
  },
  contextTextDark: {
    fontSize: 0.6 * rem,
    color: '#F7F7F7',
    marginBottom: 1 * rem
  },
  bold: {
    color: '#000',
    fontWeight: 'bold'
  },
  bigBold: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 0.65 * rem,
  },
  boldDark: {
    color: '#F3F3F3',
    fontWeight: 'bold'
  },
  bigBoldDark: {
    color: '#F3F3F3',
    fontWeight: 'bold',
    fontSize: 0.65 * rem,
  }
});

export class secret extends Component {
  constructor() {
    super();
  }

  componentDidMount() {}

  render() {
    return (
      <View style={{flex:1}}>
        {
          this.props.mode=='light'?
          <View>
            <View style={styles.title}>
              <TouchableOpacity style={styles.goBack} activeOpacity={0.3} onPress={()=>this.props.navigation.goBack()}>
                <View style={styles.backButton}></View>
              </TouchableOpacity>
              <Text style={styles.titleText}>{I18n.locale.toLowerCase().indexOf('zh') > -1  ? '用户协议与隐私政策' : 'User Agreement and Privacy Policy'}</Text>
              <View>
              </View>
            </View>
            <ScrollView>
              {
                I18n.locale.toLowerCase().indexOf('zh') > -1 ?
                <View style={styles.root}>
                  <View style={styles.context}>
                    <Text style={styles.contextText}>介绍</Text>
                    <Text style={styles.contextText}>欢迎来到CAR FRIDGE FREEZER隐私协议!</Text>
                    <Text style={[styles.contextText,styles.bold]}>我们尊重您的隐私。</Text>
                    <Text style={styles.contextText}>本隐私政策告知您关于您提供给我们的任何信息（如下面“我们收集的信息和我们如何收集信息”部分所定义的）的选择和实践。</Text>
                    <Text style={styles.contextText}>使用CAR FRIDGE FREEZER APP可能涉及收集和使用您的信息。了解这种情况是如何发生的以及如何控制这一点很重要，所以请仔细阅读本隐私政策。</Text>
                    <Text style={[styles.contextText,styles.bold]}>如使用CAR FRIDGE FREEZER APP，您同意我们可以按照本隐私政策（不时修订）收集，并使用您的信息。</Text>
                    <Text style={styles.contextText}>如果您想就本隐私政策或任何与隐私有关的事宜联络我们，可发送邮件到 customer_care@alpicool.com 联系我们的客服。</Text>
                    <Text style={[styles.contextText,styles.bold]}>这个隐私政策的范围和应用</Text>
                    <Text style={styles.contextText}>本隐私政策适用于CAR FRIDGE FREEZER应用程序，包括任何与该应用程序相关的服务，本隐私政策已被纳入并构成您同意使用CAR FRIDGE FREEZER服务条款的一部分。本隐私政策中使用的任何条款与CAR FRIDGE FREEZER服务条款中的等同定义条款具有相同的含义，除非本隐私政策或上下文另有规定。</Text>
                    <Text style={[styles.contextText,styles.bigBold]}>此隐私政策的变更</Text>
                    <Text style={styles.contextText}>我们可能会不时修改或添加特定的说明，政策和条款，以及隐私政策。这些说明，政策和条款构成本隐私政策的一部分。如果我们认为本隐私政策的任何更改具有合理的重要性，我们将在更改生效之前通过CAR FRIDGE FREEZER应用程序（包括通过直接消息或公司网站），或直接沟通等其他方式通知您。</Text>
                    <Text style={[styles.contextText,styles.bold]}>在对本隐私政策作出任何更改后，如果您继续使用CAR FRIDGE FREEZER应用程序，无论是否通知我们，您都同意修订后的隐私政策。</Text>
                    <Text style={[styles.contextText,styles.bold]}>下面是我们可能会收集的信息以及我们如何收集信息。</Text>
                    <Text style={styles.contextText}>在提供CAR FRIDGE FREEZER应用程序时，我们可能会收集，存储和使用以下与您有关的部分信息：</Text>
                    <Text style={styles.contextText}>CAR FRIDGE FREEZER需要进行网络通信，通过使用蓝牙通信控制智能冰箱，获取蓝牙状态；读取设备信息，包括IMEI、MAC；使用GPS、手机信号或WLAN定位来搜索附近的智能冰箱。</Text>
                    <Text style={[styles.contextText,{paddingBottom:7*rem}]}>使用GPS、手机信号或WLAN定位权限和服务，是因为搜索附近门锁设备时系统需要定位权限和打开定位服务，CAR FRIDGE FREEZER不会收集您的位置与及其他信息。</Text>
                  </View>
                </View>
                :<View style={styles.root}>
                  <View style={styles.context}>
                    <Text style={styles.contextText}>introduce</Text>
                    <Text style={styles.contextText}>Welcome to the CAR FRIDGE FREEZER Privacy Policy!</Text>
                    <Text style={[styles.contextText,styles.bold]}>We respect your privacy.</Text>
                    <Text style={styles.contextText}>This Privacy Policy informs you about any information you provide to us (e.g. "What information we collect and how we collect it" below). (as defined in section) of the choices and practices.</Text>
                    <Text style={styles.contextText}>Use of the CAR FRIDGE FREEZER APP may involve the collection and use of your information. It is important to understand how this happens and how you can control this, so please read this Privacy Policy carefully.</Text>
                    <Text style={[styles.contextText,styles.bold]}>By using the CAR FRIDGE FREEZER APP, you agree that we may use your information in accordance with this Privacy Policy (from time to time). (as amended) collects, and uses, your information.</Text>
                    <Text style={styles.contextText}>If you wish to contact us about this Privacy Policy or any privacy-related matter, you may do so by sending an email to customer_ care@alpicool.com Contact our customer service.</Text>
                    <Text style={[styles.contextText,styles.bold]}>The scope and application of this privacy policy</Text>
                    <Text style={styles.contextText}>This Privacy Policy applies to the CAR FRIDGE FREEZER application, including any related to that application. This Privacy Policy is incorporated into and constitutes your agreement to the CAR FRIDGE FREEZER Terms of Service. of the part. Any terms used in this Privacy Policy are defined as equivalent to those in the CAR FRIDGE FREEZER Terms of Service Terms have the same meaning, unless otherwise provided in this Privacy Policy or context.</Text>
                    <Text style={[styles.contextText,styles.bigBold]}>Changes to this Privacy Policy</Text>
                    <Text style={styles.contextText}>From time to time, we may modify or add specific instructions, policies and terms, as well as the Privacy Policy. These instructions, policies, and terms form part of this Privacy Policy. If we believe that any change to this Privacy Policy is reasonably material, we will, before the change becomes effective, adopt CAR FRIDGE FREEZER APPLICATION (including through direct messages or the Company's website), or other direct communication, etc. Notification of Changes to this Privacy Policy.</Text>
                    <Text style={[styles.contextText,styles.bold]}>f you continue to use CAR FRIDGE FREEZER after making any changes to this Privacy Policy Apps, with or without notifying us, you agree to the revised Privacy Policy.</Text>
                    <Text style={[styles.contextText,styles.bold]}>Below is a list of the information we may collect and how we collect it.</Text>
                    <Text style={styles.contextText}>In providing the CAR FRIDGE FREEZER Application, we may collect, store and use the following information in connection with the Some of your information about.</Text>
                    <Text style={styles.contextText}>CAR FRIDGE FREEZER requires network communication to control the smart refrigerator by using Bluetooth communication. Get Bluetooth status; read device information, including IMEI, MAC; use GPS, cell phone signal or WLAN location to Search for a nearby smart refrigerator.</Text>
                    <Text style={[styles.contextText,{paddingBottom:7*rem}]}>Use GPS, cell phone signal or WLAN to locate permissions and services because the system requires location permissions when searching for nearby door lock devices. and turn on location-based services, CAR FRIDGE FREEZER does not collect your location and other information.</Text>
                  </View>
                </View>
              }
            </ScrollView>
          </View>
          :<View style={{backgroundColor: '#121212'}}>
            <View style={styles.title}>
              <TouchableOpacity style={styles.goBack} activeOpacity={0.3} onPress={()=>this.props.navigation.goBack()}>
                <View style={styles.backButtonDark}></View>
              </TouchableOpacity>
              <Text style={styles.titleTextDark}>{I18n.locale.toLowerCase().indexOf('zh') > -1  ? '用户协议与隐私政策' : 'User Agreement and Privacy Policy'}</Text>
              <View>
              </View>
            </View>
            <ScrollView>
              {
                I18n.locale.toLowerCase().indexOf('zh') > -1 ?
                <View style={styles.root}>
                  <View style={styles.context}>
                    <Text style={styles.contextTextDark}>介绍</Text>
                    <Text style={styles.contextTextDark}>欢迎来到CAR FRIDGE FREEZER隐私协议!</Text>
                    <Text style={[styles.contextTextDark,styles.boldDark]}>我们尊重您的隐私。</Text>
                    <Text style={styles.contextTextDark}>本隐私政策告知您关于您提供给我们的任何信息（如下面“我们收集的信息和我们如何收集信息”部分所定义的）的选择和实践。</Text>
                    <Text style={styles.contextTextDark}>使用CAR FRIDGE FREEZER APP可能涉及收集和使用您的信息。了解这种情况是如何发生的以及如何控制这一点很重要，所以请仔细阅读本隐私政策。</Text>
                    <Text style={[styles.contextText,styles.boldDark]}>如使用CAR FRIDGE FREEZER APP，您同意我们可以按照本隐私政策（不时修订）收集，并使用您的信息。</Text>
                    <Text style={styles.contextTextDark}>如果您想就本隐私政策或任何与隐私有关的事宜联络我们，可发送邮件到 customer_care@alpicool.com 联系我们的客服。</Text>
                    <Text style={[styles.contextTextDark,styles.boldDark]}>这个隐私政策的范围和应用</Text>
                    <Text style={styles.contextTextDark}>本隐私政策适用于CAR FRIDGE FREEZER应用程序，包括任何与该应用程序相关的服务，本隐私政策已被纳入并构成您同意使用CAR FRIDGE FREEZER服务条款的一部分。本隐私政策中使用的任何条款与CAR FRIDGE FREEZER服务条款中的等同定义条款具有相同的含义，除非本隐私政策或上下文另有规定。</Text>
                    <Text style={[styles.contextTextDark,styles.bigBoldDark]}>此隐私政策的变更</Text>
                    <Text style={styles.contextTextDark}>我们可能会不时修改或添加特定的说明，政策和条款，以及隐私政策。这些说明，政策和条款构成本隐私政策的一部分。如果我们认为本隐私政策的任何更改具有合理的重要性，我们将在更改生效之前通过CAR FRIDGE FREEZER应用程序（包括通过直接消息或公司网站），或直接沟通等其他方式通知您。</Text>
                    <Text style={[styles.contextTextDark,styles.boldDark]}>在对本隐私政策作出任何更改后，如果您继续使用CAR FRIDGE FREEZER应用程序，无论是否通知我们，您都同意修订后的隐私政策。</Text>
                    <Text style={[styles.contextTextDark,styles.boldDark]}>下面是我们可能会收集的信息以及我们如何收集信息。</Text>
                    <Text style={styles.contextTextDark}>在提供CAR FRIDGE FREEZER应用程序时，我们可能会收集，存储和使用以下与您有关的部分信息：</Text>
                    <Text style={styles.contextTextDark}>CAR FRIDGE FREEZER需要进行网络通信，通过使用蓝牙通信控制智能冰箱，获取蓝牙状态；读取设备信息，包括IMEI、MAC；使用GPS、手机信号或WLAN定位来搜索附近的智能冰箱。</Text>
                    <Text style={[styles.contextTextDark,{paddingBottom:7*rem}]}>使用GPS、手机信号或WLAN定位权限和服务，是因为搜索附近门锁设备时系统需要定位权限和打开定位服务，CAR FRIDGE FREEZER不会收集您的位置与及其他信息。</Text>
                  </View>
                </View>
                :<View style={styles.root}>
                  <View style={styles.context}>
                    <Text style={styles.contextTextDark}>introduce</Text>
                    <Text style={styles.contextTextDark}>Welcome to the CAR FRIDGE FREEZER Privacy Policy!</Text>
                    <Text style={[styles.contextTextDark,styles.boldDark]}>We respect your privacy.</Text>
                    <Text style={styles.contextTextDark}>This Privacy Policy informs you about any information you provide to us (e.g. "What information we collect and how we collect it" below). (as defined in section) of the choices and practices.</Text>
                    <Text style={styles.contextTextDark}>Use of the CAR FRIDGE FREEZER APP may involve the collection and use of your information. It is important to understand how this happens and how you can control this, so please read this Privacy Policy carefully.</Text>
                    <Text style={[styles.contextTextDark,styles.boldDark]}>By using the CAR FRIDGE FREEZER APP, you agree that we may use your information in accordance with this Privacy Policy (from time to time). (as amended) collects, and uses, your information.</Text>
                    <Text style={styles.contextTextDark}>If you wish to contact us about this Privacy Policy or any privacy-related matter, you may do so by sending an email to customer_ care@alpicool.com Contact our customer service.</Text>
                    <Text style={[styles.contextTextDark,styles.boldDark]}>The scope and application of this privacy policy</Text>
                    <Text style={styles.contextTextDark}>This Privacy Policy applies to the CAR FRIDGE FREEZER application, including any related to that application. This Privacy Policy is incorporated into and constitutes your agreement to the CAR FRIDGE FREEZER Terms of Service. of the part. Any terms used in this Privacy Policy are defined as equivalent to those in the CAR FRIDGE FREEZER Terms of Service Terms have the same meaning, unless otherwise provided in this Privacy Policy or context.</Text>
                    <Text style={[styles.contextTextDark,styles.bigBoldDark]}>Changes to this Privacy Policy</Text>
                    <Text style={styles.contextTextDark}>From time to time, we may modify or add specific instructions, policies and terms, as well as the Privacy Policy. These instructions, policies, and terms form part of this Privacy Policy. If we believe that any change to this Privacy Policy is reasonably material, we will, before the change becomes effective, adopt CAR FRIDGE FREEZER APPLICATION (including through direct messages or the Company's website), or other direct communication, etc. Notification of Changes to this Privacy Policy.</Text>
                    <Text style={[styles.contextTextDark,styles.boldDark]}>f you continue to use CAR FRIDGE FREEZER after making any changes to this Privacy Policy Apps, with or without notifying us, you agree to the revised Privacy Policy.</Text>
                    <Text style={[styles.contextTextDark,styles.boldDark]}>Below is a list of the information we may collect and how we collect it.</Text>
                    <Text style={styles.contextTextDark}>In providing the CAR FRIDGE FREEZER Application, we may collect, store and use the following information in connection with the Some of your information about.</Text>
                    <Text style={styles.contextTextDark}>CAR FRIDGE FREEZER requires network communication to control the smart refrigerator by using Bluetooth communication. Get Bluetooth status; read device information, including IMEI, MAC; use GPS, cell phone signal or WLAN location to Search for a nearby smart refrigerator.</Text>
                    <Text style={[styles.contextTextDark,{paddingBottom:7*rem}]}>Use GPS, cell phone signal or WLAN to locate permissions and services because the system requires location permissions when searching for nearby door lock devices. and turn on location-based services, CAR FRIDGE FREEZER does not collect your location and other information.</Text>
                  </View>
                </View>
              }
            </ScrollView>
          </View>
        }
      </View>

    );
  }
}

export default connect(
  (state) => ({ //全局属性
    mode: state.user.mode,
  }),
  (dispatch) => ({ //传参改变全局属性

  })
)(secret)