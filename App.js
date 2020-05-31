// using camera
'use strict';
import React, { PureComponent } from 'react';
import { AppRegistry, StyleSheet, Text, TouchableOpacity,
         View, PermissionsAndroid, Button, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RNCamera } from 'react-native-camera';
import CameraRoll from '@react-native-community/cameraroll';
import PhotoTaking from './camera/takingPhoto';
import Camera from './camera/StartCamera';

const ScreenStack = createStackNavigator();

function MyStack() {
  return (
    <NavigationContainer>
      <ScreenStack.Navigator initialRouteName='Home'>
        <ScreenStack.Screen
          name = 'Home'
          component={PhotoTaking}
          options={{ title: 'Home Screen' }}
        />
        <ScreenStack.Screen
          name = 'Camera'
          component={Camera}
        />
      </ScreenStack.Navigator>
    </NavigationContainer>
  );
}

const App = () => {
  return (
    <View>
      <PhotoTaking />
    </View>
  )
}

export default MyStack