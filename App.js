import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import SignUpContainer from './container/SignUpContainer';

export default function App() {
  return (
    <SafeAreaView style = {styles.container}>
      <SignUpContainer/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
