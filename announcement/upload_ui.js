import React, { Component } from 'react';
import { Text,
         StyleSheet,
         View,
         TouchableOpacity,
         Button,
         Image,
         TextInput,
         KeyboardAvoidingView,
         ScrollView,
         Platform,
         TouchableWithoutFeedback,
         Keyboard,
         YellowBox,
         Vibration
         } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import firebaseDb from '../firebaseDb';
import ExpandingTextInput from './ExpandingTextInput';
import { CheckBox } from 'react-native-btr';
import store from '../store';
import _ from 'lodash';

import BlueButton from '../component/BlueButton';

class AnnouncementForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      hyperlink: '',
      description: '',
      created: '',
      checked: false,
      hasNotificationPermission: null,
      notificationToken: null,
      notification: {},
      createdBy: '',
      checked: false,
      submitButtonPressed: false,
    };
    YellowBox.ignoreWarnings(['Setting a timer']);
    const _console = _.clone(console);
    console.warn = message => {
      if (message.indexOf('Setting a timer') <= -1) {
        _console.warn(message);
      }
    };
    this.props.navigation.setOptions({
      headerStyle: {
        backgroundColor: 'orange',
      },
    });
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
      firebaseDb.firestore()
        .collection('users')
        .doc(store.getState().logIn.username)
        .set({
          notificationToken: token
        }, {merge: true })
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

  componentDidMount() {
    this.handleSetCreator(store.getState().logIn.name)
    this.getNotificationPermission();
    this.notificationSubscription = Notifications.addListener(this.handleNotification);
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
      body: `${this.state.createdBy} has posted a new announcement`,
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

  handleAddTokenIfNotExist = (token) =>
  firebaseDb.firestore()
    .collection('users')
    .doc(store.getState().logIn.username)
    .set({
      notificationToken: token
    }, {merge: true })

  handleCreateAnnouncement = () =>
    firebaseDb.firestore()
      .collection("notice")
      .add({
        description: this.state.description,
        hyperlink: this.state.hyperlink,
        title: this.state.title,
        created: firebaseDb.firestore.FieldValue.serverTimestamp(),
        createdBy: store.getState().logIn.name,
        lastEditBy: '',
        hasBeenEdited: false,
      })
      .then(() => {
        alert('Add new announcement successful!')
        this.props.navigation.navigate('Announcement List')
      })
      .catch((err) => console.error(err));

  handleUpdateTitle = (title) => this.setState({title});
  handleUpdateHyperlink = (hyperlink) => this.setState({hyperlink});
  handleUpdateDescription = (description) => this.setState({description});
  handleSetCreator = (createdBy) =>  this.setState({createdBy});

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              <Text style = {styles.TitleText}>Subject: *</Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                placeholder = "Subject"
                textAlignVertical={'top'}
                onChangeText = {this.handleUpdateTitle}
                value = {this.state.title}
              />
              {
                (this.state.submitButtonPressed && !this.state.title.length) ?
                (
                  <Text style={styles.alertText}>* Required field must not be left blank</Text>
                ) : null
              }

              <Text style = {styles.HyperlinkText}>PDF file: *</Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                placeholder = "Hyperlink to PDF file"
                textAlignVertical={'top'}
                onChangeText={this.handleUpdateHyperlink}
                value={this.state.hyperlink}
              />
              {
                (this.state.submitButtonPressed && !this.state.hyperlink.length) ?
                (
                  <Text style={styles.alertText}>* Required field must not be left blank</Text>
                ) : null
              }

              <Text style = {styles.DescriptionText}>Announcement: *</Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                placeholder = "Announcement ..."
                textAlignVertical={'top'}
                onChangeText={this.handleUpdateDescription}
                value={this.state.description}
              />
              {
                (this.state.submitButtonPressed && !this.state.description.length) ?
                (
                  <Text style={styles.alertText}>* Required field must not be left blank</Text>
                ) : null
              }

              <View style={styles.options}>
                <CheckBox
                  checked={this.state.checked}
                  onPress={() => this.setState({ checked: !this.state.checked })}
                  color='#009688'
                />
                <Text>      Send update notification to all users</Text>
              </View>

              <BlueButton
                  style = {styles.button}
                  onPress = {() => {
                    this.setState({submitButtonPressed: true })
                    if (this.state.title.length && this.state.hyperlink.length && this.state.description.length) {
                      this.handleCreateAnnouncement();
                    }
                    if (this.state.checked) {
                      this.sendPushNotification();
                    }
                  }}
              >
                  Submit
              </BlueButton>
              <View style={{ flex: 1 }} />
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
    flexDirection: 'column',
    backgroundColor: '#fcf7bb',
  },
  inner: {
    padding: 10,
    flex: 1,
    justifyContent: "flex-end",
  },
  alertText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 14,
  },
  TitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 10,
  },
  HyperlinkText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  DescriptionText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  Box: {
    borderTopColor: '#fcf7bb',
    borderLeftColor: '#fcf7bb',
    borderRightColor: '#fcf7bb',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  SubmitButton: {
    alignSelf: "center",
    width: 250,
    height: 40,
    borderWidth: 3,
    borderRadius: 5,
    fontWeight: "bold",
    backgroundColor: "#5aa2ff",
    borderColor: '#000000',
    alignItems: 'center'
  },
  submitText: {
    fontSize: 18,
    paddingTop: 3,
    fontWeight: 'bold'
  },
  button:{
    marginTop: 10,
    borderRadius: 5,
    width: 150,
    alignSelf: 'center',
},
});

export default AnnouncementForm;