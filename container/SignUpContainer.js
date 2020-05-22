import React from 'react';
import { TextInput, View, StyleSheet, Image, Text, KeyboardAvoidingView } from 'react-native';
import BlueButton from '../component/BlueButton';

export default class SignUpContainer extends React.Component{
    state = {
        username: '',
        password: '',
        signInSuccesful: false,
    };

    handleUpdateUsername = (username) => this.setState({username});

    handleUpdatePassword = (password) => this.setState({password});

    render(){
        const {username, password, signInSuccesful} = this.state

        return(
            <KeyboardAvoidingView style = {styles.container}>
                <Image style = {styles.image} source = {require('../assets/nus_logo.png')} />
                <TextInput
                    style = {styles.textInput}
                    placeholder = "NUSNET (e...)"
                    onChangeText = {this.handleUpdateUsername}
                    value = {username}
                />
                <TextInput
                    style = {styles.textInput}
                    placeholder = "Password"
                    secureTextEntry
                    onChangeText = {this.handleUpdatePassword}
                    value = {password}
                />
                {/* <PasswordTextbox icon='lock' label='Password' onChange={(v) => this._updateState('new', v)} /> */}
                <BlueButton 
                    style = {styles.button}
                    onPress = {() => {
                        if(
                            username.length &&
                            password.length
                        ){
                            this.setState({
                                username:'',
                                password: '',
                                signInSuccesful: true,
                            });
                        }
                    }}
                >
                    Log In
                </BlueButton>
                {
                    signInSuccesful ? (<Text style = {styles.text}>Log In Successful</Text>) : null
                }
            </KeyboardAvoidingView>
        );
    }
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
});