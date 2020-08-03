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
        userList: null,
        adminList: null,
    };
    this.props.navigation.setOptions({
      headerStyle: {
        backgroundColor: 'orange',
      },
      headerTitleStyle: {
        textAlign: 'center'
      },
      headerLeft: null
    });
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
      console.log(token);
      this.setState({ notificationToken: token });
      firebaseDb.firestore()
        .collection('users')
        .doc(token)
        .set({
          username: store.getState().logIn.username,
        })
        .catch((err) => console.error(err));
    }
    else {
      alert('Must use physical device for notifications')
    }
  };

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
      .orderBy('createdAtFirebaseTimeStamp', 'desc')
      .get()
      .then (querySnapshot => {
        const results = []
        querySnapshot.docs.map(documentSnapshot => results.push({
        ...documentSnapshot.data(),
        id: documentSnapshot.id}))
        this.setState({ isLoading: false, announcement: results })
      }).catch(err => console.error(err))

  updateAdminList = () => {
    firebaseDb
      .firestore()
      .collection('announcement_admin')
      .get()
      .then (querySnapshot => {
        const results = []
        querySnapshot.docs.map(documentSnapshot => results.push({
          ...documentSnapshot.data()
        }))
        this.setState({ adminList: results.map(item => item.username) })
      }).catch(err => console.error(err))
  }

  handleDeleteAnnouncement = id =>
    firebaseDb
      .firestore()
      .collection('notice')
      .doc(id)
      .delete()
      .then(() => {
        this.updateAnnouncementList()
      })
      .catch(err => console.error(err))

  confirmDelete = (id) => {
    Alert.alert('Delete announcement',
      'Delete this announcement?',
    [
      {text: "Cancel"},
      {text: "Yes", onPress: () => this.handleDeleteAnnouncement(id)}
    ],
    {
      cancellable: true
    })
  }

  componentDidMount() {
    this.getNotificationPermission();
    this.unsubscribe = firebaseDb.firestore().collection('notice').onSnapshot(this.updateAnnouncementList)
    this.unsubscribeUser = firebaseDb.firestore().collection('users').onSnapshot(this.updateDevices)
    this.unsubscribeAdmin = firebaseDb.firestore().collection('announcement_admin').onSnapshot(this.updateAdminList)
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.unsubscribeUser();
    this.unsubscribeAdmin();
  }

  render() {
    const { isLoading, announcement } = this.state
    const adminList = this.state.adminList
    console.log(adminList)

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
                if (adminList) {
                  if (adminList.includes(store.getState().logIn.username) || store.getState().logIn.prefix == "nusstf\\") {
                    this.handleSetID(item.id);
                    this.handleSetTitle(item.title);
                    this.handleSetHyperlink(item.hyperlink);
                    this.handleSetDescription(item.description);
                    this._toggleBottomNavigationView();
                  }
                }
              }}
              onPress={() => {
                this.props.navigation.navigate('Announcement View', {
                  id: item.id,
                  title: item.title,
                  hyperlink: item.hyperlink,
                  description: item.description,
                  createdAt: item.created,
                  createdBy: item.createdBy,
                  edited: item.hasBeenEdited,
                  editedBy: item.lastEditedBy,
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
                    <Text style={styles.date}>{item.created}</Text>
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
                <Text style={styles.bottomButton}>Update</Text>
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
          adminList ? (
            ((adminList.includes(store.getState().logIn.username)) || (store.getState().logIn.prefix == "nusstf\\")) ?
              (<AnnouncementButton onPress={ () => {this.props.navigation.navigate('Add Announcement')} }>
              </AnnouncementButton>) : null
          ) : null
        }
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
  },
  itemContainer: {
    flex: 1,
    marginTop: 5,
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  CreatorStyle: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
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