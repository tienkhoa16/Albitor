import React from 'react';
import { UIManager, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createSwitchNavigator, createAppContainer, StackActions } from 'react-navigation';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, AntDesign, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';

import LogInContainer from './container/LogInContainer';
import DeclareTempContainer from './container/DeclareTempContainer';
import PastDeclareContainer from './container/PastDeclareContainer';
import FlightContainer from './container/FlightContainer';

import AnnouncementForm from './announcement/upload_ui';
import AnnouncementButton from './announcement/announcement_button';
import AnnouncementListContainer from './announcement/AnnouncementList';
import UpdateAnnouncement from './announcement/UpdateAnnouncement';
import AnnouncementView from './announcement/AnnouncementView';

import CameraUI from './camera/camera_ui';

import { Feather } from '@expo/vector-icons';

import { Provider } from 'react-redux';
import store from './store';

import {decode, encode} from 'base-64'

if (!global.btoa) {  global.btoa = encode }

if (!global.atob) { global.atob = decode }


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

const DeclareCamStack = createStackNavigator();

function DeclareCamScreen({ navigation }) {
  return (
      <DeclareCamStack.Navigator 
        initialRouteName='DeclareScreen'
        screenOptions={{
          headerShown: false,
        }}
      >
        <DeclareCamStack.Screen
          name='DeclareScreen'
          component={DeclareTempContainer}
        />
        <DeclareCamStack.Screen
          name='Camera'
          component={CameraUI}
        />
      </DeclareCamStack.Navigator>
  );
}

const SwitchNavigator = createSwitchNavigator(
  {
    Login: LogInContainer,
    MainScreen: MainScreenTab,
  },
  {
    initialRouteName: 'Login',
  }
);

const Tab = createBottomTabNavigator();

function MainScreenTab() {
  return (
    <Tab.Navigator
      initialRouteName='Declare'
      screenOptions={{
        headerShown: false,
      }}
      tabBarOptions={{
        keyboardHidesTabBar: true,
        activeTintColor: 'orange',
        inactiveTintColor: 'white',
        activeBackgroundColor: 'black',
        inactiveBackgroundColor: 'black',
        labelStyle: {fontWeight: 'bold'},
      }}
    >
      <Tab.Screen 
        name="Declare" 
        component={DeclareCamScreen} 
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            e.preventDefault(); 
            console.log("Declare tab bar button pressed")
            navigation.navigate('Declare', {screen: 'DeclareScreen'})
          },
        })}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="add-circle-outline" size={24} color={color} />
          ),
          unmountOnBlur: true,
         }}
      />
      <Tab.Screen 
        name="History" 
        component={PastDeclareContainer} 
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="table" size={24} color={color} />
          ),  
         }}
      />
      <Tab.Screen 
        name="Flight" 
        component={FlightContainer} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="airplane-takeoff" size={24} color={color} />
          ),  
         }}
      />
      <Tab.Screen 
        name='Announcement' 
        component={AnnouncementScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Entypo name="info" size={24} color={color} />
          ),  
         }}
      />
    </Tab.Navigator>
  );
}

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AppContainer = createAppContainer(SwitchNavigator)



export default function App() {
  return (
    <Provider store = {store}>
      <NavigationContainer theme = {styles}>
        <AppContainer/>
      </NavigationContainer>
    </Provider>
  );
}

const styles = ({
  ...DefaultTheme,
  colors: {
    background: 'white',
  },
});