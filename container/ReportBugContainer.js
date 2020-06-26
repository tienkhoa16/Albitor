import React, { Component } from 'react';
import {ScrollView, StyleSheet, Alert, View, Dimensions, Text,
    KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';

import BlueButton from '../component/BlueButton'

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class UpdateAnnouncement extends Component {
    state = {
        title: '',
        description: '',
    }

    handleUpdateTitle = (title) => this.setState({title});
    handleUpdateDescription = (description) => this.setState({description});

    render() {
        return (
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <ScrollView style={styles.container}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.innerLayout}>
                            <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />
                            <Text style = {styles.heading}>
                                Tell me your bug
                            </Text>
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
                                style = {styles.DescriptionBox}
                                placeholder = "Enter description here..."
                                textAlignVertical={'top'}
                                onChangeText={this.handleUpdateDescription}
                                value={this.state.description}
                            />

                            <BlueButton
                                style = {styles.button}
                            >
                                Report
                            </BlueButton>
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
        backgroundColor: '#fcf7bb',
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
        marginLeft: 10,
        marginRight: 10,
    },
    DescriptionBox: {
        height: 100,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        marginLeft: 10,
        marginRight: 10,
    },
    button:{
        marginTop: 30,
        borderRadius: 5,
        width: 150,
        alignSelf: 'center',
    },
    heading:{
        fontSize: 25,
        color: 'green',
        marginTop: 30,
        textAlign: 'center',
        fontWeight: 'bold',
    },
})