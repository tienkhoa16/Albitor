import React from 'react';
import { TextInput, StyleSheet, Image, Text, KeyboardAvoidingView, Alert, View, Keyboard, TouchableWithoutFeedback, 
    Switch, BackHandler, Animated, Dimensions } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import axios from 'axios';
import querystring from 'querystring';

import BlueButton from '../component/BlueButton';
import Spinner from '../component/SpinningComponent';

import store from '../store';


const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);


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
        backClickCount: 0,
    };

    springValue = new Animated.Value(100);

    async componentDidMount() {
        await this.read();
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    }

    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
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
                        }
                    })

                    this.setState({
                        signInSuccesful: true, 
                        authenticating: false, 
                    })
                    if(this.state.rememberMe)
                        this.remember(this.state.username, this.state.password)
                    this.props.navigation.navigate('MainScreen', {screen: 'Declare'})
                }
                else{
                    this.setState({
                        username: '',
                        password: '',
                        signInSuccesful: false, 
                        authenticating: false,
                    })
                }
                this.setState({
                    typing: false,
                })
            })()
        }
    }

    toggleRememberMe = value => {
        this.setState({ rememberMe: value })
        if (value == false) {
            this.clear();
        }
    }

    read = async () => {
        try {
            const credentials = await SecureStore.getItemAsync('credentials');
    
            if (credentials) {
                const myJson = JSON.parse(credentials);

                this.setState({
                    username: myJson.username,
                    password: myJson.password,
                    rememberMe: true,
                });
                this.handlePressButton(myJson.username, myJson.password)
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

    remember = async (username, password) => {
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

    onBackPress = () => {
        this.state.backClickCount == 1 ? BackHandler.exitApp() : this._spring();
        return true;
    }

    _spring() {
        this.setState({backClickCount: 1}, () => {
            Animated.sequence([
                Animated.spring(
                    this.springValue,
                    {
                        toValue: -.15 * screenHeight,
                        friction: 5,
                        duration: 300,
                        useNativeDriver: true,
                    }
                ),
                Animated.timing(
                    this.springValue,
                    {
                        toValue: 100,
                        duration: 300,
                        useNativeDriver: true,
                    }
                ),

            ]).start(() => {
                this.setState({backClickCount: 0});
            });
        });

    }

    render(){
        const {username, password, firstTime, typing, authenticating, signInSuccesful, rememberMe} = this.state

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

                    <View style = {{flexDirection: 'row', marginTop: 15}}>
                        <Switch
                            value={rememberMe}
                            onValueChange={(value) => this.toggleRememberMe(value)}
                        />
                        <Text
                            style = {{
                                fontWeight: 'bold',
                                fontSize: 18,
                                color: rememberMe ? 'green' : 'black',
                            }}
                        >
                            Remember Me
                        </Text>
                    </View>

                    <BlueButton 
                        style = {styles.button}
                        onPress = {() => this.handlePressButton(username, password)}
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

                    <Animated.View style={[styles.animatedView, {transform: [{translateY: this.springValue}]}]}>
                        <Text style={styles.exitTitleText}>Press back again to exit FitNUS</Text>
                    </Animated.View>  
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
    animatedView: {
        width: 260,
        position: "absolute",
        top: screenHeight,
        padding: 10,
        alignSelf: 'center',
        backgroundColor: "#dddddd",
        borderRadius: 130,
    },
    exitTitleText: {
        textAlign: "center",
    },
});