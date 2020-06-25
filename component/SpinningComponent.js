import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const SpinningComponent = () => (
    <View style={{flexDirection:'row', alignItems: 'center'}}>
        <Text style = {styles.text}>Authenticating...</Text>
        <Image 
            source = {require('../assets/spinner.gif')} 
            style = {{marginTop: 20}}
        />
    </View>
)

const styles = StyleSheet.create({
    text:{
        fontSize: 20,
        color: 'green',
        marginTop: 20,
    },
})

export default SpinningComponent