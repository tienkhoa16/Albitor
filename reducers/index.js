import {combineReducers} from "redux";
import logInReducer from "./logInReducer";

export default combineReducers({
    logIn: logInReducer,
})