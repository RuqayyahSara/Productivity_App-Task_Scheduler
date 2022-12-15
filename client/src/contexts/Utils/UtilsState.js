import { useReducer } from "react";
import UtilsContext from "./UtilsContext";
import UtilsReducer from "./UtilsReducer";
import axios from "axios";
import { SET_ALERT, REMOVE_ALERT, SET_LOADING, REMOVE_LOADING, SET_ERROR, SET_COUNTRIES, SET_EDIT, SET_VISIBLE } from "../types.js";

function UtilsState(props) {
    const initialState = {
        alert: null,
        loading: false,
        countries: [],
        errorData: {},
        edit: false,
        visible: false
    }

    const [state, dispatch] = useReducer(UtilsReducer, initialState);

    const setLoading = () => {
        dispatch({ type: SET_LOADING });
    };
    const removeLoading = () => {
        dispatch({ type: REMOVE_LOADING });
    };

    const setErrorData = (data) => {
        dispatch({ type: SET_ERROR, payload: data });
    };

    const setEdit = (data) => {
        dispatch({ type: SET_EDIT, payload: data });
    };

    const setVisible = (data) => {
        dispatch({ type: SET_VISIBLE, payload: data });
    };

    const fetchFlags = async () => {
        try {
            let { data } = await axios.get("/api/flag")
            dispatch({ type: SET_COUNTRIES, payload: data });
        } catch (err) {
            // console.log(err.response.data)
        }
    }

    const showAlert = (data) => {
        dispatch({
            type: SET_ALERT,
            payload: data
        })
        setTimeout(() => {
            dispatch({
                type: REMOVE_ALERT,
            })
        }, 3500);
    };

    return (
        <UtilsContext.Provider value={{
            alert: state.alert,
            loading: state.loading,
            countries: state.countries,
            errorData: state.errorData,
            edit: state.edit,
            visible: state.visible,
            setErrorData,
            fetchFlags,
            setLoading,
            removeLoading,
            showAlert,
            setEdit,
            setVisible
        }}>
            {props.children}
        </UtilsContext.Provider>
    )


}

export default UtilsState;