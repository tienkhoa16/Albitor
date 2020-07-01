import React from 'react';
import { TextInput, StyleSheet, Image, Text, KeyboardAvoidingView, Alert, View, Keyboard, TouchableWithoutFeedback, 
    Switch } from 'react-native';   
import { CheckBox } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';

import axios from 'axios';
import querystring from 'querystring';

import BlueButton from '../component/BlueButton';
import Spinner from '../component/SpinningComponent';

import store from '../store';
import base64 from 'Base64';


async function auth(username, password){
    console.log("[AUTH]")

    let resp = {
        headers: {},
    }

    // Basic check first
    if (username[0] != 'E' && username[0] != 'e' || username.length != 8)
        return resp
    
    // Log out url
    const log_out_url =  'https://vafs.nus.edu.sg/adfs/ls/?wa=wsignout1.0'

    // Log in url
    const auth_url = 'https://vafs.nus.edu.sg/adfs/oauth2/authorize'
    const CLIENT_ID = "97F0D1CACA7D41DE87538F9362924CCB-184318"

    const config = {
        maxRedirects: 0,
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded',  
        },
        params: {
            'response_type': 'code',
            'client_id': CLIENT_ID,
            'resource': 'sg_edu_nus_oauth',
            'redirect_uri': 'https://myaces.nus.edu.sg:443/htd/htd',
        }
    }

    const data = querystring.stringify({
        'UserName': 'nusstu\\' + username,
        'Password': password,
        'AuthMethod': "FormsAuthentication"
    })

    // Log out first if there were any successful sign in earlier
    const log_out = await axios.get(log_out_url)

    resp = await axios.post(auth_url, data, config)
        .then((response) => response)
        .catch((err) => err.response)
    return resp
}

function getName(data){
    console.log('[GETTING NAME AND COOKIE]')
    // Start position of name
    let startPos = data.indexOf('Login User') + 18

    let name = ''
    while(data[startPos] != '&'){
        name += data[startPos]
        startPos++
    }
    return name
}

export default class LogInContainer extends React.Component{
    state = {
        username: '',
        password: '',
        firstTime: true,
        typing: false,
        authenticating: false,
        signInSuccesful: false,
        rememberMe: false,
        haveCredentials: false,
    };

    async componentDidMount() {
        await this.read();
    }

    handleUpdateUsername = (username) => this.setState({username, typing: true, firstTime: false});

    handleUpdatePassword = (password) => this.setState({password, typing: true, firstTime: false});

    handlePressButton = (username, password) => {
        if(
            username &&
            password
        ){
            (async () => {
                this.setState({authenticating: true, typing: false})
                const resp = await auth(username, password)
                
                if ('set-cookie' in resp.headers){
                    store.dispatch({
                        type: 'UPDATE',
                        payload: {
                            updateName: getName(resp.data),
                            updateCookie: resp.headers['set-cookie'][0].split(";")[0],
                            updateUsername: username.toUpperCase(),
                        }
                    })

                    this.setState({
                        signInSuccesful: true, 
                        authenticating: false, 
                    })
                    if(this.state.rememberMe)
                        this.remember(this.state.username, this.state.password)
                    else   
                        this.clear()
                    this.props.navigation.navigate('MainScreen', {screen: 'Declare'})
                }
                else{
                    this.setState({
                        username: '',
                        password: '',
                        signInSuccesful: false, 
                        authenticating: false,
                        rememberMe: false,
                        haveCredentials: false,
                    })
                }
                this.setState({
                    typing: false,
                })
            })()
        }
        else if(
            username &&
            !password
        ){
            alert('Please fill in your password')
        }
        else if(
            !username &&
            password
        ){
            alert('Please fill in your NUSNET')
        }
        else{
            alert('Please fill in your NUSNET and password')
        }
    }

    read = async () => {
        try {
            const credentials = await SecureStore.getItemAsync('credentials');
    
            if (credentials) {
                const myJson = JSON.parse(credentials);
                decodedUsername = base64.atob(myJson.username)
                decodedPassword = base64.atob(myJson.password)

                this.setState({
                    username: decodedUsername,
                    password: decodedPassword,
                    rememberMe: true,
                    haveCredentials: true,
                });
                this.handlePressButton(decodedUsername, decodedPassword)
            }
            else{
                this.setState({
                    username: '',
                    password: '',
                    rememberMe: false,
                });
            }
        } catch (e) {
            console.log(e);
        }
    };

    remember = async (usernameRaw, passwordRaw) => {
        const username = base64.btoa(usernameRaw);
        const password = base64.btoa(passwordRaw);
        const credentials = { username, password };
        try {
            await SecureStore.setItemAsync(
                'credentials',
                JSON.stringify(credentials)
            );
        } catch (e) {
            console.log(e);
        }
    };

    clear = async () => {
        try {
            await SecureStore.deleteItemAsync('credentials');
        } catch (e) {
            console.log(e);
        }
    };

    render(){
        const {username, password, firstTime, typing, authenticating, signInSuccesful, rememberMe, haveCredentials} = this.state
        return(
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <KeyboardAvoidingView style = {styles.container}>
                    <Image style = {styles.image} source = {require('../assets/nus_logo.png')} />

                    <TextInput
                        style = {styles.textInput}
                        placeholder = "NUSNET (E...)"
                        placeholderTextColor = 'grey'
                        onChangeText = {this.handleUpdateUsername}
                        value = {username}
                    />

                    <TextInput
                        style = {styles.textInput}
                        placeholder = "Password"
                        placeholderTextColor = 'grey'
                        secureTextEntry
                        onChangeText = {this.handleUpdatePassword}
                        value = {password}
                    />

                    <CheckBox
                        title = "Remember Me"
                        checked={this.state.rememberMe}
                        onPress={() => this.setState({ rememberMe: !this.state.rememberMe })}
                        containerStyle={{backgroundColor: 'visible', borderWidth: 0}}
                        textStyle={{fontWeight: 'bold', fontSize: 18, color: rememberMe ? 'green' : 'black'}}
                    />

                    <BlueButton 
                        style = {styles.button}
                        onPress = {() => {
                            if (!haveCredentials)
                                this.handlePressButton(username, password)
                        }}
                    >
                        Log In
                    </BlueButton>

                    {
                        (firstTime || typing) ? null : 
                            (authenticating ? (<Spinner/>) : 
                            (signInSuccesful ? null : 
                            (Alert.alert(
                                'Log in failed',
                                'Invalid NUSNET or Password',
                                [
                                    { text: "Try again" }
                                ],
                                { cancelable: false }
                            ))))
                    }
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    image:{
        marginBottom: 60,
    },
    textInput:{
        borderWidth: 1,
        borderRadius: 5,
        width: 250,
        height: 40,
        borderColor: 'black',
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 20,
        marginBottom: 8,
    },
    button:{
        marginTop: 22,
        borderRadius: 5,
    },
});