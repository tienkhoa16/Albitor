import axios from 'axios';
import querystring from 'querystring';
import React from 'react';
import { TextInput, StyleSheet, Image, Text, KeyboardAvoidingView, View, Dimensions } from 'react-native';

import BlueButton from '../component/BlueButton';
import store from '../store';


const screenWidth = Math.round(Dimensions.get('window').width);

function getDateTime(){
    const date = new Date().getDate(); //Current Date
    const month = new Date().getMonth() + 1; //Current Month
    const year = new Date().getFullYear(); //Current Year
    const hours = new Date().getHours(); //Current Hours
    return date+'/'+month+'/'+year+' '+(hours>=12? 'AM': 'PM')
}

export default class DeclareTempContainer extends React.Component{
    state = {
        temp: '',
        symptoms: false,
        famSymptoms: false,
    };

    handleTemp = (temp) => this.setState({temp});

    render(){
        const {temp, symptoms, famSymptoms} = this.state

        return(
            <KeyboardAvoidingView style = {styles.container}>
                <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />
                <Text style = {styles.textWelcome}>Welcome {store.getState().logIn.name}</Text>
                <Text style = {styles.heading}>Temperature Declaration</Text>
                <Text style = {styles.text}>Date: {getDateTime()} </Text>
                <Text style = {styles.text}>Temperature</Text>
                <TextInput 
                    style = {styles.textInput}
                    placeholder = "Your temperature"
                    onChangeText = {this.handleTemp}
                    value = {temp}
                />
                
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    image:{
        marginBottom: 60,
    },
    textInput:{
        borderWidth: 1,
        width: 130,
        height: 25,
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 14,
        marginBottom: 10,
        marginTop: 10,
        alignSelf: 'center',
        textAlign: 'center',
        borderTopColor: 'white',
        borderRightColor: 'white',
        borderLeftColor: 'white',
    },
    button:{
        marginTop: 42,
        borderRadius: 5,
    },
    textWelcome:{
        fontSize: 15,
        color: 'green',
        marginTop: 10,
        fontStyle: 'italic',
    },
    text:{
        fontSize: 15,
        color: 'black',
        marginTop: 10,
        textAlign: 'center',
    },
    heading:{
        fontSize: 25,
        color: 'red',
        marginTop: 30,
        textAlign: 'center',
        fontWeight: 'bold',
    }
});