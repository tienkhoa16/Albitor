import React from 'react';
// import { StyleSheet, SafeAreaView } from 'react-native';
// alo alo
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, createAppContainer } from '@react-navigation/stack';

import SignUpContainer from './container/SignUpContainer';
import DeclareTempContainer from './container/DeclareTempContainer';

const Stack = createStackNavigator();

export default function App() {
  return (
    // <SafeAreaView style = {styles.container}>
      <NavigationContainer theme = {styles}>
        <Stack.Navigator 
          // initialRouteName='Login'
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Login" component={SignUpContainer} />
          <Stack.Screen name="Declare" component={DeclareTempContainer} /> 
        </Stack.Navigator>
      </NavigationContainer>
    // </SafeAreaView>
  );
}

const styles = ({
  ...DefaultTheme,
  colors: {
    background: 'white',
  },
});