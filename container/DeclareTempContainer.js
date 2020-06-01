import axios from 'axios';
import querystring from 'querystring';
import React from 'react';
import { TextInput, StyleSheet, Image, Text, KeyboardAvoidingView, View} from 'react-native';

import BlueButton from '../component/BlueButton';

export default class DeclareTempContainer extends React.Component{
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image:{
        marginBottom: 60,
    },
    textInput:{
        borderWidth: 1,
        borderRadius: 5,
        width: 250,
        height: 40,
        // borderTopColor: 'white',
        // borderRightColor: 'white',
        // borderLeftColor: 'white',
        borderColor: 'black',
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 20,
        marginBottom: 8,
    },
    button:{
        marginTop: 42,
        borderRadius: 5,
    },
    text:{
        fontSize: 20,
        color: 'green',
        marginTop: 40,
    },
    err_text:{
        fontSize: 20,
        color: 'red',
        marginTop: 40,
    },
});