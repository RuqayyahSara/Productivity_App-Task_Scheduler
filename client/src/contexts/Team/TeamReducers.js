import { SET_PROJECTS, SET_PROJECT, SET_TEAM, SET_TEAMS, SET_MEMBER, SET_MEMBERS, SET_TASK, ALL_TASKS } from "../types.js";

const TeamReducer = (state, action) => {
    switch (action.type) {
        case SET_PROJECTS:
            return {
                ...state,
                projects: action.payload
            }
        case SET_PROJECT:
            return {
                ...state,
                project: action.payload
            }
        case SET_TEAMS:
            return {
                ...state,
                teams: action.payload
            }
        case SET_TEAM:
            return {
                ...state,
                team: action.payload
            }
        case SET_MEMBERS:
            return {
                ...state,
                members: action.payload
            }
        case SET_MEMBER:
            return {
                ...state,
                member: action.payload
            }
        case ALL_TASKS:
            return {
                ...state,
                tasks: action.payload,
            };
        case SET_TASK:
            return {
                ...state,
                task: action.payload,
            };
        default:
            return state;
    }
}

export default TeamReducer