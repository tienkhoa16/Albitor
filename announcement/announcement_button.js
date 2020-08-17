import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet,
         TouchableOpacity
       } from 'react-native';
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