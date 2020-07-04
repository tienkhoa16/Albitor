import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet, Linking } from 'react-native';
import BlueButton from '../component/BlueButton';

const screenWidth = Math.round(Dimensions.get('window').width);


export default class FlightContainer extends React.Component {
    render() {
        return (
            <ScrollView style={styles.container}>
                <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />

                <Text style = {styles.heading}>COVID-19 Emergency Contact</Text>               
                <Text style = {styles.text}>{'\u2022'} Questions on COVID-19-related NUS matters</Text> 

                <View style = {{paddingHorizontal: 10, flexDirection: 'row'}}>
                    <View style = {{...styles.header, flex: 0.65, borderTopColor: 'black'}}></View>
                    <Text style = {{...styles.header, borderTopColor: 'black', fontWeight: 'bold'}}>For Students</Text>
                    <Text style = {{...styles.header, borderTopColor: 'black', borderRightColor: 'black', fontWeight: 'bold'}}>For Staff</Text>
                </View>

                <View style = {{paddingHorizontal: 10, flexDirection: 'row'}}>
                    <Text style = {{...styles.header, flex: 0.65, fontWeight: 'bold'}}>Tel</Text>
                    <Text 
                        style = {styles.tableContent}
                        onPress = {() => Linking.openURL('tel:+65 98000028')}
                    >
                        +65 98000028
                    </Text>
                    <Text 
                        style = {{...styles.tableContent, borderRightColor: 'black'}}
                        onPress = {() => Linking.openURL('tel:+65 65162331')}
                    >
                        +65 65162331
                    </Text>
                </View>

                <View style = {{paddingHorizontal: 10, flexDirection: 'row'}}>
                    <Text style = {{...styles.header, flex: 0.65, fontWeight: 'bold'}}>Email</Text>
                    <Text 
                        style = {styles.tableContent}
                        onPress = {() => Linking.openURL('mailto: osaresponds@nus.edu.sg')}
                    >
                        osaresponds@nus.edu.sg
                    </Text>
                    <Text 
                        style = {{...styles.tableContent, borderRightColor: 'black'}}
                        onPress = {() => Linking.openURL('mailto: ohrsharedservices@nus.edu.sg')}
                    >
                        ohrsharedservices@nus.edu.sg
                    </Text>
                </View>

                <Text style = {styles.text}>{'\u2022'} Campus Security</Text>
                <View style = {{paddingHorizontal: 10, flexDirection: 'row'}}>
                    <Text style = {styles.campus}>Kent Ridge Campus</Text>
                    <Text 
                        style = {{...styles.campus, color: 'blue', textDecorationLine: 'underline'}}
                        onPress = {() => Linking.openURL('tel:68741616')}
                    >
                        68741616
                    </Text>
                </View>

                <View style = {{paddingHorizontal: 10, flexDirection: 'row'}}>
                    <Text style = {styles.campus}>Bukit Timah Campus</Text>
                    <Text 
                        style = {{...styles.campus, color: 'blue', textDecorationLine: 'underline'}}
                        onPress = {() => Linking.openURL('tel:65163636')}
                    >
                        65163636
                    </Text>
                </View>

                <View style = {{flexDirection: 'row'}}>
                    <Text style = {styles.text}>{'\u2022'} SCDF Emergency Medical Services</Text>
                    <Text 
                        style = {{...styles.campus, color: 'blue', textDecorationLine: 'underline', marginTop: 10}}
                        onPress = {() => Linking.openURL('tel:995')}
                    >
                        995
                    </Text>
                </View>

                <Text style = {styles.text}>{'\u2022'} NUS Counselling {'\&'} Psychological Services</Text>
                <View style = {{paddingHorizontal: 10, flexDirection: 'row'}}>
                    <Text style = {styles.campus}>Mainline</Text>
                    <Text 
                        style = {{...styles.campus, color: 'blue', textDecorationLine: 'underline'}}
                        onPress = {() => Linking.openURL('tel:65162376')}
                    >
                        65162376
                    </Text>
                </View>
                <View style = {{paddingHorizontal: 10, flexDirection: 'row'}}>
                    <Text style = {styles.campus}>Lifeline</Text>
                    <Text 
                        style = {{...styles.campus, color: 'blue', textDecorationLine: 'underline'}}
                        onPress = {() => Linking.openURL('tel:65167777')}
                    >
                        65167777
                    </Text>
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fcf7bb',
    },
    heading:{
        fontSize: 25,
        color: 'green',
        marginTop: 20,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        paddingHorizontal: 10,
    },
    text:{
        flex: 1,
        fontSize: 16,
        color: 'black',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    campus:{
        flex: 1,
        fontSize: 16,
        color: 'black',
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        textAlign: 'justify',
    },
    tableContent:{
        flex: 2,
        fontSize: 15,
        color: 'blue',
        textDecorationLine: 'underline',
        textAlign: 'center',
        borderBottomColor: 'black',
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderWidth: 1,
        padding: 10,
    },
    header:{
        flex: 2,
        fontSize: 15,
        color: 'black',
        textAlign: 'center',
        borderBottomColor: 'black',
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderWidth: 1,
        padding: 10,
    },
})