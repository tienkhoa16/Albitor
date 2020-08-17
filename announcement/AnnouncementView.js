import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert,
        YellowBox, Linking, BackHandler } from 'react-native';
import firebaseDb from '../firebaseDb';
import HeaderDeleteButton from './Header_DeleteButton';
import HeaderEditButton from './Header_EditButton';
import store from '../store';
import { Notifications } from 'expo';


export default class AnnouncementView extends Component {
  constructor(props) {
    super(props);
    this.state={
      id: '',
      title: '',
      hyperlink: '',
      description: '',
      userList: null,
      adminList: null,
    }
    this.props.navigation.setOptions({
      headerRight: () => {
        this.updateAdminList();
        const admins = this.state.adminList;
        return (
          (admins) ? (
            ((admins.includes(store.getState().logIn.username)) || (store.getState().logIn.prefix == "nusstf\\")) ?
            (
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
            ) : null
          ) : null
        )
      },
      headerLeft: null,
      headerStyle: {
        backgroundColor: 'orange',
      },
    });
  }

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
      .then(() => this.props.navigation.navigate('Announcement List'))
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
    this.unsubscribeAdmin = firebaseDb.firestore().collection('announcement_admin').onSnapshot(this.updateAdminList)
    const {id, title, hyperlink, description} = this.props.route.params;
    this.handleUpdateInfo(id, title, hyperlink, description);
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillUnmount() {
    this.unsubscribeAdmin();
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress = () => {
    this.props.navigation.navigate('Announcement List')
    return true
  }

  render() {
    const {id, createdAt, createdBy, title, hyperlink, description, edited, editedBy} = this.props.route.params;
    return(
      <View style={styles.container}>
        <Text style={styles.TitleStyle}>{title}</Text>
        {
          edited ? (
            <Text>Last edited by {editedBy} on {createdAt}</Text>
          )
          : (
            <Text>Posted by {createdBy} on {createdAt}</Text>
          )
        }
        {
          (hyperlink == 'NA' || hyperlink == 'na' || hyperlink == 'Na' || hyperlink == 'nA' || !hyperlink.includes('https://')) ?
            (
              null
            )
            :
            (
              <Text style={styles.HyperlinkStyle} onPress={() => Linking.openURL(hyperlink)}>**Click here to open document**</Text>
            )
        }
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