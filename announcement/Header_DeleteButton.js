import 'react-native-gesture-handler';
import React from 'react';
import { TouchableOpacity } from 'react-native';
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