import {combineReducers} from "redux";
import logInReducer from "./logInReducer";
import historyReducer from './historyReducer';

export default combineReducers({
    logIn: logInReducer,
    history: historyReducer,
})