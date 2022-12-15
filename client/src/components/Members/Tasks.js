import React, { useEffect, useContext, Fragment } from 'react'
import { useParams } from 'react-router-dom';
import Navbar from "./Navbar";
import AuthContext from '../../contexts/Auth/AuthContext';
import MemberContext from '../../contexts/Member/MemberContext';

import { CCol, CContainer, CRow } from "@coreui/react";
import {
    CTable,
    CTableBody,
    CTableHead,
    CTableHeaderCell,
    CTableDataCell,
    CTableRow,
} from "@coreui/react";

function Tasks(id1, id2, id3) {
    let { project_id } = useParams(id1)
    let { team_id } = useParams(id2)
    let { role } = useParams(id3)

    let authContext = useContext(AuthContext)
    const memberContext = useContext(MemberContext)
    const { tasks, getTasks } = memberContext
    const { authUser } = authContext

    useEffect(() => {
        authUser(role);
        getTasks(project_id, team_id)
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <Navbar role={role}/>
            <CContainer style={{ marginTop: "5%" }}>
                <CRow>
                    <CCol
                        xs={{ cols: "auto", row: "auto" }}
                        sm={{ cols: "auto", row: "auto" }}
                        md={{ cols: "auto", row: "auto" }}
                    >
                        <h1 className="display-6">
                            <span role="img" aria-label="padlock icon">
                                {" "}
                                📝
                            </span>{" "}
                            My Tasks{" "}
                        </h1>
                        <center>
                            <CTable>
                                <CTableHead>
                                    <CTableRow color="dark">
                                        <CTableHeaderCell scope="col">S.No</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Task Name</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Deadline</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Reminders</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">
                                            Notification Type
                                        </CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                {tasks.length ? (
                                    <CTableBody>
                                        {tasks.map((ele, i) => (
                                            <CTableRow key={i}>
                                                <CTableHeaderCell scope="row">{i + 1}</CTableHeaderCell>
                                                <CTableDataCell style={{ color: "black", cursor: "pointer" }}>
                                                    {ele.task}</CTableDataCell>
                                                <CTableDataCell>{ele.isCompleted ? "True" : "False"}</CTableDataCell>
                                                <CTableDataCell>{new Date(ele.deadline).toDateString() + ', ' + new Date(ele.deadline).toLocaleTimeString()}</CTableDataCell>
                                                <CTableDataCell>{ele.reminders.map((e, i) => (
                                                    <span key={i}>{new Date(e).toDateString() + ', ' + new Date(e).toLocaleTimeString()}<br /></span>)
                                                )}</CTableDataCell>
                                                <CTableDataCell>{ele.notificationType}</CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                ) : (<CTableBody>
                                    <CTableRow>
                                        <CTableDataCell>Nothing to Display</CTableDataCell>
                                    </CTableRow>
                                </CTableBody>)}
                            </CTable>
                        </center>
                    </CCol>
                </CRow>
            </CContainer>
        </>
    );
}

export default Tasks;