import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const BlueButton = props => (
    <TouchableOpacity style = {[styles.container, props.style]} onPress={props.onPress}>
        <Text style={styles.text}>{props.children}</Text>
    </TouchableOpacity>
)

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#003d7c',
    },
    text:{
        fontSize: 20,
        paddingHorizontal: 10,
        paddingVertical: 8,
        color: 'white',
        width: 150,
        height: 45,
        textAlign: 'center',
        fontWeight: 'bold',
    }
})

export default BlueButton