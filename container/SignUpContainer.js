import React from 'react';
import { TextInput, View } from 'react-native';

export default class SignUpContainer extends React.Component{
    state = {
        username: '',
        password: '',
    };

    handleUpdateUsername = (username) => this.setState(state: {username});

    handleUpdatePassword = (password) => this.setState(state: {password});

    render(){
        return(
            <View style = {styles.container}>
                <Image style = {styles.image} source = {require('../assets/nus_logo.png')} />
                <TextInput>
                    style = {styles.textInput}
                    placeholder = "NUSNET"
                    onChangeText = {this.handleUpdateUsername}
                    value = {this.state.username}
                </TextInput>
                <TextInput>
                    style = {styles.textInput}
                    placehold = "password"
                    onChangeText = {this.handleUpdatePassword}
                    value = {this.state.password}
                </TextInput>
            </View>
        )
    }
}