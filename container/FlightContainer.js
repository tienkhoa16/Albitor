import React from 'react';
import { View, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native';
import { WebView } from 'react-native-webview';

const travel_url = 'https://myaces.nus.edu.sg/OverseasTravelDecl/';
const screenWidth = Math.round(Dimensions.get('window').width);


export default class FlightContainer extends React.Component {
    handlePressX = () => {this.props.navigation.goBack()}

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style = {{width: screenWidth, height: 55, backgroundColor: 'orange'}} />
                <TouchableOpacity style={{marginTop: -30}} onPress={this.handlePressX}>
                    <Text style={{fontSize: 20, marginLeft:10, fontWeight: 'bold'}}>{'\u2190'} Go back</Text>
                </TouchableOpacity>
                <WebView startInLoadingState source={{ uri: travel_url }} />
            </SafeAreaView>
        )
    }
}