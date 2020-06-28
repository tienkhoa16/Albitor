import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { View,
         Text,
         StyleSheet,
         TouchableOpacity
       } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HeaderEditButton = props => {
  return (
    <TouchableOpacity
      onPress={props.onPress} style={{ flexDirection: 'row', padding: 20 }}>
       <MaterialCommunityIcons name='database-edit' size={20} />
     </TouchableOpacity>
  );
}

export default HeaderEditButton;