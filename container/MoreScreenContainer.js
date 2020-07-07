import React from 'react';
import { StyleSheet, Dimensions, Image, Text, Alert, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialIcons, AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class MoreScreenContainer extends React.Component{
    render(){
        return(
            <SafeAreaView style = {{flex: 1}}>
                <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />
                <Image
                    style = {{
                        alignSelf:'center', 
                        marginTop: 20,
                        borderColor: 'red',
                        marginBottom: 20,
                    }}
                    source = {require('../assets/thermometer_small.png')}
                />

                <TouchableOpacity
                    style = {styles.option}
                    onPress = {() => {
                        this.props.navigation.navigate('Flight')
                    }}
                >
                    <MaterialCommunityIcons name="airplane-takeoff" size={24} color='black' />
                    <Text style = {styles.text}>Overseas Flight Declaration</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style = {styles.option}
                    onPress = {() => {
                        this.props.navigation.navigate('Exemption')
                    }}
                >
                    <AntDesign name="exception1" size={24} color="black" />
                    <Text style = {styles.text}>Exemption Form</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style = {styles.option}
                    onPress = {() => {
                        this.props.navigation.navigate('Emergency')
                    }}
                >
                    <Feather name="phone-call" size={24} color="black" />
                    <Text style = {styles.text}>Emergency Contact</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style = {styles.option}
                    onPress = {() => {
                        this.props.navigation.navigate('ReportBug')
                    }}
                >
                    <MaterialIcons name="bug-report" size={24} color="black" />
                    <Text style = {styles.text}>Report Bug</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style = {styles.option}
                    onPress = {() => {
                        this.props.navigation.navigate('About')
                    }}
                >
                    <AntDesign name="team" size={24} color="black" />
                    <Text style = {styles.text}>About Us</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style = {styles.option}
                    onPress = {() => {
                        this.props.navigation.navigate('Settings')
                    }}
                >
                    <AntDesign name="setting" size={24} color="black" />
                    <Text style = {styles.text}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style = {styles.option}
                    onPress = {() => {
                        Alert.alert(
                            'Logging out',
                            'Are you sure?',
                            [
                              { text: "No" },
                              { text: "Yes",  
                                onPress: () => {
                                    this.props.navigation.navigate('Logout') 
                                }
                              }
                            ],
                            { cancelable: false }
                          )
                    }}
                >
                    <AntDesign name="logout" size={24} color='black' />
                    <Text style = {styles.text}>Log out</Text>
                </TouchableOpacity>

                
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    option:{
        flexDirection: 'row',
        padding: 10,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 1,
        borderWidth: 1,
        borderRadius: 5,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomColor: 'grey',
    },
    text:{
        fontSize: 15,
        marginLeft: 5,
    }
});