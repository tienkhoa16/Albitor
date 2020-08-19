import React from 'react';
import { UIManager, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Notifications } from 'expo';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, AntDesign, Entypo } from '@expo/vector-icons';

import LogInContainer from './container/LogInContainer';
import LogOutContainer from './container/LogOutContainer';
import DeclareTempContainer from './container/DeclareTempContainer';
import PastDeclareContainer from './container/PastDeclareContainer';

import MoreScreenContainer from './container/MoreScreenContainer';
import FlightContainer from './container/FlightContainer';
import ReportBugContainer from './container/ReportBugContainer';
import AboutContainer from './container/AboutContainer';
import ExemptionContainer from './container/ExemptionContainer';
import EmergencyInfoContainer from './container/EmergencyInfoContainer';
import SettingsContainer from './container/SettingsContainer';
import QRScanner from './container/QRScanner';

import AnnouncementForm from './announcement/upload_ui';
import AnnouncementButton from './announcement/announcement_button';
import AnnouncementListContainer from './announcement/AnnouncementList';
import UpdateAnnouncement from './announcement/UpdateAnnouncement';
import AnnouncementView from './announcement/AnnouncementView';

import SignUpScreen from './chat/SignUpScreen';
import SignInScreen from './chat/SignInScreen';
import LoadScreen from './chat/LoadScreen';
import ChatListScreen from './chat/ChatListScreen';
import ChatRoom from './chat/ChatRoom';
import VerificationScreen from './chat/VerificationScreen';

import CameraUI from './camera/camera_ui';

import { Provider } from 'react-redux';
import store from './store';

import * as SecureStore from 'expo-secure-store';

import backgroundTask from './backgroundFetch/backgroundTask';

import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display'

import {decode, encode} from 'base-64'
if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }


const AnnouncementStackScreen = createStackNavigator();

function AnnouncementScreen({ navigation }) {
  return (
      <AnnouncementStackScreen.Navigator initialRouteName='Announcement List'>
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
          initialParams={{ itemid: null, title: null, hyperlink: null, description: null, edited: null, editedBy: null }}
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
        showLabel: false,
      }}
    >
      <Tab.Screen 
        name="Declare" 
        component={DeclareCamScreen} 
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
        name='Announcements' 
        component={AnnouncementScreen}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            console.log("Announcement tab bar button pressed")
            navigation.navigate('Announcements', {screen: 'Announcement List'})
          },
        })}
        options={{
          tabBarIcon: ({ color }) => (
            <Entypo name="bell" size={24} color={color} />
          ),  
          unmountOnBlur: true,
         }}
      />
      <Tab.Screen
        name='Chat'
        component={ChatComponent}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            console.log("Chat tab bar button pressed")
            navigation.navigate('Chat', {screen: 'LoadScreen'})
          },
        })}
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="message1" size={24} color={color} />
          ),
          unmountOnBlur: true,
         }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="more-horiz" size={24} color={color} />
          ),  
          unmountOnBlur: true,
        }}
      />
    </Tab.Navigator>
  );
}

const ChatStack = createStackNavigator();

function ChatComponent({ navigation }) {
  return (
    <ChatStack.Navigator
      initialRouteName='LoadScreen'
      screenOptions={{
        headerShown: false,
      }}
    >
      <ChatStack.Screen
        name='LoadScreen'
        component={LoadScreen}
      />
      <ChatStack.Screen
        name='SignUpScreen'
        component={SignUpScreen}
      />
      <ChatStack.Screen
        name='VerificationScreen'
        component={VerificationScreen}
      />
      <ChatStack.Screen
        name='SignInScreen'
        component={SignInScreen}
      />
      <ChatStack.Screen
        name='ChatListScreen'
        component={ChatListScreen}
      />
      <ChatStack.Screen
        name='ChatRoom'
        component={ChatRoom}
        initialParams={{ f_uid: '', f_name: '', f_email: '', u_uid: '', u_name: '', u_email: '', token: '' }}
        options={({ route }) => ({ title: route.params.f_name })}
      />
    </ChatStack.Navigator>
  );
}

function MoreStack(){
  return(
    <Stack.Navigator
      screenOptions={{
        initialRouteName: 'MoreScreen',
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MoreScreen"
        component={MoreScreenContainer}
      />
      <Stack.Screen
        name="Flight" 
        component={FlightContainer} 
      />            
      <Stack.Screen
        name="ReportBug"
        component={ReportBugContainer}
      />
      <Stack.Screen
        name="About"
        component={AboutContainer}
      />
      <Stack.Screen
        name="Exemption"
        component={ExemptionContainer}
      />
      <Stack.Screen
        name="Emergency"
        component={EmergencyInfoContainer}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsContainer}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScanner}
      />
    </Stack.Navigator>
  )
}

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Stack = createStackNavigator()


export default function App() {
  let [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold
  });

  const unsubscribe = NetInfo.addEventListener(state => {
    if (!state.isConnected)
      alert('Please turn on Wifi/Mobile Data')
  });

  backgroundTask('printRandom');
  
  return (
    <Provider store = {store}>
      <NavigationContainer theme = {styles}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="Login" component={LogInContainer} />            
          <Stack.Screen name="MainScreen" component={MainScreenTab} />
          <Stack.Screen name="Logout" component={LogOutContainer} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = ({
  ...DefaultTheme,
  colors: {
    background: '#eeeeee',
  },
});