import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  AsyncStorage,
  TextInput,
  FlatList,
  Button } from 'react-native';
import firebaseDb from '../firebaseDb';
import store from '../store';
import { Entypo, Feather } from '@expo/vector-icons';
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

  handleSetToken = (token) => this.setState({notifnicationToken: token})

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
        this.setState({ isAdmin: results[0].isAdmin })
      }).catch(err => console.error(err))

  componentDidMount() {
    this.notification = this.getNotificationPermission();
    this.subscribe = this.props.navigation.addListener('focus', () => {
      firebaseDb.auth().onAuthStateChanged((user) => {
        if (user != null) {
          this.handleCreateUser(user);
          this.setState({ user: user });
          this.setState({ email: user.email })
          this.adminPermission(user.email);
        }
      });
    })
    this.getUserList = firebaseDb.firestore().collection('chat_user').onSnapshot(this.updateUserList)
    this.unsubscribeAdmin = firebaseDb.firestore().collection('chat_admin').onSnapshot(this.handleUpdateAdmin)
  }

  componentWillUnmount() {
    this.unsubscribeAdmin();
    this.getUserList();
  }

  handleCreateUser = async (user) =>{
    const token = await Notifications.getExpoPushTokenAsync();
    const admin = this.state.adminList;
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
        this.setState({ adminList: results.map(item => item.email) })
      }).catch(err => console.error(err))
  }
    

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
      .then(
        console.log('Verification email sent')
      )
      .catch(err => console.error(err))
  }

  renderSeparator = () => {
    return (
      <View style={{ height: 1, width: '96%', backgroundColor: "#000", marginLeft: '2%' }} />
    );
  }


  render() {
    const userDetail = this.state.user;
    const userList = this.state.userList;
    const userIsAdmin = this.state.isAdmin;
    if (userDetail.emailVerified) {
      return (
        <SafeAreaView style={styles.container}>
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
                  userIsAdmin ? (
                    item.isAdmin ? (
                      <View style={{ flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={styles.iconBox}>
                            <Text style={styles.icon}>{item.name[0]}</Text>
                          </View>
                          <View>
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
                          <View>
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
                          <View>
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
              firebaseDb.auth().signOut();
            }}
          >
            <Entypo name='log-out' size={40}/>
          </TouchableOpacity>
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.verificationContainer}>
            <View style={styles.textBox}>
              <Text style={styles.verificationText}>Your account has not been verified</Text>
              <Text style={styles.verificationText}>Please verify before continue</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                this.sendVerificationEmail();
              }}
            >
              <Text
                style={styles.verificationCode}
              >
                click here to receive verification email
              </Text>
            </TouchableOpacity>
            <View style={styles.signIn}>
              <Text style={styles.logInText}>After verification, please login again</Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => {
                  this.handleUpdateUser();
                  firebaseDb.auth().signOut();
                  this.props.navigation.navigate('SignInScreen');
                }}
              >
                <Entypo name="login" size={24} color="green" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '5%'
  },
  verificationContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
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
    borderColor: 'green',
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
    color: 'green'
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
    backgroundColor:'#fff',
    borderRadius:100,
  }
});

export default ChatListScreen;