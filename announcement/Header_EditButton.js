import 'react-native-gesture-handler';
import React from 'react';
import { TouchableOpacity } from 'react-native';
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