import { SET_ALERT, REMOVE_ALERT, SET_LOADING, REMOVE_LOADING, SET_ERROR, SET_COUNTRIES, SET_EDIT, SET_VISIBLE} from "../types";

const UtilsReducer = (state, action) => {
    switch (action.type) {
        case SET_ALERT:
            return {
                ...state,
                alert: action.payload
            }
        case REMOVE_ALERT:
            return {
                ...state,
                alert: null
            };

        case SET_LOADING:
            return {
                ...state,
                loading: true,
            };
        case REMOVE_LOADING:
            return {
                ...state,
                loading: false,
            };
        case SET_ERROR:
            return {
                ...state,
                errorData: action.payload
            }
        case SET_EDIT:
            return {
                ...state,
                edit: action.payload
            }
        case SET_VISIBLE:
            return {
                ...state,
                visible: action.payload
            }
        case SET_COUNTRIES:
            return {
                ...state,
                countries: action.payload
            }
        default:
            return state;
    }
}

export default UtilsReducer