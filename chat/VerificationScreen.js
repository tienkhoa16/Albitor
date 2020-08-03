import React from 'react';
import { SafeAreaView, View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Entypo, Feather } from '@expo/vector-icons';
import firebaseDb from '../firebaseDb';
import store from '../store'


export default class VerificationScreen extends React.Component {

  sendVerificationEmail() {
    firebaseDb
      .auth()
      .currentUser
      .sendEmailVerification()
      .then(alert(`Verification email has been sent to ${this.state.email}`)
      )
      .catch(err => console.error(err))
  }

  handleUpdateUser = () => {
    firebaseDb.auth().currentUser.updateProfile({
      displayName: store.getState().logIn.name
    })
    .then(console.log('Updated'))
    .catch(err => console.error(err))
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.verificationContainer}>
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={require('../assets/fitnus_messenger.png')}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              this.sendVerificationEmail();
            }}
          >
            <Text
              style={styles.verificationCode}
            >
              Tap here to resend verification email
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
              <Entypo name="login" size={24} />
            </TouchableOpacity>
          </View>
        </View>
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