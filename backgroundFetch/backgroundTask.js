import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-community/async-storage';
import base64 from 'Base64';
import axios from 'axios';
import querystring from 'querystring';

import getHistoryHtml from '../container/GetHistoryHtml';

import HandleDeclaration from '../container/HandleDeclaration';


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

async function getCookie () {
    let cookie = ''
    try {
        const credentials = await SecureStore.getItemAsync('login');

        if (credentials) {
            const myJson = JSON.parse(credentials);
            decodedUsername = base64.atob(myJson.username)
            decodedPassword = base64.atob(myJson.password)
            prefix = myJson.prefix
            
            const resp = await auth(prefix, decodedUsername, decodedPassword)
            if ('set-cookie' in resp.headers){
                cookie = resp.headers['set-cookie'][0].split(";")[0]
            }
        }
    } catch (e) {
        console.log(e);
    }
    return cookie
};

async function myTask() {
    try {
        // fetch data here...
        const backendData = "Simulated fetch hello" + Math.random();
        await rememberRunTime();
        const cookie = await getCookie()
        if (cookie){
            await HandleDeclaration()
            console.log('Handling notifications')
        }
        console.log(backendData)
        return cookie
        ? BackgroundFetch.Result.NewData
        : BackgroundFetch.Result.NoData;
    } catch (err) {
        return BackgroundFetch.Result.Failed;
    }
}

async function rememberRunTime() {
    let currentTime = new Date().getTime()
    
    try {
        await AsyncStorage.setItem(
            'backgroundTask',
            currentTime.toString()
        );
    } catch (e) {
        console.log(e);
    }
};

async function initBackgroundFetch(taskName,
                                     taskFn,
                                     interval = 60 * 15) {
    // await TaskManager.unregisterAllTasksAsync()

    try {
        if (!TaskManager.isTaskDefined(taskName)) {
            TaskManager.defineTask(taskName, taskFn);
        }
        const options = {
            minimumInterval: interval, // in seconds
            // stopOnTerminate: false,
            // startOnBoot: true,
        };
        await BackgroundFetch.registerTaskAsync(taskName, options);
    } catch (err) {
        console.log("registerTaskAsync() failed:", err);
    }
}

export default function backgroundTask(taskName){
    initBackgroundFetch(taskName, myTask, 5)
}