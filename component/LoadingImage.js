import React from 'react';
import { SafeAreaView, Text, StyleSheet, Image, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const LoadingImage = () => (
    <SafeAreaView style={{ flex: 1, justifyContent:'center', alignItems: 'center' }}>
        <Image source = {require('../assets/loading.gif')} />
        <View style = {{flexDirection: 'row'}}>
            <Text style = {styles.heading}>Loading, please wait </Text>
            <FontAwesome5 name="smile-wink" size={24} color="green" />
        </View>
    </SafeAreaView>
)

const styles = StyleSheet.create({
    heading:{
        fontSize: 20,
        color: 'green',
        textAlign: 'center',
        fontWeight: 'bold',
    },
})

export default LoadingImage