import { useReducer, useContext } from "react";
import AdminContext from "./AdminContext";
import AdminReducer from "./AdminReducer";
import axios from "axios";
import utilsContext from "../Utils/UtilsContext";
import { SET_ANALYTICS, SET_TOP10, SET_TEAM_ADMINS, SET_USER } from "../types.js";

function AdminState(props) {
    const utilssContext = useContext(utilsContext);
    const { setLoading, removeLoading } = utilssContext;

    const initialState = {
        analytics: {},
        top10: [],
        admins: [],
        user: null
    }

    const [state, dispatch] = useReducer(AdminReducer, initialState);

    const fetchTop10Emails = async (role) => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            let { data } = await axios.get(`/api/admin/${role}/top/emails`, {
                headers: { "x-auth-token": token.token },
            });
            dispatch({
                type: SET_TOP10,
                payload: data
            })
            removeLoading()
        } catch (err) {
            // console.log(err);
        }
    };
    const fetchAnalytics = async (role) => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            setLoading()
            let { data } = await axios.get(`/api/admin/${role}/analytics`, {
                headers: { "x-auth-token": token.token },
            });
            let months = [],
                users = [],
                revenue = [],
                emails = [],
                sms = [];
            var m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",];
            let date = new Date().getMonth() - 1;
            for (let i = 0; i < 7; i++) {
                months.push(m[date - i]);
                users.push(data[i].length ? data[i][0].users : 0);
                revenue.push(data[i].length ? data[i][0].revenue : 0);
                emails.push(data[i].length ? data[i][0].emailsSent : 0);
                sms.push(data[i].length ? data[i][0].smsSent : 0);
            }

            dispatch({
                type: SET_ANALYTICS,
                payload: {
                    months: months.reverse(),
                    revenue: revenue.reverse(),
                    users: users.reverse(),
                    emails: emails.reverse(),
                    sms: sms.reverse()
                }
            })
        } catch (err) {
            // console.log(err.response.data);
        }
    };

    async function getTeamAdmins() {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            setLoading();
            const { data } = await axios.get(`/api/admin/team`, { headers: { "x-auth-token": token.token } });
            dispatch({
                type: SET_TEAM_ADMINS,
                payload: data
            })
            removeLoading();
        } catch (error) {
            localStorage.removeItem("token")
            window.location.href = "/login"
            console.log(error.response.data);
        }
    }

    const setUser = (data) => {
        dispatch({
            type: SET_USER,
            payload: data
        })
    }
    async function getUserProfile(id) {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            const { data } = await axios.get(`/api/${id}`, { headers: { "x-auth-token": token.token } });
            setUser(data.user)
        } catch (error) {
            // console.log(error.response.data);
        }
    }
    return (
        <AdminContext.Provider value={{
            analytics: state.analytics,
            top10: state.top10,
            admins: state.admins,
            user: state.user,
            getUserProfile,
            setUser,
            getTeamAdmins,
            fetchTop10Emails,
            fetchAnalytics,
        }}>
            {props.children}
        </AdminContext.Provider>
    )


}

export default AdminState;