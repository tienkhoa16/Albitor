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
         } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import firebaseDb from '../firebaseDb';
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
      deleteSuccess: false,
      editSuccess: false
    };
    YellowBox.ignoreWarnings(['Setting a timer']);
    const _console = _.clone(console);
    console.warn = message => {
      if (message.indexOf('Setting a timer') <= -1) {
        _console.warn(message);
      }
    };
  }

  handleUpdateTitle = (title) => this.setState({title});
  handleUpdateHyperlink = (hyperlink) => this.setState({hyperlink});
  handleUpdateDescription = (description) => this.setState({description});

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              <Text style = {styles.TitleText}> Title: </Text>
              <TextInput
                multiline
                style = {styles.TitleBox}
                placeholder = "Enter title here..."
                textAlignVertical={'top'}
                onChangeText = {this.handleUpdateTitle}
                value = {this.state.title}
                maxLength = {100}
              />

              <Text style = {styles.HyperlinkText}> Hyperlink: </Text>
              <TextInput
                multiline
                style = {styles.HyperlinkBox}
                placeholder = "Enter hyperlink here..."
                textAlignVertical={'top'}
                onChangeText={this.handleUpdateHyperlink}
                value={this.state.hyperlink}
              />
              <Text style = {styles.DescriptionText}> Description: </Text>
              <TextInput
                multiline
                style = {styles.DescriptionBox}
                placeholder = "Enter description here..."
                textAlignVertical={'top'}
                onChangeText={this.handleUpdateDescription}
                value={this.state.description}
              />

              <View style = {styles.SubmitButton}>
                <Button
                  color = "blue"
                  title = "Submit"
                  onPress = {() => {
                    if (this.state.title.length && this.state.hyperlink.length && this.state.description.length) {
                      this.handleCreateAnnouncement()
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
        created: firebaseDb.firestore.FieldValue.serverTimestamp()
      })
      .then(() =>
        this.setState({
          title: '',
          hyperlink: '',
          description: '',
          created: '',
          addSuccess: true,
          deleteSuccess: false,
          editSuccess: false
      })
      )
      .catch((err) => console.error(err));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    padding: 5,
    flex: 1,
    justifyContent: "flex-end",
  },
  TitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 15,
  },
  HyperlinkText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 15,
  },
  DescriptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 15,
  },
  TitleBox: {
    height: 60,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  HyperlinkBox: {
    height: 70,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  DescriptionBox: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
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