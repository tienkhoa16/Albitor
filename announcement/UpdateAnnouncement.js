import React, { Component } from 'react';
import { View, FlatList, ActivityIndicator, Text,
         ScrollView, StyleSheet, Alert,
         TouchableOpacity, KeyboardAvoidingView,
         TouchableWithoutFeedback, Keyboard, YellowBox,
         TextInput, Button, Vibration } from 'react-native';
import firebaseDb from '../firebaseDb';
import { NavigationContainer } from '@react-navigation/native';
import { CheckBox } from 'react-native-btr';
import store from '../store';
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';
import ExpandingTextInput from './ExpandingTextInput';
import Constants from 'expo-constants';
import _ from 'lodash';

export default class UpdateAnnouncement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      hyperlink: '',
      description: '',
      created: '',
      isLoading: true,
      announcement: null,
      checked: false,
      hasNotificationPermission: null,
      notificationToken: null,
      notification: {},
      createdBy: '',
    }
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

  handleSetTitle = (title) => this.setState({title});
  handleSetHyperlink = (hyperlink) => this.setState({hyperlink});
  handleSetDescription = (description) => this.setState({description});
  handleSetCreator = (createdBy) =>  this.setState({createdBy});

  handleUpdateAnnouncement = id =>
    firebaseDb
      .firestore()
      .collection('notice')
      .doc(id)
      .set({
        title: this.state.title,
        hyperlink: this.state.hyperlink,
        description: this.state.description,
        created: firebaseDb.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        if (this.state.checked) {
          this.sendPushNotification();
        }
        this.props.navigation.navigate('Announcement List')
      })
      .catch(err => console.error(err))

  confirmEdit = (itemid) => {
    Alert.alert('Edit announceemnt',
      'Edit this announcement?',
    [
      {text: "Yes", onPress: () => this.handleUpdateAnnouncement(itemid)},
      {text: "Cancel"}
    ],
    {
      cancellable: true
    })
  }
  handleUpdateInfo = (title, hyperlink, description) => {
    this.handleSetTitle(title);
    this.handleSetDescription(description);
    this.handleSetHyperlink(hyperlink);
  }

  handleNotification = notification => {
    Vibration.vibrate();
    this.setState({ notification: notification });
  }

  sendPushNotification = async () => {
    const message = {
      to: this.state.notificationToken,
      sound: 'default',
      title: 'New announcement updated',
      body: `${this.state.createdBy} has updated an announcement`,
      _displayInForeground: true,
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  componentDidMount() {
    const { itemid, title, hyperlink, description } = this.props.route.params;
    this.handleUpdateInfo(title, hyperlink, description);
    this.handleSetCreator(store.getState().logIn.name)
    this.getNotificationPermission();
    this.notificationSubscription = Notifications.addListener(this.handleNotification);
  }

  render() {
    const { itemid, title, hyperlink, description } = this.props.route.params;
    return (
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerLayout}>
              <Text style={styles.Header}>UPDATE</Text>
              <Text style = {styles.TitleText}> Subject: </Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                defaultValue={this.state.title}
                textAlignVertical={'top'}
                onChangeText = {this.handleSetTitle}
                maxLength = {100}
              />
              <Text style = {styles.HyperlinkText}> PDF file: </Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                defaultValue={this.state.hyperlink}
                textAlignVertical={'top'}
                onChangeText={this.handleSetHyperlink}
              />
              <Text style = {styles.DescriptionText}> Announcement: </Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                defaultValue={this.state.description}
                textAlignVertical={'top'}
                onChangeText={this.handleSetDescription}
              />

              <View style={styles.options}>
                <CheckBox
                  checked={this.state.checked}
                  onPress={() => this.setState({ checked: !this.state.checked })}
                  color='#009688'
                />
                <Text>      Send update notification to all users</Text>
              </View>

              <View style = {styles.UDButton}>
                <Button
                  color = "blue"
                  title = "Update"
                  onPress={() => {this.confirmEdit(itemid)}}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  Header: {
    fontSize: 26,
    textAlign: 'center',
    color: 'blue'
  },
  TitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 10,
    left: -4,
  },
  HyperlinkText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    left: -4,
  },
  DescriptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    left: -4,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  Box: {
    borderTopColor: 'white',
    borderLeftColor: 'white',
    borderRightColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  UDButton: {
    alignSelf: "center",
    width: 250,
    height: 40,
    borderWidth: 3,
    borderRadius: 5,
    fontWeight: "bold",
    marginBottom: 20,
  },
})