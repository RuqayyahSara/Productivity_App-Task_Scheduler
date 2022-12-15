import { useReducer, useContext } from "react";
import TodoContext from "./TodoContext";
import UtilsContext from '../Utils/UtilsContext';
import TodoReducer from "./TodoReducer";

import axios from "axios";

import { ALL_TASKS, SET_TASK } from "../types.js";

function TodoState(props) {
    let utilsContext = useContext(UtilsContext)
    const initialState = {
        tasks: [],
        task: null,
        edit: false,
        add: false
    };
    const [state, dispatch] = useReducer(TodoReducer, initialState);
    const { setLoading, removeLoading } = utilsContext;

    const setTasks = (data) => {
        dispatch({
            type: ALL_TASKS,
            payload: data
        })
    }

    const setTask = (data) => {
        dispatch({
            type: SET_TASK,
            payload: data
        })
    }

    const getTasks = async () => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            setLoading()
            let { data } = await axios.get("api/user/task/all", { headers: { "x-auth-token": token.token }, });
            setTasks(data.tasks)
            removeLoading()
        } catch (err) {
            removeLoading()
            console.log(err.response.data)
        }
    }

    const getTask = async (id) => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            let { data } = await axios.get(`/api/user/task/${id}`, {
                headers: { "x-auth-token": token.token },
            });
            setTask(data.tasks)
        } catch (err) {
            // console.log(err.response.data)
        }
    }

    return (
        <TodoContext.Provider
            value={{
                task: state.task,
                tasks: state.tasks,
                getTasks,
                setTasks,
                setTask,
                getTask,
            }}
        >
            {props.children}
        </TodoContext.Provider>
    );
}

export default TodoState;
