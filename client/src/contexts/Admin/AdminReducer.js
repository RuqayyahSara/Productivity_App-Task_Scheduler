import { SET_ANALYTICS, SET_TOP10, SET_TEAM_ADMINS, SET_USER } from "../types.js";

const AdminReducer = (state, action) => {
    switch (action.type) {
        case SET_TOP10:
            return {
                ...state,
                top10: action.payload
            }
        case SET_ANALYTICS:
            return {
                ...state,
                analytics: action.payload
            }
        case SET_TEAM_ADMINS:
            return {
                ...state,
                admins: action.payload
            }
        case SET_USER:
            return {
                ...state,
                user: action.payload
            }
        default:
            return state;
    }
}

export default AdminReducer