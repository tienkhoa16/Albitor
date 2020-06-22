import React, {PureComponent} from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import HTML from 'react-native-render-html';
import { IGNORED_TAGS, alterNode, makeTableRenderer } from 'react-native-render-html-table-bridge';
import { WebView } from 'react-native-webview';
import Snackbar from 'react-native-snackbar-component';

import store from '../store';


const renderers = {
    table: makeTableRenderer({
        WebViewComponent: WebView,
        useLayoutAnimations: true
    })
};

const htmlConfig = {
    alterNode,
    renderers,
    ignoredTags: IGNORED_TAGS,
    onLinkPress: (e, url) => {
        Snackbar.show({
            title: url,
            color: 'white'
        })
    }
};


export default class PastDeclareContainer extends PureComponent {
    render() {
        return (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 10 }} style={{ marginTop:40 ,backgroundColor: 'white' }}>
                <Text style = {styles.heading}>Declaration History of</Text>
                <Text style = {styles.heading}>{store.getState().logIn.name}</Text>
                <Text style = {styles.text}>*sx: symptoms</Text>
                <HTML html={store.getState().history.htmlTable} {...htmlConfig}/>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    heading:{
        fontSize: 20,
        color: 'green',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    text:{
        fontSize: 13,
        fontStyle: 'italic',
        marginBottom: 5,
    }
});