import { ALL_TASKS, SET_TASK } from "../types.js";

const TodoReducer = (state, action) => {
    switch (action.type) {
        case ALL_TASKS:
            return {
                ...state,
                tasks: action.payload,
            };
        // case SINGLE_TASK:
        //     return {
        //         ...state,
        //         task: action.payload,
        //     };
        case SET_TASK:
            return {
                ...state,
                task: action.payload,
            };
        // case SET_ADD:
        //     return {
        //         ...state,
        //         add: action.payload,
        //     };
        default:
            return state;
    }
};

export default TodoReducer
