import axios from 'axios';
import querystring from 'querystring';
import React from 'react';
import { View, StyleSheet, Text, Dimensions, Alert, ScrollView, SafeAreaView } from 'react-native';
import { CheckBox } from 'react-native-elements';
    
import RedButton from '../component/RedButton';

import store from '../store';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);


async function submitReason(reasonCode){
    const sessionId = store.getState().logIn.cookie
    console.log('[SUBMIT_EXEMPTION] '+ sessionId)
  
    const htd_url = "https://myaces.nus.edu.sg/htd/htd?loadPage=selfexemption";
  
    const config = {
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': sessionId
        }
    }
    const data = querystring.stringify({
        'actionName': 'selfexemption',
        'excludeReasonCode': reasonCode,
    })

    const resp =  await axios.post(htd_url, data, config)
        .then(response => response)
        .catch(err => err.response)

    return resp.status
}


export default class ExemptionContainer extends React.Component{
    state = {
        reasonCode: '',
        reason1: false,
        reason2: false,
        reason3: false,
        reason4: false,
        reason5: false,
    };

    handlePressSubmitButton = () => {
        (async() =>{
            const resp_code = await submitReason(this.state.reasonCode)

            if(resp_code != 200){
                Alert.alert(
                    "Submitted Failed",    //Alert Title
                    'Failed to declare temperature. HTTP Error Code: ' + resp_code, //Alert Message
                    [
                        { text: "OK"}
                    ],
                    { cancelable: false }
                )
            }
            else{
                alert("Submitted Succesfully");
            }
        })()
    }

    handlePressOption1 = (reason1) => {
        this.setState({
            reason1: !reason1,
            reason2: false,
            reason3: false,
            reason4: false,
            reason5: false,
            reasonCode: '001',
        })
    }

    handlePressOption2 = (reason2) => {
        this.setState({
            reason1: false,
            reason2: !reason2,
            reason3: false,
            reason4: false,
            reason5: false,
            reasonCode: '002',
        })
    }

    handlePressOption3 = (reason3) => {
        this.setState({
            reason1: false,
            reason2: false,
            reason3: !reason3,
            reason4: false,
            reason5: false,
            reasonCode: '003',
        })
    }

    handlePressOption4 = (reason4) => {
        this.setState({
            reason1: false,
            reason2: false,
            reason3: false,
            reason4: !reason4,
            reason5: false,
            reasonCode: '004',
        })
    }

    handlePressOption5 = (reason5) => {
        this.setState({
            reason1: false,
            reason2: false,
            reason3: false,
            reason4: false,
            reason5: !reason5,
            reasonCode: '005',
        })
    }

    render(){
        const {reasonCode, reason1, reason2, reason3, reason4, reason5} = this.state
        
        return(
            <SafeAreaView style = {{flex: 1}}>
                <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />

                <ScrollView style = {{flex: 1}}>
                    <View style = {styles.container}>
                        <Text style = {styles.heading}>Health Declaration{'\n'}Exemption Form</Text>

                        <View style={styles.form}>
                            <Text style = {styles.name}>
                                Name: {store.getState().logIn.name}
                            </Text>

                            <Text style = {styles.text}>
                                I want to be exempted from NUS Health Declaration System because:
                            </Text>

                            <CheckBox
                                title = "I am overseas"
                                checked={reason1}
                                onPress={() => this.handlePressOption1(reason1)}
                                containerStyle={styles.checkBoxContainer}
                                textStyle={{...styles.checkBoxText, fontWeight: reason1? 'bold' : 'normal'}}
                            />

                            <CheckBox
                                title = "I have declared my temperature at my own workplace (interns, part-time student, adjunct and seconded staff)"
                                checked={reason2}
                                onPress={() => this.handlePressOption2(reason2)}
                                containerStyle={styles.checkBoxContainer}
                                textStyle={{...styles.checkBoxText, fontWeight: reason2? 'bold' : 'normal'}}
                            />

                            <CheckBox
                                title = "I am a staff seconded to another organization"
                                checked={reason3}
                                onPress={() => this.handlePressOption3(reason3)}
                                containerStyle={styles.checkBoxContainer}
                                textStyle={{...styles.checkBoxText, fontWeight: reason3? 'bold' : 'normal'}}
                            />

                            <CheckBox
                                title = "I have a joint appointment with NUH or SingHealth"
                                checked={reason4}
                                onPress={() => this.handlePressOption4(reason4)}
                                containerStyle={styles.checkBoxContainer}
                                textStyle={{...styles.checkBoxText, fontWeight: reason4? 'bold' : 'normal'}}
                            />

                            <CheckBox
                                title = "I am on long term leave (e.g. maternity leave, sabbatical leave, national service)"
                                checked={reason5}
                                onPress={() => this.handlePressOption5(reason5)}
                                containerStyle={styles.checkBoxContainer}
                                textStyle={{...styles.checkBoxText, fontWeight: reason5? 'bold' : 'normal'}}
                            />

                            <Text style = {{...styles.text, fontStyle: 'italic', textDecorationLine: 'underline'}}>NOTE:</Text>
                            <Text style = {styles.text}>
                                {'\u2022'} If the exemption applies only for a certain period, please disable 
                                the exemption when the reason for exemption is no longer valid.
                            </Text>
                            <Text style = {styles.text}>
                                {'\u2022'} For perpetual exemptions, you only need to do it once. No further action is needed.
                            </Text>
                        </View>
                        <RedButton
                            style = {styles.button}
                            onPress = {this.handlePressSubmitButton}
                        >
                            Submit
                        </RedButton>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    button:{
        marginTop: 20,
        borderRadius: 5,
        alignSelf: 'center',
    },
    name:{
        fontSize: 15,
        color: 'black',
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontWeight: 'bold',
    },
    text:{
        fontSize: 15,
        color: 'black',
        paddingVertical: 3,
        paddingHorizontal: 10,
        textAlign: 'justify',
    },
    heading:{
        fontSize: 25,
        color: '#e32012',
        marginTop: 20,
        textAlign: 'center',
        fontFamily: 'PlayfairDisplay_700Bold',
        paddingHorizontal: 10,
    },
    form: {
        marginTop: 10, 
        marginLeft: 10,
        marginRight: 10,
        borderWidth: 1.2,
        borderRadius: 10,
        backgroundColor: '#ffffff',
    },
    checkBoxContainer: {
        backgroundColor: 'transparent', 
        borderWidth: 0, 
        marginLeft: 0, 
        marginTop: -10,
    },
    checkBoxText: {
        color: 'black', 
        fontSize: 15, 
        marginTop: -4,
        marginLeft: 5,
        textAlign: 'justify',
    },
});