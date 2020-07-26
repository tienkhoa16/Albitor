const initialState = {
    name: '',
    cookie: '',
    htmlTable: '',
    username: '',
    prefix: '',
};

const logInReducer = (state = initialState, action) => {
    switch(action.type){
        case "UPDATE":
            console.log('[UPDATED NAME AND COOKIE]');
            return{
                ...state,
                name: action.payload.updateName,
                cookie: action.payload.updateCookie,
                username: action.payload.updateUsername,
                prefix: action.payload.updatePrefix,
            };
        
        default:
            return state
    }
}

export default logInReducer