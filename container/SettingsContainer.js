import React from 'react';
import { View, StyleSheet, Text, Dimensions, Alert, Switch, SafeAreaView, TouchableOpacity,
    Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import SegmentedPicker from 'react-native-segmented-picker';
import { Entypo } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';
import Constants from 'expo-constants';


import BlueButton from '../component/BlueButton';


const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);


function createTimeData(isAm){
	let options = [
        {
            key: 'col_1', 
            items:[],
            flex: 5,
        },
        {
            key: 'separator',
            items:[{label: ':', value: ':'}],
            flex: 1,
        },
        {
            key: 'col_2',
            items: [],
            flex: 5,
        }
        
    ];
    
    for(let i = (isAm ? 0 : 12); i < (isAm ? 12 : 24); i++)
        options[0].items.push({
            label: paddingZeros(i),
            value: i.toString()
        })
        
    for(let i=0;i<60;i++)
        options[2].items.push({
            label: paddingZeros(i), 
            value: i.toString()
        })
	return options;
};

function paddingZeros(hour){
    if (hour >= 10)
        return hour.toString()
    else
        return '0' + hour.toString()
}


export default class SettingsContainer extends React.Component{
    state = {
        reminderOn: false,
        reminderSet: false,
        hourAm: new Date().getHours() >= 12 ? new Date().getHours()-12 : new Date().getHours(),
        minuteAm: new Date().getMinutes(),
        hourPm: new Date().getHours() >= 12 ? new Date().getHours() : new Date().getHours()+12,
        minutePm: new Date().getMinutes(),
        hasNotificationPermission: null,
        notificationToken: null,
        notification: {},
        reminderMessage: {
            title: 'Temperature Declaration Time',
            body: "You haven't declared your temperature twice today",
        }
    };

    async componentDidMount() {
        await this.read()
        this.getNotificationPermission();
        this.notificationSubscription = Notifications.addListener(this.handleNotification);
    }

    amPicker = React.createRef();
    pmPicker = React.createRef();

    onConfirmAm = (selections) => {
        this.setState({
            hourAm: parseInt(selections["col_1"], 10),
            minuteAm: parseInt(selections["col_2"], 10),
        })
    }

    onConfirmPm = (selections) => {
        this.setState({
            hourPm: parseInt(selections["col_1"], 10),
            minutePm: parseInt(selections["col_2"], 10),
        })
    }

    onChangeAm = ({ column, value }) => {
        if (column == 'col_1')
            this.setState({
                hourAm: parseInt(value, 10),
            })
        else   
            this.setState({
                minuteAm: parseInt(value, 10),
            })
    }

    onChangePm = ({ column, value }) => {
        if (column == 'col_1')
            this.setState({
                hourPm: parseInt(value, 10),
            })
        else   
            this.setState({
                minutePm: parseInt(value, 10),
            })
    }

    handlePressButton =  async () => {
        const {hourAm, minuteAm, hourPm, minutePm} = this.state
        await this.remember(hourAm, minuteAm, hourPm, minutePm)
        await this.setReminder()
        this.setState({reminderSet: true})
        alert('Set reminders successful')
    }

    remember = async (hourAm, minuteAm, hourPm, minutePm) => {
        let amTime = new Date().setHours(hourAm, minuteAm, 0)
        let pmTime = new Date().setHours(hourPm, minutePm, 0)
        const notiTime = { amTime, pmTime };
        try {
            await AsyncStorage.setItem(
                'notiTime',
                JSON.stringify(notiTime)
            );
        } catch (e) {
            console.log(e);
        }
    };

    clear = async () => {
        try {
            await AsyncStorage.removeItem('notiTime');
            this.setState({reminderSet: false})
            Notifications.cancelAllScheduledNotificationsAsync()
        } catch (e) {
            console.log(e);
        }
    };

