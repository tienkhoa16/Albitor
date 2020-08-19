import React from 'react';
import { Text, View, StyleSheet, Dimensions, Slider, TouchableWithoutFeedback } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import { WebView } from 'react-native-webview';

import LoadingImage from '../component/LoadingImage'

const screenWidth = Math.round(Dimensions.get('window').width);

export default class QRScanner extends React.Component {
    state = {
        hasPermission: null,
        url: '',
        zoomRatio: 0,
        showSlider: false,
    }

    async componentDidMount() {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        this.setState({hasPermission: status === 'granted'})
    }

    handleBarCodeScanned = ( type, data ) => {
        this.setState({
            url: data,
        })
    };

    render(){
        const { url } = this.state

        return (
            <View
                style={{
                    flex: 1,
                }}
            >   
                <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />

                {
                    url ? 
                        (
                            <WebView 
                                source={{ uri: url }} 
                                startInLoadingState
                                renderLoading={() => <LoadingImage/>}
                            />
                        ) : 
                        (
                            <TouchableWithoutFeedback
                                onPress = {() => this.setState({showSlider: !this.state.showSlider})}
                            >
                                <Camera 
                                    style={{ flex: 1 }} 
                                    zoom={this.state.zoomRatio}
                                    barCodeScannerSettings={{
                                        barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                                    }}
                                    onBarCodeScanned={({type, data}) => {
                                        if (!this.state.url){
                                            this.handleBarCodeScanned(type, data)
                                        }
                                    }}
                                    ratio='16:9'
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            backgroundColor: 'transparent',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        {
                                            this.state.showSlider ? 
                                            (
                                                <Slider
                                                    value={this.state.zoomRatio}
                                                    maximumValue={1}
                                                    minimumValue={0}
                                                    onValueChange={(val) => this.setState({zoomRatio: val})}
                                                    style={{
                                                        width: 250,
                                                        alignSelf: 'center',
                                                        marginBottom: 50,
                                                        transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]
                                                    }}
                                                    thumbTintColor={'white'}
                                                    minimumTrackTintColor={'white'}
                                                />
                                            ): null
                                        }
                                    </View>
                                </Camera>
                            </TouchableWithoutFeedback>
                        )
                }
            </View>
        );
    }
}