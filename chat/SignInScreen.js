import React, { Component } from "react";
import {
  StyleSheet,
  Image,
  View,
  Text,
  Alert,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler
} from "react-native";
import firebaseDb from '../firebaseDb';
import BlueButton from '../component/BlueButton';

export default class SignInScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errorMessage: '',
      loading: false
    }
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    this.subscribe = this.props.navigation.addListener('focus', () => {
      this.setState({ email: '', password: '', errorMessage: '' })
    })
  }

  componentWillUnmount() {
    this.subscribe();
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress = () => {
    this.props.navigation.navigate('Declare')
    return true
  }

  onLoginSuccess() {
    this.props.navigation.navigate('ChatListScreen')
  }

  onLoginFailure(errorMessage) {
    this.setState({ error: errorMessage, loading: false });
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

  async signInWithEmail() {
    await firebaseDb
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(this.onLoginSuccess.bind(this))
      .catch(error => {
          let errorCode = error.code;
          let errorMessage = error.message;
          if (errorCode == 'auth/weak-password') {
            this.onLoginFailure.bind(this)('Weak Password!');
          } else {
            this.onLoginFailure.bind(this)(errorMessage);
          }
      })
  }

  confirmSendEmailResetPassword = (email) => {
    Alert.alert('Reset password',
      `Send an email to ${email} reset your password?`,
    [
      {text: "Cancel"},
      {text: "Yes", onPress: () => this.sendEmailResetPassword(email)}
    ],
    {
      cancellable: true
    })
  }

  sendEmailResetPassword = (email) => {
    firebaseDb
      .auth()
      .sendPasswordResetEmail(email)
      .then(function() {
        alert('Email sent')
      })
      .catch((err) => alert(err))
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss() }>
            <View style={styles.innerLayout}>
              <Image
                style={styles.image}
                source={require('../assets/fitnus_messenger.png')}
              />

              <View style={styles.form}>
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
                <TouchableOpacity
                  style={styles.pwdForgot}
                  onPress={() => {
                    if (this.state.email) {
                      this.confirmSendEmailResetPassword(this.state.email)
                    } else {
                      alert('You must fill in your email address above')
                    }
                  }}
                >
                  <Text style={styles.pwd}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {this.renderLoading()}
              <Text style={styles.errorMessage}>
                {this.state.error}
              </Text>

              <BlueButton
                style={styles.button}
                onPress={() => this.signInWithEmail()}>
                    Sign In
              </BlueButton>

              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate("SignUpScreen");
                }}
              >
                <View style={{ marginTop: 10 }}>
                  <Text
                    style={styles.SignIn}
                  >
                    Don't have an account?
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
  image: {
    flex: 1,
    alignSelf: 'center',
    marginTop: '40%'
  },
  form: {
    alignSelf: 'center',
    width: "90%",
    marginTop: '5%'
  },
  input: {
    fontSize: 20,
    borderColor: "#707070",
    borderBottomWidth: 1,
    paddingBottom: 1.5,
    marginTop: 25.5
  },
  button: {
    width: '30%',
    marginTop: 10,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorMessage: {
    alignSelf: 'center',
    fontSize: 18,
    textAlign: "center",
    color: "red",
    width: "80%"
  },
  SignIn: {
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: "center"
  },
  pwdForgot: {
    marginTop: 15
  },
  pwd: {
    fontSize: 16,
    textDecorationLine: 'underline',
    color: 'blue'
  }
});
