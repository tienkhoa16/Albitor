import React, { Component, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Alert,
         TouchableOpacity, Button, SafeAreaView, YellowBox, Linking } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomSheet } from 'react-native-btr';
import { Entypo, Feather, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import firebaseDb from '../firebaseDb';
import AnnouncementButton from './announcement_button';
import ReadMore from 'react-native-read-more-text';
import _ from 'lodash';

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
  }

  componentDidMount() {
    this.props.navigation.addListener('focus', () => this.updateAnnouncementList())
  }

  _toggleBottomNavigationView = () => {
    this.setState({ bottomSheetVisible: !this.state.bottomSheetVisible });
  };

  handleSetID = (id) => {
    this.setState({id})
  }

  handleSetTitle = (title) =>  this.setState({title});
  handleSetHyperlink = (hyperlink) =>  this.setState({hyperlink});
  handleSetDescription = (description) =>  this.setState({description});

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

  render() {
    const { isLoading, announcement } = this.state

    if (isLoading)
      return <ActivityIndicator />

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data = {announcement}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onLongPress={() => {
                this.handleSetID(item.id);
                this.handleSetTitle(item.title);
                this.handleSetHyperlink(item.hyperlink);
                this.handleSetDescription(item.description);
                this._toggleBottomNavigationView();
              }}
              onPress={() => {
                this.props.navigation.navigate('Announcement View', {
                  title: item.title,
                  hyperlink: item.hyperlink,
                  description: item.description
                })
              }}>
                <Text> {new Date(item.created.toDate()).toString()} </Text>
                <Text> {item.title} </Text>
                <Text> {item.hyperlink} </Text>
                <Text numberOfLines={3} ellipsizeMode='tail'> {item.description} </Text>
            </TouchableOpacity>
          )}
          style={styles.container}
          keyExtractor={item => item.title}
        />
        <BottomSheet
          visible={this.state.bottomSheetVisible}
          onBackButtonPress={this._toggleBottomNavigationView}
          onBackdropPress={this._toggleBottomNavigationView}
        >
          <View style={styles.bottomNavigationView}>
            <Button
              onPress={() => {
                this._toggleBottomNavigationView();
                this.confirmDelete(this.state.id);
              }}
              title='Delete announcement'
            />
            <Button
              onPress={() => {
                this._toggleBottomNavigationView();
                this.props.navigation.navigate('Update Announcement',
                  {itemid: this.state.id, title: this.state.title,
                   hyperlink: this.state.hyperlink,
                   description: this.state.description
                  });
              }}
              title='Edit announcement'
            />
          </View>
        </BottomSheet>
        <AnnouncementButton onPress={ () => {this.props.navigation.navigate('Add Announcement')} }>
        </AnnouncementButton>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flex: 1,
  },
  optionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 55,
    left: 180,
  },
  bottomNavigationView: {
    backgroundColor: '#fff',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
});