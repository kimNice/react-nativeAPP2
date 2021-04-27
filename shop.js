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
  ScrollView
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
import I18n from '../I18n/index.js';
import Title from '../components/title';
var {
  height,
  width
} = Dimensions.get('window');
var rem = resize_rem();
export class shop extends Component {
  constructor() {
    super();
    this.state = {};
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

  _keyExtractor = (item, index) => index.toString();

  render() {
    return (
      <View style={styles.slide}>
        <Title title={I18n.t('shop')} showLeft={true} showRight={false} goBack={()=>this.props.navigation.goBack()}/>
        <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
          <View style={styles.contain}>
          </View>
        </ScrollView>
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
  contain: {
    width: 14.5 * rem,
    padding: 0.5 * rem,
    borderRadius: 0.3 * rem,
    backgroundColor: '#fff',
    marginTop: 1 * rem
  }
});

export default connect(
  (state) => ({ //全局属性
  }),
  (dispatch) => ({ //传参改变全局属性
  })
)(shop)