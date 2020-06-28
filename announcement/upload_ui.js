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

class AnnouncementForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      hyperlink: '',
      description: '',
      created: '',
      addSuccess: false,
      checked: false,
      hasNotificationPermission: null,
      notificationToken: null,
      notification: {},
      createdBy: '',
      checked: false,
    };
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
              <Text style = {styles.TitleText}> Subject: </Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                placeholder = "Subject"
                textAlignVertical={'top'}
                onChangeText = {this.handleUpdateTitle}
                value = {this.state.title}
              />

              <Text style = {styles.HyperlinkText}> PDF file: </Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                placeholder = "Hyperlink to PDF file"
                textAlignVertical={'top'}
                onChangeText={this.handleUpdateHyperlink}
                value={this.state.hyperlink}
              />

              <Text style = {styles.DescriptionText}> Announcement: </Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                placeholder = "Announcement ..."
                textAlignVertical={'top'}
                onChangeText={this.handleUpdateDescription}
                value={this.state.description}
              />

              <View style={styles.options}>
                <CheckBox
                  checked={this.state.checked}
                  onPress={() => this.setState({ checked: !this.state.checked })}
                  color='#009688'
                />
                <Text>      Send update notification to all users</Text>
              </View>

              <View style = {styles.SubmitButton}>
                <Button
                  color = "blue"
                  title = "Upload"
                  onPress = {() => {
                    if (this.state.title.length && this.state.hyperlink.length && this.state.description.length) {
                      this.handleCreateAnnouncement();
                    }
                    if (this.state.checked) {
                      this.sendPushNotification();
                    }
                  }}
                />
              </View>
              {this.state.addSuccess ? (
                <Text style={styles.check}> ADD SUCCESSFUL! </Text>
              ) : null}
              <View style={{ flex: 1 }} />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  handleCreateAnnouncement = () =>
    firebaseDb.firestore()
      .collection("notice")
      .add({
        description: this.state.description,
        hyperlink: this.state.hyperlink,
        title: this.state.title,
        created: firebaseDb.firestore.FieldValue.serverTimestamp(),
        createdBy: store.getState().logIn.name
      })
      .then(() => {
        this.setState({
          title: '',
          hyperlink: '',
          description: '',
          created: '',
          addSuccess: true,
        })
      })
      .catch((err) => console.error(err));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  inner: {
    padding: 10,
    flex: 1,
    justifyContent: "flex-end",
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
  Box: {
    borderTopColor: 'white',
    borderLeftColor: 'white',
    borderRightColor: 'white',
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
  },
  check: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'green',
    marginTop: 30,
  },
});

export default AnnouncementForm;