    read = async () => {
        try {
            const notiTime = await AsyncStorage.getItem('notiTime');
    
            if (notiTime) {
                const myJson = JSON.parse(notiTime);

                this.setState({
                    reminderOn: true,
                    reminderSet: true,
                    hourAm: parseInt(new Date(myJson.amTime).getHours(), 10),
                    minuteAm: parseInt(new Date(myJson.amTime).getMinutes(), 10),
                    hourPm: parseInt(new Date(myJson.pmTime).getHours(), 10),
                    minutePm: parseInt(new Date(myJson.pmTime).getMinutes(), 10),
                });
            }
        } catch (e) {
            console.log(e);
        }
    };

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
            console.log(token); // test token
            this.setState({ notificationToken: token });
            }
        else {
            alert('Must use physical device for notifications')
        }
    
        if ( Platform.OS === 'android' ) {
            Notifications.createChannelAndroidAsync('default', {
                name: 'default',
                sound: true,
                priority: 'max',
                vibrate: [0, 250, 250, 250],
            });
        }
    };

    handleNotification = notification => {
        Vibration.vibrate();
        this.setState({ notification: notification });
    }

    setReminder = async () => {
        const {hourAm, minuteAm, hourPm, minutePm, hasNotificationPermission, reminderMessage} = this.state

        if(hasNotificationPermission){
            Notifications.cancelAllScheduledNotificationsAsync()
            
            Notifications.scheduleLocalNotificationAsync(
                reminderMessage, 
                {
                   time: new Date().setHours(hourAm, minuteAm, 0, 0),
                   repeat: 'day',
                }
            )
            Notifications.scheduleLocalNotificationAsync(
                reminderMessage, 
                {
                   time: new Date().setHours(hourPm, minutePm, 0, 0),
                   repeat: 'day',
                }
            )
        }
    };

    render(){
        const {reminderOn, hourAm, minuteAm, hourPm, minutePm, reminderSet} = this.state
        
        return(
            <SafeAreaView style = {styles.container}>
                <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />

                <View style={{...styles.container, paddingHorizontal: 10}}>
                    <Text style = {styles.heading}>Settings</Text>

                    <View style = {{flexDirection: 'row', alignContent: 'stretch', marginTop: 10}}>
                        <Text style = {styles.text}>Reminders for Declaring Temperature</Text>
                        
                        <Switch
                            style={styles.switch}
                            value={reminderOn}
                            onValueChange={async (v) => {
                                if (!v && reminderSet) {
                                    Alert.alert(
                                        'Delete Reminders',
                                        'Are you sure?',
                                        [
                                            {
                                                text: 'No'
                                            },
                                            {
                                                text: 'Yes', 
                                                onPress: async () =>{
                                                    this.setState({reminderOn: !reminderOn})
                                                    await this.clear()
                                                } 
                                            }
                                        ]
                                    )
                                }
                                else
                                    this.setState({reminderOn: !reminderOn})
                            }}
                        />
                    </View>
                    {
                        reminderOn ? 
                            (
                                <View style = {{flex: 1, marginTop: 5, paddingHorizontal: 10}}>
                                    <Text style={styles.content}>Remind me everyday at:</Text>

                                    <View style = {{flexDirection: 'row', alignContent: 'stretch', marginTop: 10}}>
                                        <Text style={styles.amPm}>AM session</Text>
                                        <TouchableOpacity 
                                            style={{flex:1, flexDirection: 'row'}}
                                            onPress={() => this.amPicker.current.show()}
                                        >
                                            <Text style={styles.time}>{paddingZeros(hourAm)} : {paddingZeros(minuteAm)}</Text>
                                            <Entypo 
                                                name="chevron-small-down" 
                                                size={24} 
                                                color="black" 
                                                style={styles.arrow}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <SegmentedPicker
                                        ref={this.amPicker}
                                        onConfirm={this.onConfirmAm}
                                        onValueChange={this.onChangeAm}
                                        options={createTimeData(true)}
                                        
                                    />

                                    <View style = {{flexDirection: 'row', alignContent: 'space-between', marginTop: 10}}>
                                        <Text style={styles.amPm}>PM session</Text>
                                        <TouchableOpacity 
                                            style={{flex:1, flexDirection: 'row'}}
                                            onPress={() => this.pmPicker.current.show()}
                                        >
                                            <Text style={styles.time}>{paddingZeros(hourPm)} : {paddingZeros(minutePm)}</Text>
                                            <Entypo 
                                                name="chevron-small-down" 
                                                size={24} 
                                                color="black" 
                                                style={styles.arrow}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <SegmentedPicker
                                        ref={this.pmPicker}
                                        onConfirm={this.onConfirmPm}
                                        onValueChange={this.onChangePm}
                                        options={createTimeData(false)}
                                    />

                                    <BlueButton
                                        style={styles.button}
                                        onPress={this.handlePressButton}
                                    >
                                        Set
                                    </BlueButton>
                                </View>
                            ) :
                            (
                                <Text style={styles.content}>
                                    Turn on to receive reminder notifications for declaring temperature 
                                    twice a day with your own choice of time
                                </Text>
                            )
                    }
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    text:{
        fontSize: 16,
        color: 'black',
        marginTop: 5,
        flex: 3,
        fontWeight: 'bold',
    },
    content:{
        fontSize: 16,
        color: 'black',
        marginTop: 5,
        fontStyle: 'italic',
    },
    amPm:{
        fontSize: 16,
        color: 'black',
        marginTop: 5,
        marginLeft: 20,
        fontStyle: 'italic',
        flex: 1,
    },
    time:{
        fontSize: 16,
        color: 'black',
        marginTop: 5,
        marginLeft: 20,
        fontStyle: 'italic',
        flex: 1,
    },
    arrow:{
        flex: 1,
        alignSelf: 'flex-start',
        marginTop: 3,
        marginLeft: -50,
    },  
    switch:{
        flex: 1,
        marginTop: 5,
    },
    heading:{
        fontSize: 25,
        color: 'brown',
        marginTop: 20,
        textAlign: 'center',
        fontFamily: 'PlayfairDisplay_700Bold',
        paddingHorizontal: 10,
    },
    button:{
        marginTop: 30,
        borderRadius: 5,
        alignSelf: 'center',
    },
});

// import React, { Component } from 'react';
// import SegmentedPicker from 'react-native-segmented-picker';
// import {Text, View} from 'react-native';
 
// export default class Demo extends Component {
//   constructor(props) {
//     super(props);
//     this.segmentedPicker = React.createRef();
//   }
 
//   onConfirm = (selections) => {
//     console.info(selections);
//   }
 
//   render() {
//     return (
//       <View>
//         <Text
//             style={{marginTop: 300}}
//             onPress={() => this.segmentedPicker.current.show()}>
//             Click me
//         </Text>

//         <SegmentedPicker
//             ref={this.segmentedPicker}
//             onConfirm={this.onConfirm}
//             defaultSelections={{'col_1': 'option_3', 'col_2': 'option_5'}}
//             options={[
//             {
//                 key: 'col_1',
//                 items: [
//                     { label: 'Option 1', value: 'option_1' },
//                     { label: 'Option 2', value: 'option_2' },
//                     { label: 'Option 3', value: 'option_3' },
//                 ],
//             },
//             {
//                 key: 'col_2',
//                 items: [
//                     { label: 'Option 4', value: 'option_4' },
//                     { label: 'Option 5', value: 'option_5' },
//                 ],
//             },
//             ]}
//         />
//       </View>
//     );
//   }
// }