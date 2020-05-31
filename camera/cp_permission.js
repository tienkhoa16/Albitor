import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { StyleSheet, PermissionsAndroid, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { NavigationContainer, useNavigation } from '@react-navigation/native';

const RequestCameraPermission = async () => {
  try {
    const accepted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (accepted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Camera accepted");
    } else {
      console.log("Camera denied");
    }
  } catch (err) {
    console.warn(err);
  }

  try {
      const accepted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (accepted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Storage accepted");
      } else {
        console.log("Storage denied");
      }
    } catch (err) {
      console.warn(err);
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8
  },
});

export default RequestCameraPermission;