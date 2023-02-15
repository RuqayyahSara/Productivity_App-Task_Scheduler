import React, { useContext, useEffect, Fragment } from 'react'
import { useParams } from 'react-router-dom';
import AuthContext from "../../../contexts/Auth/AuthContext"
import UtilsContext from '../../../contexts/Utils/UtilsContext';
import TeamContext from '../../../contexts/Team/TeamContext';

import Loading from '../../Loading';
import AddTask from "./Add"
import ReadOnlyRow from "./ReadOnlyRow";
import TeamNavbar from '../Navbar';
import EditTask from "./Edit"
import {
    CButton,
    CCol,
    CContainer,
    CRow,
    CTable,
    CTableBody,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from "@coreui/react";
function Dashboard(id1, id2, id3) {
    let { project_id } = useParams(id1)
    let { team_id } = useParams(id2)
    let { member_id } = useParams(id3)
    const authContext = useContext(AuthContext);
    const utilsContext = useContext(UtilsContext);
    const teamContext = useContext(TeamContext)

    const { edit, setVisible, loading } = utilsContext;
    const { authUser } = authContext
    const { tasks, getTasks } = teamContext

    useEffect(() => {
        authUser('team')
        getTasks(project_id, team_id, member_id)
        // eslint-disable-next-line
    }, [])
    return (
        <>
            <TeamNavbar />
            <CContainer className="adminpagebox" style={{ marginTop: "5%", }} >
                <CRow>
                    <CCol xs={{ cols: "auto", row: "auto", }} sm={{ cols: "auto", row: "auto", }} md={{ cols: "auto", row: "auto", }}>
                        <h1 className="display-6">
                            <span role="img" aria-label="padlock icon">
                                {" "}
                                📝
                            </span>{" "}
                            Tasks{" "}
                            <CButton
                                style={{
                                    color: "white",
                                    backgroundColor: "#fc5a8d",
                                    border: "2px solid #fc5a8d",
                                    margin: "2px",
                                    cursor: "pointer",
                                    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                                }}
                                onClick={() => setVisible(true)}
                            >
                                Add Task
                            </CButton>
                            <AddTask project_id={project_id} team_id={team_id} member_id={member_id} />
                        </h1>
                        <center>
                            {loading ? <Loading /> : tasks.length ? (
                                <CTable bordered>
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
                                            <CTableHeaderCell scope="col">Edit/Delete</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {tasks.length ? tasks.map((e, i) => (
                                            <Fragment key={e._id}>
                                                {edit === e._id ?
                                                    (<EditTask project_id={project_id} team_id={team_id} member_id={member_id} />) : (
                                                        <ReadOnlyRow
                                                            key={e._id}
                                                            ele={e}
                                                            index={i}
                                                            project_id={project_id}
                                                            team_id={team_id}
                                                            member_id={member_id}
                                                        />
                                                    )}
                                            </Fragment>
                                        )) : <></>}
                                    </CTableBody>
                                </CTable>
                            ) : <h1>Nothing To display</h1>}
                        </center>
                    </CCol>
                </CRow>
            </CContainer>
        </>
    )
}

export default Dashboard