import React from 'react';
import { AppRegistry, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
