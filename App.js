import React from 'react';
import { UIManager, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Provider } from 'react-redux';

import LogInContainer from './container/LogInContainer';
import DeclareTempContainer from './container/DeclareTempContainer';
import PastDeclareContainer from './container/PastDeclareContainer';
import FlightContainer from './container/FlightContainer';

import AnnouncementForm from './announcement/upload_ui';
import AnnouncementButton from './announcement/announcement_button';
import AnnouncementListContainer from './announcement/AnnouncementList';
import CameraButton from './camera/cameraButton';
import CameraUI from './camera/camera_ui';
import UpdateAnnouncement from './announcement/UpdateAnnouncement';
import AnnouncementView from './announcement/AnnouncementView';
import { Feather } from '@expo/vector-icons';

import store from './store';


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


// const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


// const SwitchNavigator = createBottomTabNavigator(
const SwitchNavigator = createSwitchNavigator(
  {
    Login: LogInContainer,
    MainScreen: MainScreenTab,
  },
  {
    initialRouteName: 'Login',
  }
);

function MainScreenTab() {
  return (
    <Tab.Navigator
      initialRouteName='Declare'
      screenOptions={{
        headerShown: false,
        keyboardHidesTabBar: true,
      }}
    >
      <Tab.Screen name="Declare" component={DeclareTempContainer} />
      <Tab.Screen name="History" component={PastDeclareContainer} />
      <Tab.Screen name="Flight" component={FlightContainer} />
      <Tab.Screen name='Announcement' component={AnnouncementScreen} />
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