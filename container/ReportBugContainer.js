import React, { Component } from 'react';
import {ScrollView, StyleSheet, Alert, View, Dimensions, Text, Image,
    KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TextInput, TouchableOpacity } from 'react-native';
import firebaseDb from '../firebaseDb';
import * as ImagePicker from 'expo-image-picker';

import RedButton from '../component/RedButton';

import store from '../store';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class UpdateAnnouncement extends Component {
    state = {
        title: '',
        description: '',
        link: '',
        image: null,
        image_name: '',
    }

    handleUpdateTitle = (title) => this.setState({title});
    handleUpdateDescription = (description) => this.setState({description});
    
    _pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                quality: 1,
            });
            if (!result.cancelled) {
                this.setState({ 
                    image: result.uri,
                    image_name: result.uri.substr(result.uri.indexOf('ImagePicker/'))
                });
            }
            console.log(result);
        } catch (E) {
            console.log(E);
        }
    };

    uploadImage = async(image, image_name) => {
        const response = await fetch(image);
        const blob = await response.blob();
        return firebaseDb.storage().ref().child(image_name).put(blob);
    }

    handleCreateBug = async() =>{
        const {title, description, image} = this.state
        if (title && description){
            if (image)
                await this.uploadImage(image, this.state.image_name)
            firebaseDb.firestore()
            .collection("bug")
            .add({
                title: this.state.title,
                description: this.state.description,
                image: this.state.image_name,
                reporter: store.getState().logIn.username,
                reportedTime: firebaseDb.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                alert('Bug reported successfully! Thanks!')
                this.props.navigation.navigate('MoreScreen')
            })
            .catch((err) => {
                console.error(err)
                alert('Bug reported failed')
            });
        }
        else if (title && !description)
            alert('Please fill in description')
        else if (!title && description)
            alert('Please fill in title')
        else    
            alert('Please fill in title and description')
    }

    render() {
        const {image} = this.state
        return (
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />
                <ScrollView style={styles.container}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.innerLayout}>
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

                            <TouchableOpacity
                                onPress = {this._pickImage}
                            >
                                {
                                    !image &&
                                    <Text
                                        style = {styles.click}
                                    >
                                        Tap to select screenshot/video
                                    </Text>
                                }
                                {
                                    image && 
                                    <Text
                                        style = {styles.click}
                                    >
                                        Attached: {this.state.image_name.substr(this.state.image_name.indexOf('/')+1)}
                                    </Text>
                                }
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress = {() => this.setState({image: null, image_name: ''})}
                            >
                                {
                                    image && 
                                    <Text
                                        style = {styles.remove}
                                    >
                                        [Remove]
                                    </Text>
                                }
                            </TouchableOpacity>

                            <RedButton
                                style = {styles.button}
                                onPress = {async() => await this.handleCreateBug()}
                            >
                                Report
                            </RedButton>

                            <Image
                                source={require('../assets/bug.png')}
                                style = {styles.bug}
                            />
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
        height: 35,
        borderWidth: 1,
        borderColor: 'transparent',
        borderBottomColor: 'gray',
        marginBottom: 15,
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 10,
    },
    DescriptionBox: {
        height: 100,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        marginLeft: 10,
        marginRight: 10,
        fontSize: 16,
        padding: 10,
    },
    button:{
        marginTop: 30,
        marginBottom: 30,
        borderRadius: 5,
        width: 150,
        alignSelf: 'center',
    },
    heading:{
        fontSize: 25,
        color: '#a10000',
        marginTop: 20,
        textAlign: 'center',
        fontFamily: 'PlayfairDisplay_700Bold',
    },
    click:{
        fontSize: 16,
        paddingHorizontal: 10,
        color: 'blue',
    },
    bug: {
        alignSelf: 'center',
        marginBottom: 30,
        marginTop: 30,
    },
    remove:{
        fontSize: 16,
        paddingHorizontal: 10,
        marginTop: 10,
        color: 'black',
        fontStyle: 'italic',
    }
})