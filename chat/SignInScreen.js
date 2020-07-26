import React, { Component } from "react";
import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
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
                    style={styles.signUp}
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
  signUp: {
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: "center"
  }
});
