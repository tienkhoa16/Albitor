import axios from 'axios';
import querystring from 'querystring';

import store from '../store';

export default async function getHistoryHtml(){
    let sessionId = store.getState().logIn.cookie;

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
    resp = resp.replace('cellspacing="1"', 'cellspacing="0"')
    resp = resp.replace(/Temperature/g, "Temp")
    resp = resp.replace(/\/2020 /g, "")
    resp = resp.replace(/Monday/g, "Mon")
    resp = resp.replace(/Tuesday/g, "Tue")
    resp = resp.replace(/Wednesday/g, "Wed")
    resp = resp.replace(/Thursday/g, "Thu")
    resp = resp.replace(/Friday/g, "Fri")
    resp = resp.replace(/Saturday/g, "Sat")
    resp = resp.replace(/Sunday/g, "Sun")
    resp = resp.replace(/COVID-19/g, "COVID")
    resp = resp.replace(/symptoms/g, "sx")
    resp = resp.replace(/S.No/g, "No")
    resp = resp.replace(/<br\/>/g, " ")
    resp = resp.replace(/household/g, "home")
    resp = resp.replace(/having/g, "with")
    return resp;
}