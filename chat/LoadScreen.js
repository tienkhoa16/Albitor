import React, { Component } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import firebaseDb from '../firebaseDb';

export default class LoadScreen extends Component {
  componentDidMount() {
    this.subscribe = this.props.navigation.addListener('focus', () => {
      firebaseDb.auth().onAuthStateChanged(user => {
        if (user) {
          this.props.navigation.navigate('ChatListScreen')
        } else {
          this.props.navigation.navigate('SignInScreen')
        }
      })
    })
  }

  componentWillUnmount() {
    this.subscribe;
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

