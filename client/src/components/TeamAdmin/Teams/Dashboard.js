import React, { useContext, useEffect, Fragment } from 'react'
import { useParams } from 'react-router-dom';
import AuthContext from "../../../contexts/Auth/AuthContext"
import UtilsContext from '../../../contexts/Utils/UtilsContext';
import TeamContext from '../../../contexts/Team/TeamContext';

import AddTeam from "./Add"
import ReadOnlyRow from "./ReadOnlyRow";
import TeamNavbar from '../Navbar';
import EditTeam from "./Edit"
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
function Dashboard(id) {
    let { project_id } = useParams(id)
    const authContext = useContext(AuthContext);
    const utilsContext = useContext(UtilsContext);
    const teamContext = useContext(TeamContext)

    const { edit, setVisible } = utilsContext;
    const { authUser } = authContext
    const { teams, getTeams } = teamContext

    useEffect(() => {
        authUser('team')
        getTeams(project_id)
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
                            Teams{" "}
                            <CButton
                                style={{
                                    color: "white",
                                    backgroundColor: "#7A6EE8",
                                    border: "2px solid #7A6EE8",
                                    margin: "2px",
                                    cursor: "pointer",
                                    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                                }}
                                onClick={() => setVisible(true)}
                            >
                                Add Team
                            </CButton>
                            <AddTeam project_id={project_id} />
                        </h1>
                        <center>
                            <CTable bordered>
                                <CTableHead>
                                    <CTableRow color="dark">
                                        <CTableHeaderCell scope="col">S.No</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Team Name</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Edit/Delete</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {teams.length ? teams.map((e, i) => (
                                        <Fragment key={e._id}>
                                            {edit === e._id ?
                                                (<EditTeam project_id={project_id} />) : (
                                                    <ReadOnlyRow
                                                        key={e._id}
                                                        ele={e}
                                                        index={i}
                                                        project_id={project_id}
                                                    />
                                                )}
                                        </Fragment>
                                    )) : <></>}
                                </CTableBody>
                            </CTable>
                        </center>
                    </CCol>
                </CRow>
            </CContainer>
        </>
    )
}

export default Dashboard