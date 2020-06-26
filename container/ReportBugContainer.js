import React, { Component } from 'react';
import { View, Text,
        ScrollView, StyleSheet, Alert,
        KeyboardAvoidingView,
        TouchableWithoutFeedback, Keyboard, YellowBox,
        TextInput } from 'react-native';
import firebaseDb from '../firebaseDb';
import _ from 'lodash';

import BlueButton from '../component/BlueButton'

export default class UpdateAnnouncement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            description: '',
        }
        YellowBox.ignoreWarnings(['Setting a timer']);
        const _console = _.clone(console);
        console.warn = message => {
            if (message.indexOf('Setting a timer') <= -1) {
                _console.warn(message);
            }
        };
    }

    handleUpdateTitle = (title) => this.setState({title});
    handleUpdateDescription = (description) => this.setState({description});

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
        .then(() =>
            this.props.navigation.navigate('Announcement List')
        )
        .catch(err => console.error(err))

    render() {
        return (
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <ScrollView style={styles.container}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.innerLayout}>
                        <Text> {itemid} </Text>
                        <Text> {title} </Text>
                        <Text> {hyperlink} </Text>
                        <Text> {description} </Text>
                        <TextInput
                            multiline
                            style = {styles.TitleBox}
                            placeholder = "Enter title here..."
                            textAlignVertical={'top'}
                            onChangeText = {this.handleUpdateTitle}
                            value = {this.state.title}
                            maxLength = {100}
                        />
                        <TextInput
                            multiline
                            style = {styles.HyperlinkBox}
                            placeholder = "Enter hyperlink here..."
                            textAlignVertical={'top'}
                            onChangeText={this.handleUpdateHyperlink}
                            value={this.state.hyperlink}
                        />
                        <TextInput
                            multiline
                            style = {styles.DescriptionBox}
                            placeholder = "Enter description here..."
                            textAlignVertical={'top'}
                            onChangeText={this.handleUpdateDescription}
                            value={this.state.description}
                        />

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
    },
    inner: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    TitleBox: {
        height: 60,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        marginTop: 20,
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