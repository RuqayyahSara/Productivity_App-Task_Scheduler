import React, { useContext } from "react";
import axios from "axios";

import {
    CButton,
    CTableDataCell,
    CTableHeaderCell,
    CTableRow,
} from "@coreui/react";

import UtilsContext from '../../../contexts/Utils/UtilsContext';
import TeamContext from "../../../contexts/Team/TeamContext";

function ReadOnly({ ele, index, project_id, team_id, member_id
    // eslint-disable-next-line
}) {
    const teamContext = useContext(TeamContext)
    const utilsContext = useContext(UtilsContext);

    const { getTasks } = teamContext
    const { setEdit } = utilsContext;

    const deleteRow = async (e) => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            await axios.delete(`/api/team/project/${project_id}/team/${team_id}/member/${member_id}/task/${e.target.id}`, { headers: { "x-auth-token": token.token } });
            getTasks(project_id, team_id, member_id)
        } catch (err) {
            console.log(err.response.data)
        }
    }

    return (
        <CTableRow style={{backgroundColor: ele.isCompleted ?  "#ace1af" : "#dcdcdc"}}>
            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
            <CTableDataCell style={{ color: "black", cursor: "pointer" }}>
                {ele.task}</CTableDataCell>
            <CTableDataCell>{ele.isCompleted ? "True" : "False"}</CTableDataCell>
            <CTableDataCell>{new Date(ele.deadline).toLocaleString()}</CTableDataCell>
            <CTableDataCell>{ele.reminders.map((e, i) => (
                <span key={i}>{new Date(e).toLocaleString()}<br /></span>)
            )}</CTableDataCell>
            <CTableDataCell>{ele.notificationType}</CTableDataCell>
            <CTableDataCell>
                {ele.isCompleted ? (<CButton disabled
                    style={{
                        color: "white",
                        backgroundColor: "#0066cc",
                        border: "2px solid #0066cc",
                        margin: "2px",
                        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                    }} onClick={() => setEdit(ele._id)}>
                    Edit Task
                </CButton>) : (<CButton
                    style={{
                        color: "white",
                        backgroundColor: "#0066cc",
                        border: "2px solid #0066cc",
                        margin: "2px",
                        cursor: "pointer",
                        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                    }} onClick={() => setEdit(ele._id)}>
                    Edit Task
                </CButton>)}
                <CButton
                    style={{
                        color: "white",
                        backgroundColor: "#e8000d",
                        border: "2px solid #e8000d ",
                        margin: "2px",
                        cursor: "pointer",
                        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                    }}
                    id={ele._id}
                    onClick={deleteRow}
                >
                    Delete Task
                </CButton>
            </CTableDataCell>
        </CTableRow>
    );
}

export default ReadOnly;
