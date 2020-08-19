import React from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { WebView } from 'react-native-webview';

import LoadingImage from '../component/LoadingImage'

const screenWidth = Math.round(Dimensions.get('window').width);

export default class QRScanner extends React.Component {
    state = {
        hasPermission: null,
        scanned: false,
        url: '',
    }

    async componentDidMount() {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        this.setState({hasPermission: status === 'granted'})
    }

    handleBarCodeScanned = ({ type, data }) => {
        this.setState({
            scanned: true,
            url: data,
        })
        alert(`Bar code with data ${data} has been scanned!`);
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
                            <>                              
                                <Text
                                    style = {{
                                        fontSize: 25,
                                        color: '#e32012',
                                        marginTop: 15,
                                        textAlign: 'center',
                                        fontFamily: 'PlayfairDisplay_700Bold',
                                    }}
                                >
                                    Scanning QR Code
                                </Text>
                                <BarCodeScanner
                                    barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                                    onBarCodeScanned={this.state.scanned ? undefined : this.handleBarCodeScanned}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            </>      
                        )
                }
            </View>
        );
    }
}