import { createStore } from "redux";
import reducer from "../reducers";

const initialState = {
    username: 'e0426339',
    // password: 'Cody@16012001',
    // firstTime: true,
    // typing: false,
    // authenticating: false,
    // signInSuccesful: false,
    // name: '',
    // cookie: '',
};

export const store = createStore(reducer, initialState);