const initialState = {
    name: '',
    cookie: '',
};

const logInReducer = (state = initialState, action) => {
    switch(action.type){
        case "UPDATE":
            console.log('[UPDATED NAME]');
            return{
                ...state,
                name: action.payload.updateName,
                cookie: action.payload.updateCookie,
            };
        
        default:
            return state
    }
}

export default logInReducer