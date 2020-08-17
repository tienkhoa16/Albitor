import React, { Component } from 'react';
import { View, ActivityIndicator, StyleSheet, BackHandler } from 'react-native';
import firebaseDb from '../firebaseDb';
import store from '../store';

export default class LoadScreen extends Component {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    this.subscribe = this.props.navigation.addListener('focus', () => {
      firebaseDb.auth().onAuthStateChanged(user => {
        if (user) {
          if(user.emailVerified)
            this.props.navigation.navigate('ChatListScreen')
          else
            this.props.navigation.navigate('VerificationScreen')
        } else {
          this.props.navigation.navigate('SignInScreen')
        }
      })
    })
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    this.subscribe;
  }

  onBackPress = () => {
    this.props.navigation.navigate('Declare')
    return true
  }

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})

