const initialState = {
    name: '',
    cookie: '',
    htmlTable: '',
};

const historyReducer = (state = initialState, action) => {
    switch(action.type){
        case "GET_HISTORY":
            console.log('[GETTING PAST DECLARATION]');
            return{
                ...state,
                htmlTable: action.payload.updateHtmlTable,
            };
        
        default:
            return state
    }
}

export default historyReducer