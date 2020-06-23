import React, {PureComponent} from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import HTML from 'react-native-render-html';
import { IGNORED_TAGS, alterNode, makeTableRenderer } from 'react-native-render-html-table-bridge';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-navigation';

import getHistoryHtml from './GetHistoryHtml';
import LoadingImage from '../component/LoadingImage';

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
};


export default class PastDeclareContainer extends PureComponent {
    state = {
        tableData: ''
    }
    
    componentDidMount() {
        this.focusListener = this.props.navigation.addListener("focus", () =>{
            (async() => {
                this.setState({tableData: await getHistoryHtml(store.getState().logIn.cookie)}) 
            })() 
        }
        )
    }
    
    componentWillUnmount() {
        // Remove the event listener before removing the screen from the stack
        this.focusListener();
    }

    render() {
        if (!this.state.tableData) {
            return <LoadingImage/>
        }
        return (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 10 }} style={{ marginTop:40 ,backgroundColor: 'white' }}>
                <Text style = {styles.heading}>Declaration History of</Text>
                <Text style = {styles.heading}>{store.getState().logIn.name}</Text>
                <Text style = {styles.text}>*sx: symptoms</Text>
                <HTML html={this.state.tableData} {...htmlConfig}/>
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