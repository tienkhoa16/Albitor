import React, { Component, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Alert,
         TouchableOpacity, Button, SafeAreaView, YellowBox, Linking, Vibration } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomSheet } from 'react-native-btr';
import { Entypo, Feather, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import firebaseDb from '../firebaseDb';
import * as Permissions from 'expo-permissions';
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import AnnouncementButton from './announcement_button';
import _ from 'lodash';
import store from '../store';

const admin = ['E0426339', 'E0407678']

export default class AnnouncementListContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: true,
        announcement: null,
        bottomSheetVisible: false,
        id: '',
        title: '',
        hyperlink: '',
        description: '',
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


  _toggleBottomNavigationView = () => {
    this.setState({ bottomSheetVisible: !this.state.bottomSheetVisible });
  };

  handleSetID = (id) => {
    this.setState({id})
  }

  renderSeparator = () => {
    return (
      <View style={{ height: 1, width: '100%', backgroundColor: "#000"}} />
    );
  }

  handleSetTitle = (title) =>  this.setState({title});
  handleSetHyperlink = (hyperlink) =>  this.setState({hyperlink});
  handleSetDescription = (description) =>  this.setState({description});
  handleSetEdited = (editedBy) => this.setState({lastEditedBy});

  updateAnnouncementList = () =>
    firebaseDb
      .firestore()
      .collection('notice')
      .orderBy('created', 'desc')
      .get()
      .then (querySnapshot => {
        const results = []
        querySnapshot.docs.map(documentSnapshot => results.push({
        ...documentSnapshot.data(),
        id: documentSnapshot.id}))
        this.setState({ isLoading: false, announcement: results })
      }).catch(err => console.error(err))

  handleDeleteAnnouncement = id =>
    firebaseDb
      .firestore()
      .collection('notice')
      .doc(id)
      .delete()
      .then(() => this.updateAnnouncementList())
      .catch(err => console.error(err))

  confirmDelete = (id) => {
    Alert.alert('Delete announcement',
      'Delete this announcement?',
    [
      {text: "Yes", onPress: () => this.handleDeleteAnnouncement(id)},
      {text: "Cancel"}
    ],
    {
      cancellable: true
    })
  }

  componentDidMount() {
    this.getNotificationPermission();
    this.props.navigation.addListener('focus', () => this.updateAnnouncementList())
  }

  componentWillUnmount() {
    this.setState({ isLoading: true })
  }


  render() {
    const { isLoading, announcement } = this.state

    if (isLoading)
      return <ActivityIndicator />

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data = {announcement}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onLongPress={() => {
                if (admin.includes(store.getState().logIn.username)) {
                  this.handleSetID(item.id);
                  this.handleSetTitle(item.title);
                  this.handleSetHyperlink(item.hyperlink);
                  this.handleSetDescription(item.description);
                  this._toggleBottomNavigationView();
                }
              }}
              onPress={() => {
                this.props.navigation.navigate('Announcement View', {
                  id: item.id,
                  title: item.title,
                  hyperlink: item.hyperlink,
                  description: item.description,
                  createdAt:  Date(item.created.toDate()).toString(),
                  createdBy: item.createdBy
                })
              }}>
                <View style={styles.infoBar}>
                  {
                    item.hasBeenEdited ? (
                      <View style={styles.CreatorStyle}>
                        <Text style={styles.creator}>Last edited by {item.lastEditedBy}</Text>
                      </View>
                    ) : (
                      <View style={styles.CreatorStyle}>
                        <Text style={styles.creator}>Posted by {item.createdBy}</Text>
                      </View>
                    )
                  }
                  <View style={styles.DayStyle}>
                    <Text style={styles.date}>{new Date(item.created.toDate()).toString().substr(0, 21)}</Text>
                  </View>
                </View>
                <Text style={styles.TitleStyle}>{item.title}</Text>
                <View style={styles.ContentBox}>
                  <Text style={styles.annStyle} numberOfLines={3} ellipsizeMode='tail'>{item.description}</Text>
                </View>
            </TouchableOpacity>
          )}
          style={styles.container}
          keyExtractor={item => item.title}
          ItemSeparatorComponent={this.renderSeparator}
        />
        <BottomSheet
          visible={this.state.bottomSheetVisible}
          onBackButtonPress={this._toggleBottomNavigationView}
          onBackdropPress={this._toggleBottomNavigationView}
        >
          <View style={styles.bottomNavigationView}>
            <TouchableOpacity
              style={styles.ButtonBoxEdit}
              onPress={() => {
                this._toggleBottomNavigationView();
                this.props.navigation.navigate('Update Announcement',
                  { itemid: this.state.id,
                    title: this.state.title,
                    hyperlink: this.state.hyperlink,
                    description: this.state.description
                  });
              }}>
                <Text style={styles.bottomButton}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ButtonBoxDelete}
              onPress={() => {
                this._toggleBottomNavigationView();
                this.confirmDelete(this.state.id);
              }}>
                <Text style={styles.bottomButton}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ButtonBoxCancel}
              onPress={() => {
                this._toggleBottomNavigationView();
              }}>
                <Text style={styles.bottomButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
        {
          admin.includes(store.getState().logIn.username) ? 
            (<AnnouncementButton onPress={ () => {this.props.navigation.navigate('Add Announcement')} }>
            </AnnouncementButton>) : null
        }
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: '#fcf7bb',
  },
  itemContainer: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fcf7bb',
  },
  optionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 55,
    left: 180,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  DayStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  CreatorStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  ContentBox: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
  date: {
    fontStyle: 'italic'
  },
  creator: {
    fontStyle: 'italic'
  },
  ButtonBoxDelete: {
    paddingTop: 15,
    paddingBottom: 15,
    borderWidth: 1,
    borderBottomColor: 'black',
    borderTopColor: 'orange',
    borderLeftColor: 'orange',
    borderRightColor: 'orange',
    backgroundColor: 'orange',
  },
  ButtonBoxEdit: {
    borderWidth: 1,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomColor: 'black',
    borderTopColor: 'orange',
    borderLeftColor: 'orange',
    borderRightColor: 'orange',
    backgroundColor: 'orange',
  },
  ButtonBoxCancel: {
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: 'orange',
  },
  bottomButton: {
    fontSize: 20,
    textAlign: 'center',
  },
  bottomNavigationView: {
    backgroundColor: 'orange',
    height: 180,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  annStyle: {
    textAlign: 'justify',
    fontSize: 16,
  },
  TitleStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});