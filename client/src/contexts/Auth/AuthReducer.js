import { SET_AUTH } from "../types";

const AuthReducer = (state, action) => {
    switch (action.type) {
        case SET_AUTH:
            return (action.payload)
        default:
            return state;
    }
}

export default AuthReducer