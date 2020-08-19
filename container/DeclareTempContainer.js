import axios from 'axios';
import querystring from 'querystring';
import React from 'react';
import { TouchableOpacity, View, TextInput, StyleSheet, Text, KeyboardAvoidingView, Dimensions, Alert, 
    Keyboard, TouchableWithoutFeedback, ScrollView, Image, Switch, BackHandler, Animated, YellowBox } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import firebaseDb from '../firebaseDb';
import _ from 'lodash';
    
import RedButton from '../component/RedButton';

import store from '../store';

import HandleDeclaration from './HandleDeclaration';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);



async function submitTemp(temp, date, timeOfDay, symptoms, famSymptoms){
    const sessionId = store.getState().logIn.cookie
    console.log('[SUBMIT_TEMP] '+ sessionId)

    console.log('Submitting '+temp+' for '+timeOfDay+'M on '+date)
  
    const htd_url = "https://myaces.nus.edu.sg/htd/htd";
  
    const config = {
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': sessionId
        }
    }
    const data = querystring.stringify({
        'actionName': 'dlytemperature',
        'tempDeclOn': date,
        'declFrequency': timeOfDay,
        'temperature': temp,
        'symptomsFlag': symptoms,
        'familySymptomsFlag': famSymptoms,
    })

    const resp =  await axios.post(htd_url, data, config)
        .then(response => response)
        .catch(err => err.response)

    return resp.status
}

function paddingZeros(hour){
    if (hour >= 10)
        return hour.toString()
    else
        return '0' + hour.toString()
}


