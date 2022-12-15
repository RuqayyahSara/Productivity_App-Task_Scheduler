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
        <CTableRow>
            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
            <CTableDataCell style={{ color: "black", cursor: "pointer" }}>
                {ele.task}</CTableDataCell>
            <CTableDataCell>{ele.isCompleted ? "True" : "False"}</CTableDataCell>
            <CTableDataCell>{new Date(ele.deadline).toDateString() + ', ' + new Date(ele.deadline).toLocaleTimeString()}</CTableDataCell>
            <CTableDataCell>{ele.reminders.map((e, i) => (
                <span key={i}>{new Date(e).toDateString() + ', ' + new Date(e).toLocaleTimeString()}<br /></span>)
            )}</CTableDataCell>
            <CTableDataCell>{ele.notificationType}</CTableDataCell>
            <CTableDataCell>
                <CButton
                    style={{
                        color: "white",
                        backgroundColor: "#3299FE",
                        border: "2px solid #3299FE",
                        margin: "2px",
                        cursor: "pointer",
                        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                    }} onClick={() => setEdit(ele._id)}>
                    Edit Task
                </CButton>
                <CButton
                    style={{
                        color: "white",
                        backgroundColor: "#E55353",
                        border: "2px solid #E55353 ",
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