import { useContext, useReducer } from "react";
import MemberContext from "./MemberContext";
import MemberReducer from "./MemberReducer";
import UtilsContext from "../Utils/UtilsContext";
import axios from "axios";

import { SET_PROJECTS, SET_TASKS } from "../types.js";

function MemberState(props) {
    let utilsContext = useContext(UtilsContext)

    const { setLoading, removeLoading } = utilsContext
    const initialState = {
        projects: [],
        tasks: []
    }

    const [state, dispatch] = useReducer(MemberReducer, initialState);

    const setProjects = async () => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            setLoading()
            let { data } = await axios.get("/api/member", { headers: { "x-auth-token": token.token } });
            // console.log(data)
            dispatch({
                type: SET_PROJECTS,
                payload: data
            })
            removeLoading()
        } catch (err) {
            removeLoading()
            localStorage.removeItem("token")
            window.location.href= "/login"
            console.log(err.response.data)
        }
    }


    const getTasks = async (project_id, team_id) => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            let { data } = await axios.get(`/api/member/project/${project_id}/team/${team_id}`, { headers: { "x-auth-token": token.token } });
            dispatch({
                type: SET_TASKS,
                payload: data
            })
            // console.log(data)
        } catch (err) {
            // console.log(err.response.data)
        }
    }

    return (
        <MemberContext.Provider value={{
            projects: state.projects,
            tasks: state.tasks,
            setProjects,
            getTasks

        }}>
            {props.children}
        </MemberContext.Provider>
    )
}

export default MemberState;