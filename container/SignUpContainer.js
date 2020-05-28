import React from 'react';
import { TextInput, StyleSheet, Image, Text, KeyboardAvoidingView } from 'react-native';
import BlueButton from '../component/BlueButton';
import axios from 'axios';
import querystring from 'querystring';

axios.defaults.headers.common['User-Agent'] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36";
axios.defaults.withCredentials = true;
const instance = axios.create();
instance.defaults.timeout = 20000;

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
    // Start position of name
    let startPos = data.indexOf('Login User') + 18

    let name = ''
    while(data[startPos] != '&'){
        name += data[startPos]
        startPos++
    }

    return name
}

export default class SignUpContainer extends React.Component{
    state = {
        username: '',
        password: '',
        firstTime: true,
        typing: false,
        authenticating: false,
        signInSuccesful: false,
        name: '',
    };

    handleUpdateUsername = (username, typing) => this.setState({username, typing: true, firstTime: false});

    handleUpdatePassword = (password, typing) => this.setState({password, typing: true, firstTime: false});

    render(){
        const {username, password, firstTime, typing, authenticating, signInSuccesful, name} = this.state

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
                <BlueButton 
                    style = {styles.button}
                    onPress = {() => {
                        if(
                            username &&
                            password
                        ){
                            (async () => {
                                this.setState({authenticating:true})
                                const resp = await auth(username, password)

                                if ('set-cookie' in resp.headers){
                                    this.setState({signInSuccesful:true, authenticating:false, name: getName(resp.data)})
                                }
                                else{
                                    this.setState({signInSuccesful:false, authenticating:false})
                                }
                            })()
                            this.setState({
                                username: '',
                                password: '',
                                typing: false,
                            })
                        }
                    }}
                >
                    Log In
                </BlueButton>
                {
                    (firstTime || typing)? null : ((authenticating)? (<Text style = {styles.text}>Authenticating...</Text>)  : (signInSuccesful ? (<Text style = {styles.text}>Log In Successful</Text>) : (<Text style = {styles.err_text}>Wrong NUSNET or Password</Text>)))
                }
                {
                    (name) ? (<Text style = {styles.text}>Welcome {name}</Text>) : null
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
    err_text:{
        fontSize: 20,
        color: 'red',
        marginTop: 40,
    },
});