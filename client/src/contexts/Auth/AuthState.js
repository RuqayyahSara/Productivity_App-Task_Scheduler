import { useReducer } from "react";
// import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import AuthReducer from "./AuthReducer";
import axios from "axios";

import { SET_AUTH } from "../types.js";

function AuthState(props) {
    // let navigate = useNavigate()
    const initialState = null;

    const [state, dispatch] = useReducer(AuthReducer, initialState);

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/"
    };

    const authUser = async (role) => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            let { data } = await axios.get("/api/auth", {
                headers: { "x-auth-token": token.token },
            });
            if (data.type !== role) {
                localStorage.removeItem("token");
                window.location.href = "/"
            }
            dispatch({
                type: SET_AUTH,
                payload: data
            })
            // console.log(data)
        } catch (err) {
            console.log(err.response.data);
            localStorage.removeItem("token");
            window.location.href = "/"
        }
    }

    return (
        <AuthContext.Provider value={{
            isAuth: state,
            authUser,
            logout
        }}>
            {props.children}
        </AuthContext.Provider>
    )


}

export default AuthState;