export default class DeclareTempContainer extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            temp: '',
            date: paddingZeros(new Date().getDate()) + '/' + paddingZeros(new Date().getMonth() + 1) 
                + '/' + new Date().getFullYear(),
            timeOfDay: (new Date().getHours() < 12 ? 'A' : 'P'),
            isPm: (new Date().getHours() < 12 ? false : true),
            symptoms: 'N',
            famSymptoms: 'N',
            symptoms_bool: false,
            famSymptoms_bool: false,
            backClickCount: 0,
        };

        YellowBox.ignoreWarnings(['Setting a timer']);
        const _console = _.clone(console);
        console.warn = message => {
            if (message.indexOf('Setting a timer') <= -1) {
                _console.warn(message);
            }
        };
    }

    getNotificationPermission = async () => {
        if (Constants.isDevice) {
            const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
            this.setState({ hasNotificationPermission: status === 'granted'});
            if (!this.state.hasNotificationPermission) {
                const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
                this.setState({ hasNotificationPermission: status === 'granted'});
            }
            if (!this.state.hasNotificationPermission) {
                alert('Failed to get push token for push notifications!');
            }
            const token = await Notifications.getExpoPushTokenAsync();
            console.log(token);
            this.setState({ notificationToken: token });
            firebaseDb.firestore()
                .collection('users')
                .doc(token)
                .set({
                username: store.getState().logIn.username,
                name: store.getState().logIn.name
                })
                .catch((err) => console.error(err));
        }
        else {
            alert('Must use physical device for notifications')
        }

        if ( Platform.OS === 'android' ) {
            Notifications.createChannelAndroidAsync('announcement', {
                name: 'Announcement',
                sound: true,
                priority: 'max',
                vibrate: [0, 250, 250, 250],
            });
        
            Notifications.createChannelAndroidAsync('reminders', {
                name: 'Reminders',
                sound: true,
                priority: 'max',
                vibrate: [0, 250, 250, 250],
            });

            Notifications.createChannelAndroidAsync('chat', {
                name: 'Messaging',
                sound: true,
                priority: 'max',
                vibrate: [0, 250, 250, 250],
            });
        }
    };
  
    springValue = new Animated.Value(100);

    handleTemp = (temp) => this.setState({temp});

    handlePressSubmitButton = () => {
        const floatTemp = parseFloat(this.state.temp)

        if (this.state.temp){
            if(!(34 <= floatTemp && floatTemp <= 40)){
                Alert.alert(
                    "Declare Failed",    //Alert Title
                    'Temperature must be between 34\u2103 and 40\u2103', //Alert Message
                    [
                        { text: "OK" }
                    ],
                    { cancelable: false }
                )
            }
            else{
                (async() =>{
                    const resp_code = await submitTemp(floatTemp,this.state.date,this.state.timeOfDay,
                                                    this.state.symptoms,this.state.famSymptoms)

                    if(resp_code != 200){
                        Alert.alert(
                            "Declare Failed",    //Alert Title
                            'Failed to declare temperature. HTTP Error Code: ' + resp_code, //Alert Message
                            [
                                { text: "OK"}
                            ],
                            { cancelable: false }
                        )
                    }
                    else{
                        await HandleDeclaration()
                        Alert.alert(
                            "Declare Succesful",    //Alert Title
                            'Declared '+floatTemp+'\u2103 for '+this.state.timeOfDay+'M on '+this.state.date,    // Alert Message
                            [
                                { text: "See History", onPress: () => this.props.navigation.navigate('History') },
                                { text: "OK", onPress: () => console.log("OK Pressed") }
                            ],
                            { cancelable: false }
                        );
                    }
                })()
            }
        }

        this.setState({
            temp: ''
        })   
    }

    onBackPress = () => {
        this.state.backClickCount == 1 ? BackHandler.exitApp() : this._spring();
        return true;
    }

    async componentDidMount(){      
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        await HandleDeclaration()
        await this.getNotificationPermission()
        Notifications.addListener( notification => {
            console.log(notification);
            if (notification.data.data == "announcement" && notification.origin == "selected" && store.getState().logIn.name)
            {
                console.log(notification.data)
                this.props.navigation.navigate('Announcements', {
                    screen: 'Announcement View',
                    params: {
                        id: notification.data.id,
                        title: notification.data.title,
                        hyperlink: notification.data.hyperlink,
                        description: notification.data.description,
                        createdAt: notification.data.created,
                        createdBy: notification.data.createdBy,
                        lastEditBy: notification.data.lastEditBy,
                        hasBeenEdited: notification.data.hasBeenEdited
                    }
                })
            }
            else if (notification.data.data == "chat" && notification.origin == "selected" && store.getState().logIn.name)
            {
                console.log(notification.data)
                this.props.navigation.navigate('Chat', {
                    screen: 'ChatRoom',
                    params: {
                        f_uid: notification.data.f_id,
                        f_name: notification.data.f_name,
                        f_email: notification.data.f_email,
                        u_uid: notification.data.u_id,
                        u_name: notification.data.u_name,
                        u_email: notification.data.u_email,
                        token: notification.data.f_token,
                    }
                })
            }
        })
    }

    componentWillUnmount(){
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
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
        const {temp, date, timeOfDay, isPm, symptoms, famSymptoms, symptoms_bool, famSymptoms_bool} = this.state
        
        return(
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView>
                    <KeyboardAvoidingView style = {styles.container}>
                        <View style = {{flex: 6}}>
                            <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />

                            <Text style = {styles.textWelcome}>Welcome {store.getState().logIn.name}</Text>

                            <Text style = {styles.heading}>Temperature Declaration</Text>

                            <View style={styles.form}>
                                <View style={{flex: 1, flexDirection: 'column', marginRight: 5}}>
                                    <Text style = {styles.text}>Date: {date} </Text>
                                    <Text style = {styles.text}>Temperature ({'\u2103'})</Text>
                                    <TouchableOpacity
                                        style = {{flexDirection: 'row', marginLeft: 5}}
                                        onPress = { () => {
                                            Alert.alert(
                                                "COVID-19 Symptoms",
                                                "Fever, dry cough, tiredness, sore throat, breathlessness, and loss of sense of smell or taste",
                                                [
                                                    "OK"
                                                ]
                                            )
                                        }}
                                    >

                                            <Text style = {styles.text}>Do you have COVID-19 symptoms? ℹ️</Text>

                                    </TouchableOpacity>
                                    <Text style = {styles.text}>Do you have anyone in the same household having fever, and/or showing the above stated symptoms?</Text>
                                </View>

                                <View style={{flex: 1, flexDirection: 'column', marginLeft: 5}}>
                                    <View style={{flexDirection: 'row'}}>
                                        <Switch
                                            value={isPm}
                                            onValueChange={v => {                                                
                                                this.setState({isPm: !isPm})
                                                if (v)
                                                    this.setState({timeOfDay: 'P'})
                                                else
                                                    this.setState({timeOfDay: 'A'})
                                            }}
                                            style={{marginTop: 7, alignSelf: 'flex-start'}}
                                            trackColor = {{false: '#fbd46d', true: '#5fdde5'}}
                                            thumbColor = {isPm ? '#111d5e':'#fcbf1e'}
                                        />
                                        {
                                            isPm ? 
                                                (<Text style = {styles.amPm}>PM</Text>) : 
                                                (<Text style = {styles.amPm}>AM</Text>)
                                        }   
                                    </View>

                                    <View style={{flexDirection: 'row', marginRight: 5}}>
                                        <TextInput 
                                            style = {styles.textInput}
                                            placeholder = "Your temperature"
                                            placeholderTextColor = 'grey'
                                            onChangeText = {this.handleTemp}
                                            value = {temp}
                                            keyboardType = 'numeric'
                                        />

                                        <View style={styles.CamButton}>
                                            <TouchableOpacity
                                                onPress= { () => { this.props.navigation.navigate('Camera') } }
                                                activeOpacity={0.5}
                                            >
                                                <MaterialCommunityIcons name='camera' size={30} color='black' />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={{flexDirection: 'row'}}>
                                        <Switch
                                            value={symptoms_bool}
                                            onValueChange={v => {
                                                this.setState({symptoms_bool: !symptoms_bool})
                                                if (v)
                                                    this.setState({symptoms: 'Y'})
                                                else
                                                    this.setState({symptoms: 'N'})
                                            }}
                                            style={{marginTop: 18, alignSelf: 'flex-start'}}
                                            trackColor = {{false: '#e7dfd5', true: '#ff7e75'}}
                                            thumbColor = {symptoms_bool ? '#c2180c':'grey'}
                                        />
                                        {
                                            symptoms_bool ? 
                                                (<Text style = {{marginTop: 18, fontSize: 17, fontWeight: 'bold'}}>Yes</Text>) : 
                                                (<Text style = {{marginTop: 18, fontSize: 17, fontWeight: 'bold'}}>No</Text>)
                                        }   
                                    </View>

                                    <View style={{flexDirection: 'row'}}>
                                        <Switch
                                            value={famSymptoms_bool}
                                            onValueChange={v => {
                                                this.setState({famSymptoms_bool: !famSymptoms_bool})
                                                if (v)
                                                    this.setState({famSymptoms: 'Y'})
                                                else
                                                    this.setState({famSymptoms: 'N'})
                                            }}
                                            style={{marginTop: 50, alignSelf: 'flex-start'}}
                                            trackColor = {{false: '#e7dfd5', true: '#ff7e75'}}
                                            thumbColor = {famSymptoms_bool ? '#c2180c':'grey'}
                                        />
                                        {
                                            famSymptoms_bool ? 
                                                (<Text style = {{marginTop: 50, fontSize: 17, fontWeight: 'bold'}}>Yes</Text>) : 
                                                (<Text style = {{marginTop: 50, fontSize: 17, fontWeight: 'bold'}}>No</Text>)
                                        }   
                                    </View>
                                </View>
                            </View>
                            
                            <RedButton
                                style = {styles.button}
                                onPress = {this.handlePressSubmitButton}
                            >
                                Submit
                            </RedButton>
                        </View>
                        
                        <View style = {{flex: 4, marginTop: 20, alignSelf: 'center'}}>
                            <Image 
                                source = {require('../assets/thermometer_lion.png')} 
                            />
                        </View>              

                        <Animated.View style={[styles.animatedView, {transform: [{translateY: this.springValue}]}]}>
                            <Text style={styles.exitTitleText}>Press back again to exit FitNUS</Text>
                        </Animated.View>          
                    </KeyboardAvoidingView>
                </ScrollView>
            </TouchableWithoutFeedback>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    textInput:{
        borderWidth: 1.5,
        width: 130,
        height: 25,
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 14,
        marginBottom: 10,
        marginTop: 10,
        textAlign: 'center',
        borderTopColor: 'white',
        borderRightColor: 'white',
        borderLeftColor: 'white',
        borderBottomColor: 'black',
    },
    button:{
        marginTop: 30,
        borderRadius: 5,
        width: 150,
        alignSelf: 'center',
    },
    textWelcome:{
        fontSize: 15,
        marginTop: 10,
        paddingHorizontal: 10,
        fontStyle: 'italic',
        textAlign: 'left',
        fontWeight: 'bold',
    },
    text:{
        fontSize: 15,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 0,
        marginBottom: 10,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    heading:{
        fontSize: 25,
        color: '#e32012',
        marginTop: 15,
        textAlign: 'center',
        fontFamily: 'PlayfairDisplay_700Bold',
    },
    form: {
        flexDirection: 'row', 
        justifyContent:'space-between', 
        marginTop: 10, 
        marginLeft: 10,
        marginRight: 10,
        borderWidth: 1.2,
        borderRadius: 10,
        backgroundColor: '#ffffff',
    },
    CamButton: {
        alignSelf: 'center',
    },
    animatedView: {
        width: 260,
        position: "absolute",
        top: '100%',
        padding: 10,
        alignSelf: 'center',
        backgroundColor: "#dddddd",
        borderRadius: 130,
    },
    exitTitleText: {
        textAlign: "center",
    },
    amPm: {
        marginTop: 7, 
        fontSize: 17, 
        fontWeight: 'bold',
    },
});