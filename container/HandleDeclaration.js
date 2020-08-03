import AsyncStorage from '@react-native-community/async-storage';
import { Notifications } from 'expo';

import store from '../store';

import getHistory from './GetHistoryHtml';
import getHistoryHtml from './GetHistoryHtml';


const reminderMessage = {
    title: 'Temperature Declaration Time 🔔',
    body: "Time to declare your temperature",
    android: {
        channelId: 'reminders',
        icon: "../assets/thermometer.png",
    }
}

let timeAm_old = 0
let timePm_old = 0

let amId_old = null
let pmId_old = null

function paddingZeros(number){
    if (number >= 10)
        return number.toString()
    else
        return '0' + number.toString()
}

async function readTime() {
    try {
        const notiTime = await AsyncStorage.getItem('notiTime');

        if (notiTime) {
            const myJson = JSON.parse(notiTime);

            timeAm_old = new Date(myJson.timeAm)
            timePm_old = new Date(myJson.timePm)
        }
        else{
            timeAm_old = 0
            timePm_old = 0
        }
    } catch (e) {
        console.log(e);
    }
};

async function readNotiId() {
    try {
        const notiId = await AsyncStorage.getItem('notiId');

        if (notiId) {
            const myJson = JSON.parse(notiId);

            amId_old = myJson.amId
            pmId_old = myJson.pmId
        }
        else{
            amId_old = null
            pmId_old = null
        }
    } catch (e) {
        console.log(e);
    }
};

async function cancelNoti(notiId){
    await Notifications.cancelScheduledNotificationAsync(notiId)
}

async function setReminder (notiTime) {
    let currentDate = new Date().getDate()
    let currentTime = new Date().getTime()
    let time = new Date(notiTime).getTime()

    while (new Date(time).getDate() != currentDate){
        if (time < currentTime)
            time += 86400000
        else    
            time -= 86400000
    }

    time += 86400000

    console.log('New Noti time: ', new Date(time)+0)

    const id = await setNotification(time)

    if (new Date(time).getHours() < 12){
        await readTime()
        await readNotiId()
        await rememberNotiId(id, pmId_old)
        await rememberTime(time, timePm_old)
    }
    else{
        await readTime()
        await readNotiId()
        await rememberNotiId(amId_old, id)
        await rememberTime(timeAm_old, time)
    }
};

async function setNotification(scheduledTime, frequency = 'day') {
    let id = await Notifications.scheduleLocalNotificationAsync(
        reminderMessage, 
        {
            time: scheduledTime,
            repeat: frequency,
        }
    )
    return id
};

async function rememberNotiId (amId, pmId) {
    const notiId = { amId, pmId };
    try {
        await AsyncStorage.setItem(
            'notiId',
            JSON.stringify(notiId)
        );
    } catch (e) {
        console.log(e);
    }
};

async function rememberTime (timeAm, timePm) {
    const notiTime = { timeAm, timePm };
    try {
        await AsyncStorage.setItem(
            'notiTime',
            JSON.stringify(notiTime)
        );
    } catch (e) {
        console.log(e);
    }
};


export default async function HandleDeclaration () {
    await readNotiId()

    if (amId_old && pmId_old){
        await readTime()

        let history = await getHistory(store.getState().logIn.cookie)

        const day = paddingZeros(new Date().getDate())
        const month = paddingZeros(new Date().getMonth() + 1)
        const today = day + '/' +  month

        const todayIndex = history.indexOf(today)
        
        if (todayIndex >= 0){
            history = history.substr(todayIndex)

            const beginIndex = history.indexOf('</td>')
            history = history.substr(beginIndex + 5)

            const endIndex = history.indexOf('</tr>')
            history = history.substr(0, endIndex)

            const countCenter = (history.match(/<td align="center">/g) || []).length
            
            if (countCenter == 6){
                await Notifications.cancelAllScheduledNotificationsAsync()

                await setReminder(timeAm_old)
                await setReminder(timePm_old)
            }
            else if (countCenter == 3){
                await cancelNoti(amId_old)
                await setReminder(timeAm_old)
            }
        }
    }
}