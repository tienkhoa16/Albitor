import React, {PureComponent} from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, View, Dimensions } from 'react-native';
import HTML from 'react-native-render-html';
import { IGNORED_TAGS, alterNode, makeTableRenderer } from 'react-native-render-html-table-bridge';
import { WebView } from 'react-native-webview';

import getHistoryHtml from './GetHistoryHtml';
import LoadingImage from '../component/LoadingImage';

import store from '../store';

const screenWidth = Math.round(Dimensions.get('window').width);

const renderers = {
    table: makeTableRenderer({
        WebViewComponent: WebView,
        useLayoutAnimations: true,
        tableStyleSpecs: {
            selectableText: false,
            fitContainerWidth: true,
            fitContainerHeight: false,
            cellPaddingEm: 0.1,
            borderWidthPx: 0.25,
            linkColor: '#3498DB',
            fontFamily: 'sans-serif',
            fontSizePx: 14,
            thBorderColor: '#3f5c7a',
            tdBorderColor: '#b5b5b5',
            thOddBackground: '#253546',
            thOddColor: '#FFFFFF',
            thEvenBackground: '#253546',
            thEvenColor: '#FFFFFF',
            trOddBackground: '#e2e2e2',
            trOddColor: '#333333',
            trEvenBackground: '#FFFFFF',
            trEvenColor: '#333333'
        }
    })
};

const htmlConfig = {
    alterNode,
    renderers,
    ignoredTags: IGNORED_TAGS,
};


export default class PastDeclareContainer extends PureComponent {
    state = {
        tableData: ''
    }

    intervalId;
    
    componentDidMount() {
        this.focusListener = this.props.navigation.addListener("focus", () =>{
            this.intervalId = setInterval(
                async() => {
                    this.setState({tableData: await getHistoryHtml(store.getState().logIn.cookie)}) 
                },
                500
            )
        })
    }
    
    componentWillUnmount() {
        // Remove the event listener before removing the screen from the stack
        this.focusListener();
        clearInterval(this.intervalId);
    }

    render() {
        if (!this.state.tableData) {
            return <LoadingImage/>
        }
        return (
            <SafeAreaView style ={{flex:1}}>
                <View style = {{width: screenWidth, height: 35, backgroundColor: 'orange'}} />
                <Text style = {styles.heading}>Declaration History of</Text>
                <Text style = {styles.heading}>{store.getState().logIn.name}</Text>
                <ScrollView contentContainerStyle={{ padding: 10 }} style={{ marginTop:5 }}>
                    <Text style = {styles.text}>*sx: symptoms</Text>
                    <HTML html={this.state.tableData} {...htmlConfig}/>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    heading:{
        fontSize: 20,
        color: 'green',
        textAlign: 'center',
        fontFamily: 'PlayfairDisplay_700Bold',
    },
    text:{
        fontSize: 13,
        fontStyle: 'italic',
        marginBottom: 5,
    }
});