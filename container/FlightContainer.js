import React from 'react';
import { View, SafeAreaView, TouchableOpacity, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';

import LoadingImage from '../component/LoadingImage'


const travel_url = 'https://myaces.nus.edu.sg/OverseasTravelDecl/';
const screenWidth = Math.round(Dimensions.get('window').width);


export default class FlightContainer extends React.Component {
    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />

                <WebView 
                    source={{ uri: travel_url }} 
                    startInLoadingState
                    renderLoading={() => <LoadingImage/>}
                />
            </SafeAreaView>
        )
    }
}