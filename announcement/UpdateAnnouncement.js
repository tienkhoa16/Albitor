import React, { Component } from 'react';
import { View, Text,
         ScrollView, StyleSheet, Alert,
         KeyboardAvoidingView,
         TouchableWithoutFeedback, Keyboard, YellowBox,
         Vibration } from 'react-native';
import firebaseDb from '../firebaseDb';
import { CheckBox } from 'react-native-elements';
import store from '../store';
import * as Permissions from 'expo-permissions';
import moment from 'moment';
import { Notifications } from 'expo';
import ExpandingTextInput from './ExpandingTextInput';
import RedButton from '../component/RedButton';
import Constants from 'expo-constants';
import _ from 'lodash';

function getDateTime(){
  const date = moment()
      .format('LLL');
  return date
}

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
      userList: null,
    }
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
      this.setState({ notificationToken: token });
    }
    else {
      alert('Must use physical device for notifications')
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
        created: getDateTime(),
        lastEditedBy: store.getState().logIn.name,
        hasBeenEdited: true,
        createdAtFirebaseTimeStamp: firebaseDb.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        if (this.state.checked) {
          this.sendPushNotification();
        }
        alert('Update announcement successful!')
        this.props.navigation.navigate('Announcement List')
      })
      .catch(err => console.error(err))

  confirmEdit = (itemid) => {
    Alert.alert('Edit announceemnt',
      'Edit this announcement?',
    [
      {text: "Cancel"},
      {text: "Yes", onPress: () => this.handleUpdateAnnouncement(itemid)}
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
    const { itemid, title, hyperlink, description } = this.props.route.params;
    const name = store.getState().logIn.name
    const des = this.state.description
    const _hyperlink = this.state.hyperlink
    const ids = this.state.userList.map(item => item.id)
    const subject = this.state.title
    ids.forEach(async function(id, index) {
      const message = {
        to: id,
        sound: 'default',
        title: 'New announcement updated',
        data: {
          data: 'announcement',
          id: itemid,
          title: subject,
          hyperlink: _hyperlink,
          description: des,
          created: getDateTime(),
          createdBy: '',
          lastEditedBy: store.getState().logIn.name,
          hasBeenEdited: true,
        },
        body: `${name} has updated ${subject}`,
        android: {
          channelId: 'announcement',
          icon: "../assets/thermometer.png",
        },
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
    })
  };

  componentDidMount() {
    const { itemid, title, hyperlink, description } = this.props.route.params;
    this.handleUpdateInfo(title, hyperlink, description);
    this.handleSetCreator(store.getState().logIn.name)
    this.getNotificationPermission();
    this.notificationSubscription = Notifications.addListener(this.handleNotification);
    this.unsubscribeUser = firebaseDb.firestore().collection('users').onSnapshot(this.updateDevices)
  }

  updateDevices = () =>
    firebaseDb
      .firestore()
      .collection('users')
      .get()
      .then (querySnapshot => {
        const results = []
        querySnapshot.docs.map(documentSnapshot => results.push({
        id: documentSnapshot.id}))
        this.setState({ isLoading: false, userList: results })
      }).catch(err => console.error(err))

  componentWillUnmount() {
    this.unsubscribeUser();
  }

  render() {
    const { itemid, title, hyperlink, description } = this.props.route.params;
    return (
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerLayout}>
              <Text style = {styles.TitleText}>Subject: *</Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                defaultValue={this.state.title}
                textAlignVertical={'top'}
                onChangeText = {this.handleSetTitle}
                maxLength = {100}
              />
              {
                (!this.state.title.length) ?
                (
                  <Text style={styles.alertText}>* Required field must not be left blank</Text>
                ) : null
              }
              <Text style = {styles.HyperlinkText}>PDF file:</Text>
              <Text style = {styles.note}>Fill in NA if no PDF is required</Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                defaultValue={this.state.hyperlink}
                textAlignVertical={'top'}
                onChangeText={this.handleSetHyperlink}
              />
              {
                (!this.state.hyperlink.length) ?
                (
                  <Text style={styles.alertText}>* Required field must not be left blank</Text>
                ) : null
              }
              <Text style = {styles.DescriptionText}>Announcement: *</Text>
              <ExpandingTextInput
                multiline
                style = {styles.Box}
                defaultValue={this.state.description}
                textAlignVertical={'top'}
                onChangeText={this.handleSetDescription}
              />
              {
                (!this.state.description.length) ?
                (
                  <Text style={styles.alertText}>* Required field must not be left blank</Text>
                ) : null
              }

              <View style={styles.options}>
                <CheckBox
                  checked={this.state.checked}
                  onPress={() => this.setState({ checked: !this.state.checked })}
                  checkedColor='#009688'
                  title = "Send update notification to all users"
                  containerStyle={{backgroundColor: 'transparent'}}
                  textStyle={{fontSize: 16, color: 'black'}}
                />
              </View>

              <RedButton
                style = {styles.button}
                onPress = {() => {
                  this.confirmEdit(itemid)
                }}
              >
                  UPDATE
              </RedButton>
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
  alertText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 14,
  },
  TitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 10,
  },
  HyperlinkText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  DescriptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  Box: {
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  note: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 10,
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
  button:{
    marginTop: 10,
    borderRadius: 5,
    width: 150,
    alignSelf: 'center',
  },
})