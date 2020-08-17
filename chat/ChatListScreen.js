import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  FlatList,
  Button } from 'react-native';
import firebaseDb from '../firebaseDb';
import store from '../store';
import { Entypo } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';
import Constants from 'expo-constants';

const ScreenWidth = Math.round(Dimensions.get('window').width)

class ChatListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      user: {},
      userList: null,
      name: '',
      isAdmin: false,
      hasNotificationPermission: '',
      notificationToken: '',
      adminList: null,
    };
  }


  getNotificationPermission = async () => {
    if (Constants.isDevice) {
      const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      this.setState({ hasNotificationPermission: status === 'granted'});
      if (!this.state.hasNotificationPermission) {
        const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        this.setState({ hasNotificationPermission: status === 'granted'});
      }
      if (!this.state.hasNotificationPermission) {
        alert('Failed to get push token for push notifications!');
      }
      const token = await Notifications.getExpoPushTokenAsync();
      this.handleSetToken(token)
    }
    else {
      alert('Must use physical device for notifications')
    }
  };

  handleSetToken = (token) => this.setState({notificationToken: token})

  updateUserList = () =>
    firebaseDb
      .firestore()
      .collection('chat_user')
      .orderBy('isAdmin', 'desc')
      .get()
      .then (querySnapshot => {
        const results = []
        querySnapshot.docs.map(documentSnapshot => results.push({
        ...documentSnapshot.data(),
        id: documentSnapshot.id}))
        this.setState({ userList: results })
      }).catch(err => console.error(err))

  adminPermission = (email) =>
    firebaseDb
      .firestore()
      .collection('chat_user')
      .where('email', '==', email)
      .get()
      .then (querySnapshot => {
        const results = []
        querySnapshot.docs.map(documentSnapshot => results.push({
        ...documentSnapshot.data(),
        id: documentSnapshot.id}))
        console.log(results)
        if (results.length) this.setState({ isAdmin: results[0].isAdmin })
      }).catch(err => console.error(err))

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    this.notification = this.getNotificationPermission();
    this.props.navigation.addListener('focus', () => {
      firebaseDb.auth().onAuthStateChanged((user) => {
        if (user) {
          if (user.emailVerified) {
            this.handleCreateUser(user);
            this.handleSetData(user);
            this.handleUpdateAdmin;
          }
          this.adminPermission(user.email);
        }
      });
    })
    this.getUserList = firebaseDb.firestore().collection('chat_user').onSnapshot(this.updateUserList)
    this.unsubscribeAdmin = firebaseDb.firestore().collection('chat_admin').onSnapshot(this.handleUpdateAdmin)
    this.admin = firebaseDb.firestore().collection('chat_user').onSnapshot(this.handleUpdateAdmin)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    this.unsubscribeAdmin();
    this.getUserList();
    this.admin();
  }

  handleSetData = (user) => {
    this.setState({ user: user })
    this.setState({ email: user.email })
  }

  onBackPress = () => {
    this.props.navigation.navigate('Declare')
    return true
  }

  handleCreateUser = async (user) => {
    this.handleUpdateAdmin()
    const token = await Notifications.getExpoPushTokenAsync();
    const admin = this.state.adminList;
    console.log(user);
    console.log(token);
    firebaseDb
      .firestore()
      .collection("chat_user")
      .doc(user.email)
      .set({
        name: store.getState().logIn.name,
        email: user.email,
        uid: user.uid,
        isAdmin: (admin.includes(user.email)),
        token: token,
      })
      .then(() => {
        console.log("User created")
      })
      .catch((err) => console.error(err));
  }

  handleUpdateAdmin = () => {
    firebaseDb
      .firestore()
      .collection('chat_admin')
      .get()
      .then (querySnapshot => {
        const results = []
        querySnapshot.docs.map(documentSnapshot => results.push({
          ...documentSnapshot.data()
        }))
        this.setAdminList(results);
        return results.map(item => item.email);
      }).catch(err => console.error(err))
  }

  setAdminList = (results) => this.setState({ adminList: results.map(item => item.email) })
    

  handleUpdateUser = () => {
    firebaseDb.auth().currentUser.updateProfile({
      displayName: store.getState().logIn.name
    })
    .then(console.log('Updated'))
    .catch(err => console.error(err))
  }

  sendVerificationEmail() {
    firebaseDb
      .auth()
      .currentUser
      .sendEmailVerification()
      .then(alert(`Verification email has been sent to ${this.state.email}`)
      )
      .catch(err => console.error(err))
  }

  renderSeparator = () => {
    return (
      <View style={{ height: 1, width: '96%', backgroundColor: "#000", marginLeft: '2%' }} />
    );
  }

  removeToken = email =>
    firebaseDb
      .firestore()
      .collection('chat_user')
      .doc(email)
      .set({
        email: email,
        isAdmin: this.state.isAdmin,
        name: store.getState().logIn.name,
        token: '',
        uid: this.state.user.uid
      })
      .then(() => {
        console.log('Removed token')
      })
      .catch(err => console.error(err))

  render() {
    let userDetail = this.state.user;
    let userList = this.state.userList;
//    let userIsAdmin = this.state.isAdmin;
    return (
      <SafeAreaView style={styles.container}>
        <View style = {{width: ScreenWidth, height: 35, backgroundColor: 'orange'}} />
        <View style={{ marginTop: 10 }}>
          <Text style={styles.title}>Welcome to FitNUS Messenger,</Text>
          <Text style={styles.title}>{store.getState().logIn.name}</Text>
        </View>
        <FlatList
          data = {userList}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                this.props.navigation.navigate('ChatRoom', {
                  f_uid: item.uid,
                  f_name: item.name,
                  f_email: item.email,
                  u_uid: userDetail.uid,
                  u_name: userDetail.providerData[0].displayName,
                  u_email: userDetail.email,
                  token: item.token,
                })
              }}>
              {
                this.state.isAdmin ? (
                  item.isAdmin ? (
                    <View style={{ flexDirection: 'column' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.iconBox}>
                          <Text style={styles.icon}>{item.name[0]}</Text>
                        </View>
                        <View style={styles.contentBox}>
                          <Text style={styles.nameStyle}>{item.name} (ADMIN)</Text>
                          <Text style={styles.emailStyle}>{item.email}</Text>
                        </View>
                      </View>
                      <View style={{ height: 1, backgroundColor: "#000", marginTop: 8 }} />
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'column' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.iconBox}>
                          <Text style={styles.icon}>{item.name[0]}</Text>
                        </View>
                        <View style={styles.contentBox}>
                          <Text style={styles.nameStyle}>{item.name}</Text>
                          <Text style={styles.emailStyle}>{item.email}</Text>
                        </View>
                      </View>
                      <View style={{ height: 1, backgroundColor: "#000", marginTop: 8 }} />
                    </View>
                  )
                ) :
                (
                  item.isAdmin ? (
                    <View style={{ flexDirection: 'column' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.iconBox}>
                          <Text style={styles.icon}>{item.name[0]}</Text>
                        </View>
                        <View style={styles.contentBox}>
                          <Text style={styles.nameStyle}>{item.name}</Text>
                          <Text style={styles.emailStyle}>{item.email}</Text>
                        </View>
                      </View>
                      <View style={{ height: 1, backgroundColor: "#000", marginTop: 8 }} />
                    </View>
                    ) : null
                )
              }
            </TouchableOpacity>
          )}
          style={styles.container}
          keyExtractor={item => item.email}
        />
        <TouchableOpacity style={styles.logoutIcon}
          onPress={() => {
            this.removeToken(this.state.email);
            firebaseDb.auth().signOut();
          }}
        >
          <Entypo name='log-out' size={40}/>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  verificationContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentBox: {
    width: '70%',
  },
  image: {
    alignSelf: 'center',
  },
  imageContainer: {
    marginBottom: '20%'
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  verificationCode: {
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: 'blue',
    textDecorationLine: 'underline'
  },
  loginButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: 60,
    height: 60,
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 20
  },
  verificationText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 24,
  },
  signIn: {
    paddingTop: 20,
  },
  logInText: {
    fontSize: 24,
  },
  textBox: {
    paddingBottom: 20,
  },
  itemContainer: {
    flex: 1,
    padding: 5,
  },
  nameStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    color: 'blue'
  },
  emailStyle: {
    fontSize: 16,
  },
  icon: {
    fontSize: 30
  },
  iconBox: {
    borderWidth:1,
    borderColor:'gray',
    alignItems:'center',
    justifyContent:'center',
    width:60,
    height:60,
    backgroundColor:'#fff',
    borderRadius:100,
    marginRight: '5%',
    marginLeft: '2%'
  },
  logoutIcon: {
    borderWidth:1,
    borderColor:'gray',
    alignItems:'center',
    justifyContent:'center',
    width:70,
    position: 'absolute',
    bottom: 10,
    right: 10,
    height:70,
    backgroundColor:'transparent',
    borderRadius:100,
    opacity: 0.7
  }
});

export default ChatListScreen;