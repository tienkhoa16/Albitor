import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';

import SignUpContainer from './container/SignUpContainer';
import DeclareTempContainer from './container/DeclareTempContainer';
import store from './store';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store = {store}>
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
    </Provider>
  );
}

const styles = ({
  ...DefaultTheme,
  colors: {
    background: 'white',
  },
});