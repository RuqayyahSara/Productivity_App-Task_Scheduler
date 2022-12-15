import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loading from "../Loading"
import TeamNavbar from "./Navbar"
import UtilsContext from '../../contexts/Utils/UtilsContext'
import AuthContext from "../../contexts/Auth/AuthContext"
import MemberContext from '../../contexts/Member/MemberContext';
import {
    CButton,
    CCol,
    CContainer,
    CRow,
    CCard,
    CCardBody,
    CCardHeader,
    CCardTitle,
    CCardGroup,
} from "@coreui/react";
function Dashboard(id) {
    const { role } = useParams(id)
    const authContext = useContext(AuthContext);
    const memberContext = useContext(MemberContext)
    const utilsContext = useContext(UtilsContext)

    const { authUser } = authContext
    const { loading } = utilsContext
    const { projects, setProjects } = memberContext

    // eslint-disable-next-line
    const [color, setColor] = useState(['primary', 'success', 'danger', 'warning', 'info', 'dark'])

    useEffect(() => {
        authUser(role)
        setProjects()
        // eslint-disable-next-line
    }, [])
    return (
        <>
            <TeamNavbar role={role} />
            <CContainer className="adminpagebox" style={{ marginTop: "5%", }} >
                <CRow>
                    <CCol xs={{ cols: "auto", row: "auto", }} sm={{ cols: "auto", row: "auto", }} md={{ cols: "auto", row: "auto", }}>
                        <h1 className="display-6">
                            <span role="img" aria-label="padlock icon">
                                {" "}
                                📝
                            </span>{" "}
                            Your Projects{" "}
                        </h1>
                        <center>
                            <CCardGroup>
                                {loading === true ? <Loading /> :
                                    projects.length ?
                                        projects.map((e, i) => (
                                            <CCard
                                                color={color[Math.floor(Math.random() * 6)]}
                                                textColor='white'
                                                className="mb-3"
                                                style={{ maxWidth: '18rem', margin: "15px", height: '170px' }}
                                                key={i}
                                            >
                                                <CCardHeader>Project</CCardHeader>
                                                <CCardBody>
                                                    <CCardTitle> {e.projects[0].projectName}</CCardTitle>
                                                    {/* <br /> */}
                                                    <Link to={`/member/${e.projects[0]._id}/${i}/${role}`}> <CButton style={{
                                                        color: "black",
                                                        backgroundColor: "#ffefd5",
                                                        border: "2px solid #ffefd5",
                                                        margin: "10px",
                                                        cursor: "pointer",
                                                        marginBottom: "30px",
                                                        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                                                    }}>View</CButton></Link>
                                                </CCardBody>
                                            </CCard>
                                        ))
                                        : <h1>
                                            <center>
                                                No projects To display
                                            </center>
                                        </h1>
                                }
                                { }
                            </CCardGroup>
                        </center>
                    </CCol>
                </CRow>
            </CContainer>
        </>
    )
}

export default Dashboard