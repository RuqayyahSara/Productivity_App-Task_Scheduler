import React, { useContext, useEffect } from 'react'
import AuthContext from "../../contexts/Auth/AuthContext"
import AdminNavbar from './Navbar';
import orglogo from "../../Assets/Admin/orglogo.png";
import userlogo from "../../Assets/User/userlogo.png";
import {
    CContainer,
    CRow,
    CCol,
    CCard,
    CCardImage,
    CButton,
    CCardBody,
    CCardText,
    CCardTitle,
} from "@coreui/react";
function Dashboard() {
    const authContext = useContext(AuthContext);
    const { authUser} = authContext

    useEffect(() => {
        authUser("admin")
        // eslint-disable-next-line
    }, [])
    return (
        <div>
            <AdminNavbar />
            <CContainer style={{ marginTop: "5%" }}>
                <center>
                    <CRow>
                        <CCol
                            xs={{ cols: "auto", row: "auto" }}
                            sm={{ cols: "auto", row: "auto" }}
                            md={{ cols: "auto", row: "auto" }}
                        >
                            <CCard
                                className="admin1"
                                style={{
                                    width: "350px",
                                    border: "30px solid white",
                                }}
                            >
                                <CCardImage orientation="top" src={userlogo} />
                                <CCardBody>
                                    <CCardTitle>Users</CCardTitle>
                                    <CCardText>Tasky App For Users</CCardText>
                                    <CButton
                                        style={{
                                            color: "white",
                                            backgroundColor: "#FF735C",
                                            border: "2px solid #FF735C",
                                            margin: "10px",
                                            cursor: "pointer",
                                            marginBottom: "30px",
                                            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                                        }}
                                        color="info"
                                        size="lg"
                                        href="/admin/users"
                                    >
                                        Click Here
                                    </CButton>
                                </CCardBody>
                            </CCard>
                        </CCol>
                        <CCol>
                            <CCard
                                className="adminpage2"
                                style={{
                                    width: "350px",
                                    border: "30px solid white",
                                }}
                            >
                                <CCardImage orientation="top" src={orglogo} />
                                <CCardBody>
                                    <CCardTitle>Organization</CCardTitle>
                                    <CCardText>Tasky App For Organization</CCardText>
                                    <CButton
                                        style={{
                                            color: "white",
                                            backgroundColor: "#FF735C",
                                            border: "2px solid #FF735C",
                                            margin: "10px",
                                            cursor: "pointer",
                                            marginBottom: "30px",
                                            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                                        }}
                                        color="info"
                                        size="lg"
                                        href="/admin/teams"
                                    >
                                        Click Here
                                    </CButton>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </center>
            </CContainer>
        </div>
    )
}

export default Dashboard