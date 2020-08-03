import React, { Component } from 'react';
import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import firebaseDb from '../firebaseDb';
import BlueButton from '../component/BlueButton';
import store from '../store';
export const isAndroid = () => Platform.OS === 'android';
import base64 from 'Base64';
import * as SecureStore from 'expo-secure-store';


export default class SignUpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      buttonPressed: false,
      loading: false,
      emailSent: false,
    };
  }

  renderLoading() {
    if (this.state.loading) {
      return (
        <View>
          <ActivityIndicator size={'large'} />
        </View>
      );
    }
  }

  async signUpWithEmail() {
    await firebaseDb
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.sendVerificationEmail();
        console.log('Sign up successfully')
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('Error: ' + errorMessage)
      });
  }

  sendVerificationEmail() {
    firebaseDb
      .auth()
      .currentUser
      .sendEmailVerification()
      .then(() => {
        this.props.navigation.navigate('VerificationScreen');
        alert(`Please allow up to one minute for verification email to be sent to ${this.state.email} and verify your email before sign in.`)
      })
      .catch(err => console.error(err))
  }

  handleClearState = () => {
    this.setState({
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      buttonPressed: false,
      loading: false,
      emailSent: false,
    })
  }

  async componentDidMount() {
    this.handleClearState();
    try {
      const credentials = await SecureStore.getItemAsync('login');

      if (credentials) {
        const myJson = JSON.parse(credentials);
        decodedUsername = base64.atob(myJson.username)
        decodedPassword = base64.atob(myJson.password)
        prefix = myJson.prefix
        if (prefix == 'nusstu\\') {
          this.handleSetEmail(decodedUsername+'@u.nus.edu')
        } else if (prefix == 'nusstf\\') {
          this.handleSetEmail(decodedUsername+'@nus.edu.sg')
        }
        this.handleSetPwd(decodedPassword)
        this.handleSetCfPwd(decodedPassword)
      } else {
        this.setState({ email: '', password: '' })
      }
    } catch (e) {
        console.log(e);
    }
  }

  handleSetEmail = (email) => this.setState({email})
  handleSetPwd = (pwd) => this.setState({ password: pwd })
  handleSetCfPwd = (pwd) => this.setState({ confirmPassword: pwd })

  render() {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
            <View style={styles.inner}>
              <Image
                style={styles.image}
                source={require('../assets/fitnus_messenger.png')}
              />

              <View style={styles.form}>
                <View style={styles.noteBox}>
                  <Text style={styles.note}>Note: By default, FitNUS Messenger uses your NUS credential.</Text>
                </View>
                <Text>Email:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#B1B1B1"
                  returnKeyType="next"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  value={this.state.email}
                  onChangeText={email => this.setState({ email })}
                  autoCompleteType={"email"}
                />

                <Text>Password:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#B1B1B1"
                  returnKeyType="done"
                  textContentType="newPassword"
                  secureTextEntry={true}
                  value={this.state.password}
                  onChangeText={password => this.setState({ password })}
                />
                {
                  (this.state.buttonPressed && this.state.password !== this.state.confirmPassword) ?
                    (
                      <Text>Password not match</Text>
                    ) : null
                }

                <Text>Confirm password:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#B1B1B1"
                  returnKeyType="done"
                  textContentType="newPassword"
                  secureTextEntry={true}
                  value={this.state.confirmPassword}
                  onChangeText={confirmPassword => this.setState({ confirmPassword })}
                />
                {
                  (this.state.buttonPressed && this.state.password !== this.state.confirmPassword) ?
                    (
                      <Text>Password not match</Text>
                    ) : null
                }
              </View>

              {this.renderLoading()}
              <Text style={styles.errorMessage}>
                {this.state.error}
              </Text>
              {
                this.state.emailSent ?
                (
                  <Text>A verification email has been sent to {this.state.email}.</Text>
                )
                : null
              }

              <BlueButton
                style={styles.button}
                onPress={() => {
                  this.setState({ buttonPressed: true });
                  if (this.state.password === this.state.confirmPassword) {
                    this.signUpWithEmail();
                  }
                }}
              >
                  Sign up
              </BlueButton>

              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('SignInScreen');
                }}
              >
                <View style={{ marginTop: 10 }}>
                  <Text
                    style={styles.haveAccount}
                  >
                    Already have an account?
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  inner: {
    flex: 10,
    justifyContent: 'flex-end'
  },
  noteBox: {
    marginBottom: '3%'
  },
  image: {
    flex: 1,
    alignSelf: 'center',
    marginTop: '30%'
  },
  note: {
    fontSize: 18,
    fontStyle: 'italic'
  },
  form: {
    alignSelf: 'center',
    width: '90%',
    marginTop: '5%',
  },
  input: {
    fontSize: 20,
    borderColor: '#707070',
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 20,
  },
  button: {
    width: '30%',
    marginTop: 10,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  haveAccount: {
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center'
  },
  errorMessage: {
    alignSelf: 'center',
    fontSize: 18,
    textAlign: 'center',
    color: 'red',
    width: '80%'
  }
});