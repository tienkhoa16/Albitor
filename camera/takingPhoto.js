import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { StyleSheet,
         Text,
         View,
         Image,
         TouchableOpacity, }
         from 'react-native';
import { RNCamera } from 'react-native-camera';
import CameraRoll from '@react-native-community/cameraroll';
import RequestCPPermission from './cp_permission';
import RequestAudioPermission from './audio_permission';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

function PhotoTaking ({ navigation }) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={ () => { navigation.navigate('Camera') } }
        style={styles.ButtonStyle} activeOpacity={0.5}>
          <Image
            style={styles.img}
            source={require('../assets/camera.png')}
          />
        </TouchableOpacity>
      </View>
    );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 400,
    paddingLeft: 200,
  },
  img: {
    width: 50,
    height: 50,
  },
  ButtonStyle: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 60,
    width: 60,
    borderRadius: 10,
  },
});

export default PhotoTaking