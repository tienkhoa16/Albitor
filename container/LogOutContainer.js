import React from 'react';
import { TextInput, StyleSheet, Image, Text, KeyboardAvoidingView, Alert, View, Keyboard, TouchableWithoutFeedback, 
    Switch, BackHandler, Animated, Dimensions } from 'react-native';
import { CheckBox } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';

import axios from 'axios';
import querystring from 'querystring';

import BlueButton from '../component/BlueButton';
import Spinner from '../component/SpinningComponent';

import store from '../store';
import base64 from 'Base64';


const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);


async function auth(prefix, username, password){
    console.log("[AUTH]")

    let resp = {
        headers: {},
    }

    // Basic check first
    if (prefix == 'nusstu\\' && username[0] != 'E' && username[0] != 'e' || username.length != 8)
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
        'UserName': prefix + username,
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
        prefix: 'nusstu\\',
        optionStu: true,
        optionStf: false,
        optionExt: false,
        username: '',
        password: '',
        authenticating: false,
        rememberMe: false,
        backClickCount: 0,
    };

    springValue = new Animated.Value(100);

    async componentDidMount() {
        await this.clear();
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    }

    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    handleUpdateUsername = (username) => this.setState({username});

    handleUpdatePassword = (password) => this.setState({password});

    handlePressButton = (prefix, username, password) => {
        if(
            username &&
            password
        ){
            (async () => {
                this.setState({authenticating: true})
                const resp = await auth(prefix, username, password)
                
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
                        authenticating: false, 
                    })
                    if(this.state.rememberMe)
                        this.remember(prefix, username, password)
                    else   
                        this.clear()
                    this.rememberLogin(prefix, username, password)
                    this.props.navigation.navigate('MainScreen', {screen: 'Declare'})
                }
                else{
                    this.setState({
                        username: '',
                        password: '',
                        authenticating: false,
                        rememberMe: false,
                        haveCredentials: false,
                    })
                    Alert.alert(
                        'Log in failed',
                        'Invalid NUSNET or Password',
                        [
                            { text: "Try again" }
                        ],
                        { cancelable: false }
                    )
                }
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

    remember = async (prefix, usernameRaw, passwordRaw) => {
        const username = base64.btoa(usernameRaw);
        const password = base64.btoa(passwordRaw);
        const credentials = { prefix, username, password };
        try {
            await SecureStore.setItemAsync(
                'credentials',
                JSON.stringify(credentials)
            );
        } catch (e) {
            console.log(e);
        }
    };

    rememberLogin = async (prefix, usernameRaw, passwordRaw) => {
        const username = base64.btoa(usernameRaw);
        const password = base64.btoa(passwordRaw);
        const login = { prefix, username, password };
        try {
            await SecureStore.setItemAsync(
                'login',
                JSON.stringify(login)
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

    handlePressStu = () => {
        this.setState({
            optionStu: true,
            optionStf: false,
            optionExt: false,
            prefix: 'nusstu\\',
        })
    }

    handlePressStf = () => {
        this.setState({
            optionStu: false,
            optionStf: true,
            optionExt: false,
            prefix: 'nusstf\\',
        })
    }

    handlePressExt = () => {
        this.setState({
            optionStu: false,
            optionStf: false,
            optionExt: true,
            prefix: 'nusext\\',
        })
    }

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
        const {prefix, optionStu, optionStf, optionExt, username, password, 
            authenticating, rememberMe} = this.state

        return(
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <KeyboardAvoidingView style = {styles.container}>
                    <Image style = {styles.image} source = {require('../assets/nus_logo.png')} />

                    <View style={{flexDirection: 'row'}}>
                        <CheckBox
                            title = "nusstu"
                            checked={optionStu}
                            onPress={() => this.handlePressStu()}
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            containerStyle={styles.checkboxPrefixContainer}
                            textStyle={styles.checkboxPrefixText}
                        />

                        <CheckBox
                            title = "nusstf"
                            checked={optionStf}
                            onPress={() => this.handlePressStf()}
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            containerStyle={styles.checkboxPrefixContainer}
                            textStyle={styles.checkboxPrefixText}
                        />

                        <CheckBox
                            title = "nusext"
                            checked={optionExt}
                            onPress={() => this.handlePressExt()}
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            containerStyle={styles.checkboxPrefixContainer}
                            textStyle={styles.checkboxPrefixText}
                        />
                    </View>

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
                        onPress = {() => this.handlePressButton(username, password)}
                    >
                        Log In
                    </BlueButton>

                    {
                        authenticating ? (<Spinner/>) : null
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
        marginBottom: 30,
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
        top: screenHeight-30,
        padding: 10,
        alignSelf: 'center',
        backgroundColor: "#dddddd",
        borderRadius: 130,
    },
    exitTitleText: {
        textAlign: "center",
    },
    checkboxPrefixContainer:{
        backgroundColor: 'transparent', 
        borderWidth: 0, 
        paddingHorizontal: 0,
    },
    checkboxPrefixText:{
        color: 'black', 
        fontSize: 15, 
        marginTop: -4,
        marginLeft: 5,
    },
});