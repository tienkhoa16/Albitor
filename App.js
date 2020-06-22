import React from 'react';
import { UIManager, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Provider } from 'react-redux';

import LogInContainer from './container/LogInContainer';
import DeclareTempContainer from './container/DeclareTempContainer';
import PastDeclareContainer from './container/PastDeclareContainer';
import FlightContainer from './container/FlightContainer';

import store from './store';


const Stack = createStackNavigator();


// const SwitchNavigator = createBottomTabNavigator(
const SwitchNavigator = createSwitchNavigator(
  {
    Login: LogInContainer,
    MainScreen: MainScreenStack,
  },
  {
    initialRouteName: 'Login',
  }
);

function MainScreenStack() {
  return (
    <Stack.Navigator
      initialRouteName='Declare'
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Declare" component={DeclareTempContainer} />
      <Stack.Screen name="History" component={PastDeclareContainer} />
      <Stack.Screen name="Flight" component={FlightContainer} />
    </Stack.Navigator>
  );
}

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