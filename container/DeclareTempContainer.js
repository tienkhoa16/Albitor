import axios from 'axios';
import querystring from 'querystring';
import React from 'react';
import moment from 'moment';
import { TextInput, StyleSheet, Text, KeyboardAvoidingView, Dimensions } from 'react-native';
import {Picker} from '@react-native-community/picker'

import BlueButton from '../component/BlueButton';
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

    handlePressButton = () => {
        const floatTemp = parseFloat(this.state.temp)

        if(!(34 <= floatTemp && floatTemp <= 40)){
            alert('Temperature must be between 34 and 40')
            this.setState({
                temp: ''
            })
        }
        else{
            (async() =>{
                const resp_code = await submitTemp(floatTemp,this.state.date,this.state.timeOfDay,
                                                this.state.symptoms,this.state.famSymptoms)
                if(resp_code != 200){
                    alert('Failed to declare temperature. HTTP Error Code: ' + resp_code)
                }
                else{
                    alert('Declare '+floatTemp+' \u2103 for '+this.state.timeOfDay+'M on '+this.state.date+' successful!')
                }
            })()
        }   
    }

    render(){
        const {temp, date, timeOfDay, symptoms, famSymptoms} = this.state
        
        return(
            <KeyboardAvoidingView style = {styles.container}>
                <KeyboardAvoidingView style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />
                <Text style = {styles.textWelcome}>Welcome {store.getState().logIn.name}</Text>
                <Text style = {styles.heading}>Temperature Declaration</Text>

                <KeyboardAvoidingView style = {styles.options}>
                    <Text style = {styles.text}>Date: {date} </Text>
                    <Picker
                        mode = 'dropdown'
                        selectedValue = {timeOfDay}
                        style={{height: 50, width: 100, marginTop: 40}}
                        onValueChange={(itemValue, itemIndex) =>
                            this.setState({timeOfDay: itemValue})
                        }
                    >
                        <Picker.Item label="AM" value="A" />
                        <Picker.Item label="PM" value="P" />
                    </Picker>
                </KeyboardAvoidingView>

                <KeyboardAvoidingView style = {styles.options}>
                    <Text style = {styles.text}>Temperature ({'\u2103'})</Text>
                    <TextInput 
                        style = {styles.textInput}
                        placeholder = "Your temperature"
                        onChangeText = {this.handleTemp}
                        value = {temp}
                        keyboardType = 'numeric'
                    />
                </KeyboardAvoidingView>

                <KeyboardAvoidingView style = {styles.options}>    
                    <Text style = {styles.text}>Do you have COVID-19 symptoms?</Text>
                    <Picker
                        mode = 'dropdown'
                        selectedValue = {symptoms}
                        style={styles.picker}
                        onValueChange={(itemValue, itemIndex) =>
                            this.setState({symptoms: itemValue})
                        }
                    >
                        <Picker.Item label="No" value="N" />
                        <Picker.Item label="Yes" value="Y" />
                    </Picker>                
                </KeyboardAvoidingView>

                <Text style = {styles.text}>Do you have anyone in the same household having fever, and/or showing the above stated symptoms?</Text>
                <KeyboardAvoidingView style = {styles.options}>
                    <Picker
                        mode = 'dropdown'
                        selectedValue = {famSymptoms}
                        style={{...styles.picker, marginTop: 0}}
                        onValueChange={(itemValue, itemIndex) =>
                            this.setState({famSymptoms: itemValue})
                        }
                    >
                        <Picker.Item label="No" value="N" />
                        <Picker.Item label="Yes" value="Y" />
                    </Picker>                
                </KeyboardAvoidingView>
                
                <BlueButton
                    style = {styles.button}
                    onPress = {this.handlePressButton}
                >
                    Submit
                </BlueButton>
                
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    textInput:{
        borderWidth: 1,
        width: 130,
        height: 25,
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 14,
        marginBottom: 10,
        marginTop: 40,
        alignSelf: 'center',
        textAlign: 'center',
        borderTopColor: 'white',
        borderRightColor: 'white',
        borderLeftColor: 'white',
    },
    button:{
        marginTop: 42,
        borderRadius: 5,
        width: 150,
        alignSelf: 'center',
    },
    textWelcome:{
        fontSize: 15,
        color: 'green',
        marginTop: 10,
        fontStyle: 'italic',
        textAlign: 'left',
        fontWeight: 'bold',
    },
    text:{
        fontSize: 15,
        color: 'black',
        marginTop: 40,
        textAlign: 'center',
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
        marginTop: 40,
    }
});