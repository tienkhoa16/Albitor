import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, PermissionsAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

export default class CameraUI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasCameraPermission: null,
            hasCameraRollPermission: null,
            type: Camera.Constants.Type.back,
        };
    }

    componentDidMount() {
        this.getCameraPermissions();
    }

    async getCameraPermissions() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === "granted" });
        this.getCameraRollPermissions();
    }

    async getCameraRollPermissions() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        this.setState({ hasCameraRollPermission: status === "granted" });
    }

    snap = async () => {
        if (this.camera) {
            const options = { quality: 0.5, base64: true };
            const photo = await this.camera.takePictureAsync(options);
            console.log(photo.uri);
            if (this.state.hasCameraRollPermission) {
                MediaLibrary.saveToLibraryAsync(photo.uri);
            }
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Camera style={styles.container} type={this.state.type}
                        ref={(ref) =>  { this.camera = ref }}
                        ratio='16:9'>
                    <View style={styles.inner}>
                        <TouchableOpacity
                            onPress = {this.snap.bind(this)}
                            style = {styles.SnapButton}
                            activeOpacity = {0.5}
                        >
                            <MaterialCommunityIcons name='camera-iris' size={60} />
                        </TouchableOpacity>
                    </View>
                </Camera>
            </View>
        );
    }
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    inner: {
        flex: 0.95,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    SnapButton: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 100,
        padding: 10,
        alignSelf: 'center',
    }
});