import React from 'react';
import { SafeAreaView, Text, StyleSheet, Image } from 'react-native';

const LoadingImage = () => (
    <SafeAreaView style={{ flex: 1, justifyContent:'center', alignItems: 'center' }}>
        <Image source = {require('../assets/loading.gif')} />
        <Text style = {styles.heading}>Loading, please wait ;)</Text>
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