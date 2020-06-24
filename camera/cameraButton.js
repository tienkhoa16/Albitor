import React, { Component } from 'react';
import { Image, AppRegistry, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';

function CameraButton ( { navigation } ) {
    return (
        <View style = {styles.container}>
            <TouchableOpacity
                onPress= { () => { navigation.navigate('Camera') } }
                activeOpacity={0.5}
            >
                <MaterialCommunityIcons name='camera' size={30} color='red'/>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        alignSelf: 'center',
        marginTop: -15
    }
})

export default CameraButton
