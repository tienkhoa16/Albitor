import axios from 'axios';
import querystring from 'querystring';

import store from '../store';

export default async function getHistoryHtml(){
    var sessionId = store.getState().logIn.cookie;

    const url = 'https://myaces.nus.edu.sg/htd/htd?loadPage=viewtemperature&actionToDo=NUS';

    const config = {
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': sessionId
        }
    }
    const data = querystring.stringify({
        'actionName': 'viewtemperature',
    })

    let resp =  await axios.post(url, data, config)
        .then(response => response.data)
        .catch(err => err.response.data)

    // resp = resp.data
    resp = resp.substr(resp.indexOf('<table id'))
    resp = resp.substr(0, resp.indexOf('</table>')+8)
    return resp;
}