import React, { useContext, useEffect, useState, Fragment } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loading from "../Loading"
import TeamNavbar from "./Navbar"
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
function Teams(id2, id3, id4) {
    let { project_id } = useParams(id2)
    let { i } = useParams(id3)
    let { role } = useParams(id4)
    const authContext = useContext(AuthContext);
    const memberContext = useContext(MemberContext)

    // eslint-disable-next-line
    const [color, setColor] = useState(['primary', 'success', 'danger', 'warning', 'info', 'dark'])

    const { authUser } = authContext
    const { projects } = memberContext
    const [teamss, setTeams] = useState([])

    let getTeams = () => {
        try {
            // console.log(projects)
            let teams = projects[i]
            console.log(teams)
            teams = teams.projects[0].teams.map(e => ({ name: e.teamName, _id: e._id }))
            console.log(teams)
            setTeams(teams)
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        authUser(role)
        getTeams()
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
                            Your Teams{" "}
                        </h1>
                        <center>
                            <CCardGroup>
                                {teamss.length ?
                                    teamss.map((e, i) => (
                                        <CCard
                                            color={color[Math.floor(Math.random() * 6)]}
                                            textColor='white'
                                            className="mb-3"
                                            style={{ maxWidth: '18rem', margin: "15px", height: '170px' }}
                                            key={i}
                                        >
                                            <CCardHeader>Team</CCardHeader>
                                            <CCardBody>
                                                <CCardTitle> {e.name}</CCardTitle>
                                                {/* <br /> */}
                                                <Link to={`/member/${project_id}/tasks/${e._id}/${role}`}> <CButton style={{
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
                                    : <Loading />}
                            </CCardGroup>
                        </center>
                    </CCol>
                </CRow>
            </CContainer>
        </>
    )
}

export default Teams