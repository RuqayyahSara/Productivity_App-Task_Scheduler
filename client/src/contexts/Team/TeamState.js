import { useReducer, useContext } from "react";
import TeamContext from "./TeamContext";
import TeamReducer from "./TeamReducers";
import axios from "axios";
import utilsContext from "../Utils/UtilsContext";
import { SET_PROJECTS, SET_PROJECT, SET_TEAMS, SET_TEAM, SET_MEMBERS, SET_MEMBER, SET_TASK, ALL_TASKS } from "../types.js";

function TeamState(props) {
    const utilssContext = useContext(utilsContext);
    const { setLoading, removeLoading } = utilssContext;

    const initialState = {
        projects: [],
        project: null,
        teams: [],
        team: null,
        members: [],
        member: null,
        tasks: [],
        task: null
    }

    const [state, dispatch] = useReducer(TeamReducer, initialState);

    // get all projects
    async function getTeamProjects() {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            setLoading();
            const { data } = await axios.get(`/api/team/projects`, { headers: { "x-auth-token": token.token } });
            dispatch({
                type: SET_PROJECTS,
                payload: data.projects
            })
            // console.log(data.projects)
            removeLoading();
        } catch (error) {
            localStorage.removeItem("token")
            window.location.href = "/login"
            console.log(error.response.data);
        }
    }

    const setProject = (data) => {
        dispatch({
            type: SET_PROJECT,
            payload: data
        })
    }
    // get a project based on ID
    async function getProject(id) {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            const { data } = await axios.get(`/api/team/project/${id}`, { headers: { "x-auth-token": token.token } });
            // console.log(data.project)
            setProject(data.project)
        } catch (error) {
            // console.log(error.response.data);
        }
    }

    // Get All teams in a Projectt
    async function getTeams(id) {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            setLoading();
            const { data } = await axios.get(`/api/team/project/${id}/teams`, { headers: { "x-auth-token": token.token } });
            dispatch({
                type: SET_TEAMS,
                payload: data.teams
            })
            // console.log(data.teams)
            removeLoading();
        } catch (error) {
            localStorage.removeItem("token")
            window.location.href = "/login"
            console.log(error.response.data);
        }
    }

    const setTeam = (data) => {
        dispatch({
            type: SET_TEAM,
            payload: data
        })
    }
    async function getTeam(proj_id, team_id) {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            const { data } = await axios.get(`/api/team/project/${proj_id}/team/${team_id}`, { headers: { "x-auth-token": token.token } });
            // console.log(data.team)
            setTeam(data.team)
        } catch (error) {
            // console.log(error.response.data);
        }
    }

    // Get All Members
    async function getMembers(project_id, team_id) {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            setLoading();
            const { data } = await axios.get(`/api/team/project/${project_id}/team/${team_id}/members`, { headers: { "x-auth-token": token.token } });
            
            dispatch({
                type: SET_MEMBERS,
                payload: data.members
            })
            // console.log(data.members)
            removeLoading();
        } catch (error) {
            localStorage.removeItem("token")
            window.location.href = "/login"
            // console.log(error.response.data);
        }
    }

    const setMember = (data) => {
        dispatch({
            type: SET_MEMBER,
            payload: data
        })
    }
    async function getMember(proj_id, team_id, member_id) {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            const { data } = await axios.get(`/api/team/project/${proj_id}/team/${team_id}/member/${member_id}`, { headers: { "x-auth-token": token.token } });
            console.log(data.member)
            setMember(data.member)
        } catch (error) {
            // console.log(error.response.data);
        }
    }


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

    const getTasks = async (project_id, team_id, member_id) => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            setLoading()
            let { data } = await axios.get(`/api/team/project/${project_id}/team/${team_id}/member/${member_id}/tasks`, { headers: { "x-auth-token": token.token }, });
            // console.log(data)
            setTasks(data)
            removeLoading()
        } catch (err) {
            removeLoading()
            localStorage.removeItem("token")
            window.location.href = "/login"
            console.log(err.response.data)
        }
    }

    const getTask = async (proj_id, team_id, member_id, id) => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            let { data } = await axios.get(`/api/team/project/${proj_id}/team/${team_id}/member/${member_id}/task/${id}`, {
                headers: { "x-auth-token": token.token },
            });
            // console.log(data)
            setTask(data)
        } catch (err) {
            // console.log(err.response.data)
        }
    }

    return (
        <TeamContext.Provider value={{
            projects: state.projects,
            project: state.project,
            teams: state.teams,
            team: state.team,
            members: state.members,
            member: state.member,
            getTeamProjects,
            getProject,
            setProject,
            getTeams,
            getTeam,
            setTeam,
            getMembers,
            getMember,
            setMember,
            task: state.task,
            tasks: state.tasks,
            getTasks,
            setTasks,
            setTask,
            getTask,
        }}>
            {props.children}
        </TeamContext.Provider>
    )


}

export default TeamState;