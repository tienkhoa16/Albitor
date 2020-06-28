import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { View,
         Text,
         StyleSheet,
         TouchableOpacity
       } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AntDesign } from '@expo/vector-icons';

const HeaderDeleteButton = props => {
  return (
    <TouchableOpacity
      onPress={props.onPress} style={{ flexDirection: 'row', padding: 20 }}>
       <AntDesign name='delete' size={20} />
     </TouchableOpacity>
  );
}

export default HeaderDeleteButton;