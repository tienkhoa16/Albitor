import React, { Component, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Alert,
         TouchableOpacity, Button, SafeAreaView, YellowBox, Linking } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import firebaseDb from '../firebaseDb';
import HeaderDeleteButton from './Header_DeleteButton';
import HeaderEditButton from './Header_EditButton';
import { AntDesign } from '@expo/vector-icons';

export default class AnnouncementView extends Component {
  constructor(props) {
    super(props);
    this.state={
      id: '',
      title: '',
      hyperlink: '',
      description: '',
    }
    this.props.navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <HeaderDeleteButton onPress={async () => this.confirmDelete(this.state.id)} />
          <HeaderEditButton onPress={async () => {
            const {id, title, hyperlink, description} = this.props.route.params;
            this.props.navigation.navigate('Update Announcement', {
              itemid: id,
              title: title,
              hyperlink: hyperlink,
              description: description
            });
            }} />
        </View>
      ),
    });
  }

  handleDeleteAnnouncement = id =>
    firebaseDb
      .firestore()
      .collection('notice')
      .doc(id)
      .delete()
      .then(() => this.props.navigation.navigate('Announcement List'))
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

  handleSetID = (id) => this.setState({id})
  handleSetTitle = (title) => this.setState({title});
  handleSetHyperlink = (hyperlink) => this.setState({hyperlink});
  handleSetDescription = (description) => this.setState({description});

  handleUpdateInfo = (id, title, hyperlink, description) => {
    this.handleSetID(id);
    this.handleSetTitle(title);
    this.handleSetDescription(description);
    this.handleSetHyperlink(hyperlink);
  }

  componentDidMount() {
    const {id, title, hyperlink, description} = this.props.route.params;
    this.handleUpdateInfo(id, title, hyperlink, description);
  }


  render() {
    const {id, createdAt, createdBy, title, hyperlink, description} = this.props.route.params;
    return(
      <View style={styles.container}>
        <Text style={styles.TitleStyle}>{title}</Text>
        <Text>Posted by {createdBy} on {createdAt}</Text>
        <Text style={styles.HyperlinkStyle} onPress={() => Linking.openURL(hyperlink)}>**Click here to open document**</Text>
        <Text style={styles.AnnouncementStyle}>{description}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  TitleStyle: {
    fontSize: 30,
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  HyperlinkStyle: {
    color: 'blue',
    fontStyle: 'italic',
    fontSize: 20,
    textDecorationLine: 'underline',
    paddingBottom: 20,
  },
  AnnouncementStyle: {
    fontSize: 20,
    textAlign: 'left'
  },
});