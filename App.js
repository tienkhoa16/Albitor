import React from 'react';
import { UIManager, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { Provider } from 'react-redux';

import SignUpContainer from './container/SignUpContainer';
import DeclareTempContainer from './container/DeclareTempContainer';
import store from './store';
import PastDeclareContainer from './container/PastDeclareContainer';



const SwitchNavigator = createSwitchNavigator(
  {
    Login: SignUpContainer,
    Declare: DeclareTempContainer,
    History: PastDeclareContainer,
  },
  {
    initialRouteName: 'Login',
  }
);


if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AppContainer = createAppContainer(SwitchNavigator)



export default function App() {
  return (
    <Provider store = {store}>
      <NavigationContainer theme = {styles}>
        <AppContainer/>
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