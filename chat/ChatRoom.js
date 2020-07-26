import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Keyboard,
  Alert,
  ScrollView,
  Dimensions,
  TextInput,
  FlatList,
  Button,
  AsyncStorage,
  KeyboardAvoidingView,
  BackHandler
} from 'react-native';
import firebase from '../firebaseDb';
import { Feather } from '@expo/vector-icons';
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import store from '../store';

export default class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      f_id:'',
      f_name:'',
      f_email:'',
      u_id:'',
      u_name:'',
      u_email:'',
      f_token: '',
      text:'',
      chatData:[],
    }
    this.props.navigation.setOptions({
      headerShown: true,
      headerLeft: null,
      headerStyle: {
        backgroundColor: 'orange'
      },
      headerTitleStyle: {
        textAlign: 'center'
      }
    })
  }

  getData = async () => {
    const { f_uid, f_name, f_email, u_uid, u_name, u_email, token } = this.props.route.params;
    this.setState({
      f_id: f_uid,
      f_name: f_name,
      f_email: f_email,
      u_id: u_uid,
      u_name: store.getState().logIn.name,
      u_email: u_email,
      f_token: token
    });
  }

  sendPushNotification = async () => {
    const name = this.state.u_name;
    const myToken = await Notifications.getExpoPushTokenAsync();
    const text = this.state.text;
    const message = {
      to: this.state.f_token,
      sound: 'default',
      title: 'New message',
      body: `${name}: ${text}`,
      data: {
        data: 'chat',
        f_id: this.state.u_id,
        f_name: this.state.u_name,
        f_email: this.state.u_email,
        f_token: myToken,
        u_id: this.state.f_id,
        u_name: this.state.f_name,
        u_email: this.state.f_email,
      },
      android: {
        channelId: 'chat',
        icon: "../assets/thermometer.png",
      },
      _displayInForeground: true,
    };
    const response = fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    this.setState({ text: '' })
  };

  get ref() {
    return firebase.database().ref('chat_messages');
  }

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }

  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  refOff() {
    this.ref.off();
  }

  refOn = () => {
    return new Promise((resolve,reject)=>{
      let cData=[]
      this.ref.on('child_added', function (snapshot) {
        const { timestamp: numberStamp, text, user, name, femail, fid } = snapshot.val();
        const { key: id } = snapshot;
        const { key: _id } = snapshot;
        const timestamp = new Date(numberStamp);
        const message = {
          femail,
          fid,
          text,
          timestamp,
          user
        };
      cData.push(message)
      resolve(cData)
      })
    })
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    this
      .refOn()
      .then((solve) => {
        this.setState({ chatData: solve })
      }).then(() => {
        let data=this.state.chatData
      }).catch((fail) => {
        console.log(fail)
      })
    this.getData();
    Notifications.addListener( notification => {
      if (notification.data.data == 'chat' && notification.origin == "received") {
        this
          .refOn()
          .then((solve) => {
            this.setState({ chatData: solve })
          }).then(() => {
            let data=this.state.chatData
          }).catch((fail) => {
            console.log(fail)
          })
      }
    })
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress = () => {
    this.props.navigation.navigate('LoadScreen')
    return true
  }

  send = (fid, femail, text, uid, uemail, uname) => {
    firebase.database().ref('chat_messages/').push({
      'fid': fid,
      'femail': femail,
      'text': text,
      user: {
        'uid': uid,
        'uemail': uemail,
        'uname': uname
      }
    }).then((data)=>{
        console.log('data ' , data)
    }).catch((error)=>{
        console.log('error ' , error)
    })
  }

  onSend = () => {
    this.send(
      this.state.f_id,
      this.state.f_email,
      this.state.text,
      this.state.u_id,
      this.state.u_email,
      this.state.u_name
    )
    this.refOn().then((solve)=>{
      this.setState({ chatData:solve })
      console.log(solve)
    }).then(() => {
      let data=this.state.chatData
      this.scrollView.scrollToEnd()
      this.sendPushNotification()
    }).catch((fail) => {
      console.log(fail)
    })
  }

  updateMessage = () => {
    firebase.database().ref('chat_messenger')
  }

  handleUpdateMsg = (msg) => {
    this.scrollView.scrollToEnd();
    this.setState({ text: msg })
  }

  scrollDown = () => {
    this.scrollView.scrollToEnd();
  }

  render() {
    let Data = this.state.chatData
    let chats = Data.map((c_data) => {
      if (this.state.f_id==c_data.fid && this.state.u_id==c_data.user.uid
          || this.state.f_id==c_data.user.uid && this.state.u_id==c_data.fid) {
        if (this.state.u_id==c_data.user.uid) {
          // sender's
          return(
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <View style={{
                backgroundColor:"#91d0fb",
                padding:15,
                borderRadius:4,
                marginLeft: '30%',
                marginBottom:20,
                maxWidth: 500,
                padding: 15,
                borderRadius: 20,
              }}>
                  <Text style={{fontSize:16,color:"#000" }}> {c_data.text}</Text>
              </View>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>{this.state.u_name[0]}</Text>
              </View>
            </View>
          )
        } else {
          // recipient's
          return (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>{this.state.f_name[0]}</Text>
              </View>
              <View style={{
                backgroundColor:"#dedede",
                padding:15,
                borderRadius:4,
                marginBottom:20,
                marginRight: '30%',
                maxWidth: 500,
                padding: 15,
                borderRadius: 20,
              }}>
                  <Text style={{fontSize:16,color:"#000" }}> {c_data.text}</Text>
              </View>
            </View>
          )
        }
      }
    })
    return (
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView
          ref={ref => {this.scrollView = ref}}
          onContentSizeChange={() => this.scrollView.scrollToEnd()}
        >
          {chats}
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.inputContainer}>
            <TextInput
              multiline
              style={styles.inputs}
              placeholder="Write a message..."
              underlineColorAndroid='transparent'
              onFocus={() => this.scrollDown()}
              onChangeText={this.handleUpdateMsg}
              value={this.state.text}
            />
          </View>
          <TouchableOpacity style={styles.btnSend} onPress={() => {
            if (this.state.text) {
              this.onSend();
          }}}>
            <Feather name='send' size={25}/>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#eeeeee',
    paddingHorizontal: 20
  },
  btnSend: {
    backgroundColor:"#00BFFF",
    width:40,
    height:40,
    borderRadius:360,
    alignItems:'center',
    justifyContent:'center',
  },
  iconSend: {
    width:30,
    height:30,
    alignSelf:'center',
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius:30,
    borderBottomWidth: 1,
    height:40,
    flexDirection: 'row',
    alignItems:'center',
    flex:1,
    marginRight:10,
    marginBottom: 15,
    justifyContent: 'flex-end'
  },
  inputs:{
    height:40,
    marginLeft:16,
    borderBottomColor: '#FFFFFF',
    flex:1
  },
  balloon: {
    maxWidth: 500,
    padding: 15,
    borderRadius: 20,
  },
  itemIn: {
    alignSelf: 'flex-start'
  },
  itemOut: {
    alignSelf: 'flex-end'
  },
  time: {
    alignSelf: 'flex-end',
    margin: 15,
    fontSize: 12,
    color: "#808080",
  },
  item: {
    marginVertical: 14,
    flex: 1,
    flexDirection: 'row',
    backgroundColor:"#eeeeee",
    borderRadius:50,
    padding:5,
  },
  iconBox: {
    marginTop: 5,
    borderWidth:1,
    borderColor:'gray',
    flexDirection: 'column',
    alignItems:'center',
    justifyContent:'flex-end',
    width:40,
    height:40,
    backgroundColor:'#fff',
    borderRadius: 100,
    marginRight: '5%',
    marginLeft: '5%'
  },
  icon: {
    fontSize: 25
  },
})


