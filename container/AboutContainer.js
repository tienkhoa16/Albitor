import React from 'react';
import { StyleSheet, ScrollView, Dimensions, Image, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class AboutContainer extends React.Component{
    render(){
        return(
            <SafeAreaView style = {{flex: 1}}>
                <ScrollView>
                    <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />
                    <Text style = {styles.heading}>About FitNUS</Text>
                    <Text style = {styles.text}>
                        FitNUS, a project in Orbital 2020 from Albitor, is designed based on NUS Health 
                        Declaration System. We build this app to help everyone in NUS keep track 
                        of his/her health more conveniently during the COVID-19 pandemic.                        
                    </Text>
                    
                    <Text style = {styles.heading}>Developers</Text>
                    <Text style = {styles.text}>
                        This amazing app is brought to you by the following amazing developers:
                    </Text>
                    <Text style = {styles.name}>Nguyen Tien Khoa</Text>
                    <Text style = {styles.info}>{'\u2022'} Year 1 Computer Engineering</Text>

                    <View style = {styles.line}></View>

                    <Text style = {styles.name}>Vo Quang Hung</Text>
                    <Text style = {styles.info}>{'\u2022'} Year 1 Computer Engineering</Text>

                    <View style = {styles.line}></View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    line:{
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        borderWidth: 1,
        borderRadius: 1,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomColor: 'grey',
    },
    text:{
        fontSize: 15,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 20,
        textAlign: 'justify',
    },
    heading:{
        fontSize: 25,
        color: 'green',
        marginTop: 20,
        textAlign: 'center',
        fontFamily: 'PlayfairDisplay_700Bold',
    },
    name:{
        fontSize: 18,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        fontWeight: 'bold',
    },
    info:{
        fontSize: 15,
        marginLeft: 20,
        marginRight: 10,
        marginTop: 5,
        textAlign: 'justify',
    },
});