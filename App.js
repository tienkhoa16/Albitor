import React from 'react';
// import { StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, createAppContainer } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SignUpContainer from './container/SignUpContainer';
import DeclareTempContainer from './container/DeclareTempContainer';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer theme = {styles}>
      <Stack.Navigator 
        initialRouteName='Login'
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={SignUpContainer} />
        <Stack.Screen name="Declare" component={DeclareTempContainer} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = ({
  ...DefaultTheme,
  colors: {
    background: 'white',
  },
});