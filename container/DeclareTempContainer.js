import axios from 'axios';
import querystring from 'querystring';
import React from 'react';
import moment from 'moment';
import { TouchableOpacity, View, TextInput, StyleSheet, Text, KeyboardAvoidingView, Dimensions, Alert, 
    Keyboard, TouchableWithoutFeedback, ScrollView, Image, Switch, BackHandler, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
    
import BlueButton from '../component/BlueButton';

import store from '../store';

import HandleDeclaration from './HandleDeclaration';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
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
        isPm: (dateTime.charAt(dateTime.length-2) === 'P'),
        symptoms: 'N',
        famSymptoms: 'N',
        symptoms_bool: false,
        famSymptoms_bool: false,
        backClickCount: 0,
    };

    springValue = new Animated.Value(100);

    handleTemp = (temp) => this.setState({temp});

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
                                <View style={{flex: 1, flexDirection: 'column', marginRight: 10}}>
                                    <Text style = {styles.text}>Date: {date} </Text>
                                    <Text style = {styles.text}>Temperature ({'\u2103'})</Text>
                                    <Text style = {styles.text}>Do you have COVID-19 symptoms?</Text>
                                    <Text style = {styles.text}>Do you have anyone in the same household having fever, and/or showing the above stated symptoms?</Text>
                                </View>

                                <View style={{flex: 1, flexDirection: 'column', marginLeft: 10}}>
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



                                    <View style={{flexDirection: 'row'}}>
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
                            
                            <BlueButton
                                style = {styles.button}
                                onPress = {this.handlePressSubmitButton}
                            >
                                Submit
                            </BlueButton>
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
        width: 140,
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
        marginTop: 30,
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
        top: screenHeight-30,
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