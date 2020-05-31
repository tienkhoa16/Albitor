'use strict';
import 'react-native-gesture-handler';
import React, { PureComponent } from 'react';
import { Image, AppRegistry, StyleSheet, Text, TouchableOpacity, View, PermissionsAndroid } from 'react-native';
import { RNCamera } from 'react-native-camera';
import CameraRoll from '@react-native-community/cameraroll';

class Camera extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
        />
        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity onPress={this.takePicture.bind(this)}
                            style={styles.captureButton} activeOpacity={0.5}>
            <Image
              style={styles.image}
              source={require('../assets/button_snap.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      console.log(data.uri);
      // get storage permission
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
      };
      CameraRoll.save(data.uri);
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  captureButton: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 20,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  image: {
    width: 60,
    height: 60,
  },
});

export default Camera