import React from 'react';
import { View, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native';
import { WebView } from 'react-native-webview';

import LoadingImage from '../component/LoadingImage'



const travel_url = 'https://myaces.nus.edu.sg/OverseasTravelDecl/';
const screenWidth = Math.round(Dimensions.get('window').width);


export default class FlightContainer extends React.Component {
    state = {
        isLoading: true
    }
    
    // componentDidMount() {
    //     this.focusListener = this.props.navigation.addListener("focus", () =>{
    //             this.setState({isLoading: true}) 
    //     }
    //     )
    //   }
    
    // componentWillUnmount() {
    //     // Remove the event listener before removing the screen from the stack
    //     this.focusListener();
    // }

    handlePressX = () => {this.props.navigation.goBack()}

    _onLoadEnd() {
        this.setState({ isLoading: false });
    }
    
    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style = {{width: screenWidth, height: 55, backgroundColor: 'orange'}} />

                <TouchableOpacity style={{marginTop: -30}} onPress={this.handlePressX}>
                    <Text style={{fontSize: 20, marginLeft:10, fontWeight: 'bold'}}>{'\u2190'} Go back</Text>
                </TouchableOpacity>

                <WebView 
                    source={{ uri: travel_url }} 
                    startInLoadingState
                    renderLoading={() => <LoadingImage/>}
                />
            </SafeAreaView>
        )
    }
}