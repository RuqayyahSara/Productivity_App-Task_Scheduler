import React, { useContext } from "react";
import axios from "axios";

import {
    CButton,
    CTableDataCell,
    CTableHeaderCell,
    CTableRow,
} from "@coreui/react";

import UtilsContext from '../../contexts/Utils/UtilsContext';
import TodoContext from "../../contexts/Todos/TodoContext";

function ReadOnly({ ele, index
    // eslint-disable-next-line
}) {
    const todoContext = useContext(TodoContext)
    const utilsContext = useContext(UtilsContext);

    const { getTasks } = todoContext
    const { setEdit } = utilsContext;

    const deleteRow = async (e) => {
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            await axios.delete(`/api/user/task/${e.target.id}`, { headers: { "x-auth-token": token.token } });
            getTasks()
        } catch (err) {
            console.log(err.response.data)
        }
    }

    return (
        <CTableRow style={{ backgroundColor: ele.isCompleted ? "#ace1af " : "#ff9999" }}>
            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
            <CTableDataCell style={{ color: "black", cursor: "pointer" }}>
                {ele.task}</CTableDataCell>
            <CTableDataCell>{ele.isCompleted ? "True" : "False"}</CTableDataCell>
<CTableDataCell>{ new Date(ele.deadline).toDateString() +', '+new Date(ele.deadline).toLocaleTimeString()}</CTableDataCell>
            <CTableDataCell>{ele.reminders.map((e, i) => (
                <span key={i}>{new Date(e).toDateString() + ', ' + new Date(e).toLocaleTimeString()}<br /></span>)
            )}</CTableDataCell>
            <CTableDataCell>{ele.notificationType}</CTableDataCell>
            <CTableDataCell>
                <CButton
                    style={{
                        color: "white",
                        backgroundColor: "#273be2",
                        border: "2px solid #273be2",
                        margin: "2px",
                        cursor: "pointer",
                        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                    }} onClick={() => setEdit(ele._id)}>
                    Edit Task
                </CButton>
                <CButton
                    style={{
                        color: "white",
                        backgroundColor: "#cb4154 ",
                        border: "2px solid #cb4154  ",
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
