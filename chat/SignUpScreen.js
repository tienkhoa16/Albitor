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

export default class SignUpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      buttonPressed: false,
      loading: false
    };
  }

  onSignUpFailure(errorMessage) {
    this.setState({ errorMessage: errorMessage, loading: false});
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
      .then(console.log('Sign up successfully'))
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
          this.onSignUpFailure.bind(this)('Weak password!');
        } else {
          this.onSignUpFailure.bind(this)(errorMessage);
        }
      });
  }

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
                {
                  (this.state.buttonPressed && this.state.password !== this.state.confirmPassword) ?
                    (
                      <Text>Password not match each other</Text>
                    ) : null
                }

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
                      <Text>Password not match each other</Text>
                    ) : null
                }
              </View>

              {this.renderLoading()}
              <Text style={styles.errorMessage}>
                {this.state.error}
              </Text>

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
  image: {
    flex: 1,
    alignSelf: 'center',
    marginTop: '40%'
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
    marginTop: 20
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