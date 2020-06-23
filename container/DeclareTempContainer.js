import axios from 'axios';
import querystring from 'querystring';
import React from 'react';
import moment from 'moment';
import { TextInput, StyleSheet, Text, KeyboardAvoidingView, Dimensions, Alert, Keyboard, TouchableWithoutFeedback, Picker, SafeAreaView, Image } from 'react-native';

import BlueButton from '../component/BlueButton';

import CameraButton from '../camera/cameraButton';
import CameraUI from '../camera/camera_ui';

import store from '../store';

const screenWidth = Math.round(Dimensions.get('window').width);
const dateTime = getDateTime();



function getDateTime(){
    const date = moment()
        .utcOffset('+08:00')
        .format('DD/MM/YYYY A');
    return date
}

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

export default class DeclareTempContainer extends React.Component{
    state = {
        temp: '',
        date: dateTime.substr(0,dateTime.length-3),
        timeOfDay: dateTime.charAt(dateTime.length-2),
        symptoms: 'N',
        famSymptoms: 'N',
    };
    
    handleTemp = (temp) => this.setState({temp});
    handleTimeOfDay = (timeOfDay) => this.setState({timeOfDay});
    handleTimeOfDay = (symptoms) => this.setState({symptoms});
    handleTimeOfDay = (famSymptoms) => this.setState({famSymptoms});

    handlePressSubmitButton = () => {
        const floatTemp = parseFloat(this.state.temp)

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
                    Alert.alert(
                        "Declare Succesful",    //Alert Title
                        'Declared '+floatTemp+'\u2103 for '+this.state.timeOfDay+'M on '+this.state.date,    // Alert Message
                        [
                            {
                                text: "See Declare History",
                                onPress: () => {
                                    console.log("See Declare History Pressed")
                                    while(!store.getState().history.htmlTable){};
                                    this.props.navigation.navigate('History')
                                }
                            },
                            { text: "OK", onPress: () => console.log("OK Pressed") }
                        ],
                        { cancelable: false }
                      );
                }
            })()
        }

        this.setState({
            temp: ''
        })   
    }

    handlePressHistoryButton = () => {this.props.navigation.navigate('History')}

    handlePressFlightButton = () => {this.props.navigation.navigate('Flight')}

    render(){
        const {temp, date, timeOfDay, symptoms, famSymptoms} = this.state
        
        return(
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <SafeAreaView style = {styles.container}>
                    <KeyboardAvoidingView style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />

                    <Text style = {styles.textWelcome}>Welcome {store.getState().logIn.name}</Text>

                    <Text style = {styles.heading}>Temperature Declaration</Text>

                    <KeyboardAvoidingView style={styles.form}>
                        <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', marginRight: 10}}>
                            <Text style = {styles.text}>Date: {date} </Text>
                            <Text style = {styles.text}>Temperature ({'\u2103'})</Text>
                            <Text style = {styles.text}>Do you have COVID-19 symptoms?</Text>
                            <Text style = {styles.text}>Do you have anyone in the same household having fever, and/or showing the above stated symptoms?</Text>
                        </KeyboardAvoidingView>

                        <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', marginLeft: 10}}>
                            <Picker
                                mode = 'dropdown'
                                selectedValue = {timeOfDay}
                                style={styles.picker}
                                onValueChange={(itemValue, itemIndex) =>
                                    this.setState({timeOfDay: itemValue})
                                }
                            >
                                <Picker.Item label="AM" value="A" />
                                <Picker.Item label="PM" value="P" />
                            </Picker>

                            <KeyboardAvoidingView style={{flexDirection: 'row'}}>
                                <TextInput 
                                    style = {{...styles.textInput}}
                                    placeholder = "Your temperature"
                                    onChangeText = {this.handleTemp}
                                    value = {temp}
                                    keyboardType = 'numeric'
                                />
                                <CameraButton/>
                            </KeyboardAvoidingView>

                            <Picker 
                                mode = 'dropdown'
                                selectedValue = {symptoms}
                                style={{...styles.picker, marginTop: 5}}
                                onValueChange={(itemValue, itemIndex) =>
                                    this.setState({symptoms: itemValue})
                                }
                            >
                                <Picker.Item label="No" value="N" />
                                <Picker.Item label="Yes" value="Y" />
                            </Picker>    

                            <Picker
                                mode = 'dropdown'
                                selectedValue = {famSymptoms}
                                style={{...styles.picker, marginTop: 20}}
                                onValueChange={(itemValue, itemIndex) =>
                                    this.setState({famSymptoms: itemValue})
                                }
                            >
                                <Picker.Item label="No" value="N" />
                                <Picker.Item label="Yes" value="Y" />
                            </Picker>      
                        </KeyboardAvoidingView>
                    </KeyboardAvoidingView>
                    
                    <BlueButton
                        style = {styles.button}
                        onPress = {this.handlePressSubmitButton}
                    >
                        Submit
                    </BlueButton>

                    <Image 
                        style = {{marginTop: 10, scaleX: 0.7, scaleY: 0.7}}
                        source = {require('../assets/nus_lion.png')} 
                    />


                    {/* <BlueButton
                        style = {styles.button}
                        onPress = {this.handlePressHistoryButton}
                    >
                        History
                    </BlueButton>

                    <BlueButton
                        style = {styles.button}
                        onPress = {this.handlePressFlightButton}
                    >
                        Flight
                    </BlueButton> */}
                    
                </SafeAreaView>
            </TouchableWithoutFeedback>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#dbc6eb',
    },
    textInput:{
        borderWidth: 1,
        width: 140,
        height: 25,
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 14,
        marginBottom: 10,
        // marginTop: 20,
        // alignSelf: 'center',
        textAlign: 'center',
        borderTopColor: 'white',
        borderRightColor: 'white',
        borderLeftColor: 'white',
    },
    button:{
        marginTop: 40,
        borderRadius: 5,
        width: 150,
        alignSelf: 'center',
    },
    textWelcome:{
        fontSize: 15,
        color: 'green',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        fontStyle: 'italic',
        textAlign: 'left',
        fontWeight: 'bold',
    },
    text:{
        fontSize: 15,
        color: 'black',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 0,
        marginBottom: 10,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    heading:{
        fontSize: 25,
        color: 'red',
        marginTop: 30,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    picker:{
        height: 50,
        width: 100,
        marginTop: -6,
    },
    form: {
        flexDirection: 'row', 
        justifyContent:'space-between', 
        marginTop: 10, 
        marginLeft: 10,
        marginRight: 10,
        borderWidth: 1.2,
        borderRadius: 10,
        backgroundColor: 'white',
        shadowOpacity: 0.1,
    }
});