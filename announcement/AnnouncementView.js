import React, { Component, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Alert,
         TouchableOpacity, Button, SafeAreaView, YellowBox, Linking } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

export default class AnnouncementView extends Component {

  render() {
    const {title, hyperlink, description} = this.props.route.params;
    return(
      <View style={{ flex: 1 }}>
        <Text> {title} </Text>
        <Text> {hyperlink} </Text>
        <Text> {description} </Text>
      </View>
    );
  }
}