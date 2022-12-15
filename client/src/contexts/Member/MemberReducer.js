import { SET_PROJECTS, SET_TASKS } from "../types.js";

const MemberReducer = (state, action) => {
    switch (action.type) {
        case SET_PROJECTS:
            return {
                ...state,
                projects: action.payload
            }
        case SET_TASKS:
            return {
                ...state,
                tasks: action.payload
            }
        default:
            return state;
    }
}

export default MemberReducer