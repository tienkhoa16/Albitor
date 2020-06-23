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

const AnnouncementButton = props => {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={styles.IconStyle}
    >
      <AntDesign name='plus' size={40}  />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  IconStyle: {
    borderWidth:1,
    borderColor:'gray',
    alignItems:'center',
    justifyContent:'center',
    width:70,
    position: 'absolute',
    bottom: 10,
    right: 10,
    height:70,
    backgroundColor:'#fff',
    borderRadius:100,
  },
});

export default AnnouncementButton