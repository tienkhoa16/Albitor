import React, { Component } from 'react';
import { Image, AppRegistry, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';

function CameraButton ( { navigation } ) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress= { () => { navigation.navigate('Camera') } }
                style={styles.button}
                activeOpacity={0.5}
            >
                <MaterialCommunityIcons name='camera' size={40} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        paddingTop: 400,
        paddingLeft: 200,
    },
    ButtonStyle: {
        alignItems: 'center',
        height: 60,
        width: 60,
        borderRadius: 60 / 2,
    },
});

export default CameraButton
