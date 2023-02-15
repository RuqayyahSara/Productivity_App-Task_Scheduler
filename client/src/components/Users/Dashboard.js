import React, { useEffect, useContext, Fragment } from 'react'
import { Link } from 'react-router-dom';
import Navbar from "./Navbar";
import Loading from '../Loading';
import AddTask from "./Add";
import EditTask from "./Edit";
import ReadOnlyRow from './ReadOnlyRow'
import UtilsContext from '../../contexts/Utils/UtilsContext';
import AuthContext from '../../contexts/Auth/AuthContext';
import TodoContext from "../../contexts/Todos/TodoContext";

import { CCol, CContainer, CRow } from "@coreui/react";
import {
    CTable,
    CTableBody,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CButton,
} from "@coreui/react";

function Dashboard() {
    let utilsContext = useContext(UtilsContext)
    let authContext = useContext(AuthContext)
    let todoContext = useContext(TodoContext)

    const { authUser } = authContext
    const { tasks, getTasks } = todoContext
    const { setVisible, edit, loading } = utilsContext
    useEffect(() => {
        authUser('user');
        getTasks()
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <Navbar />
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
                            User Dashboard{" "}
                            <CButton
                                style={{
                                    color: "white",
                                    backgroundColor: "#fc5a8d",
                                    border: "2px solid #fc5a8d",
                                    margin: "2px",
                                    cursor: "pointer",
                                    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                                }}
                                onClick={() => setVisible(true)}>
                                Add Task
                            </CButton>
                            <Link to="/member/user">
                                <CButton
                                    style={{
                                        color: "white",
                                        backgroundColor: "#9370db",
                                        border: "2px solid #9370db",
                                        margin: "2px",
                                        cursor: "pointer",
                                        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                                    }}
                                >
                                    Your Projects
                                </CButton></Link>
                            <AddTask />
                        </h1>
                        <center>
                            {loading ? <Loading /> :  tasks.length ? (
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
                                            <CTableHeaderCell scope="col">Update Task</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {tasks.map((e, i) => (
                                            <Fragment key={e._id}>
                                                {edit === e._id ?
                                                    (<EditTask />) : (
                                                        <ReadOnlyRow
                                                            key={e._id}
                                                            ele={e}
                                                            index={i}
                                                        />
                                                    )}
                                            </Fragment>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            ): <h1>Nothing To display</h1>}
                        </center>
                    </CCol>
                </CRow>
            </CContainer>
        </>
    );
}

export default Dashboard;