import axios from 'axios';
import querystring from 'querystring';
import store from '../store';

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

export default async function getNameAndCookie(username, password){
    const resp = await auth(username, password)

    if ('set-cookie' in resp.headers){
        store.dispatch({
            type: 'UPDATE',
            payload: {
                updateName: getName(resp.data),
                updateCookie: resp.headers['set-cookie'][0].split(";")[0],
            }
        })
    }
}