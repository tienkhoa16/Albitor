import React, { Component } from 'react';
import { PermissionsAndroid } from 'react-native';

const RequestAudioPermission = async () => {
  try {
    const accepted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    if (accepted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Audio accepted");
    } else {
      console.log("Audio denied");
    }
  } catch (err) {
    console.warn(err);
  }
}

export default RequestAudioPermission;