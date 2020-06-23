'use strict';
import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, TouchableOpacity,
         View, PermissionsAndroid, Button, Image, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AnnouncementForm from './announcement/upload_ui';
import AnnouncementButton from './announcement/announcement_button';
import AnnouncementListContainer from './announcement/AnnouncementList';
import CameraButton from './camera/cameraButton';
import CameraUI from './camera/camera_ui';
import UpdateAnnouncement from './announcement/UpdateAnnouncement';
import AnnouncementView from './announcement/AnnouncementView';
import { Feather } from '@expo/vector-icons';

const AnnouncementStackScreen = createStackNavigator();

function AnnouncementScreen({ navigation }) {
  return (
      <AnnouncementStackScreen.Navigator initialRouteName='Announcement list'>
        <AnnouncementStackScreen.Screen
          name='Announcement List'
          component={AnnouncementListContainer}
          options={{ title: 'Announcements' }}
        />
        <AnnouncementStackScreen.Screen
          name='Announcement View'
          component={AnnouncementView}
          initialParams={{ title: null, hyperlink: null, description: null }}
        />
        <AnnouncementStackScreen.Screen
          name='Add Announcement'
          component={AnnouncementForm}
          options={{ title: 'Add' }}
        />
        <AnnouncementStackScreen.Screen
          name='Update Announcement'
          component={UpdateAnnouncement}
          options={{ title: 'Update' }}
          initialParams={{ itemid: null, title: null, hyperlink: null, description: null }}
        />
      </AnnouncementStackScreen.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          tabBarOptions={{
            keyboardHidesTabBar: true,
          }}>
          <Tab.Screen name='Announcement' component={AnnouncementScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
