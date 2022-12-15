import React, { Fragment, useEffect, useState, useContext } from "react";
import axios from "axios";
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
    CAlert,
    CForm,
    CFormInput,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle
} from "@coreui/react";
import "../../../App.css";

import AdminContext from "../../../contexts/Admin/AdminContext";
import UtilsContext from '../../../contexts/Utils/UtilsContext';

import EditTeamAdmin from "./EditTeamAdmin";
import AddTeamAdmin from "./AddTeamAdmin"
// import Loading from "../../Loading";
import spinner from "../../../Assets/Common/loading.gif";
import AdminNavbar from "../Navbar";
import ReadOnlyRow from "./ReadOnly";

function Manage() {
    const adminContext = useContext(AdminContext)
    const utilsContext = useContext(UtilsContext);

    const { edit, setVisible, alert, showAlert, loading, setLoading, removeLoading } = utilsContext;
    const { getTeamAdmins, admins } = adminContext

    const [del, setDel] = useState(false);
    const [delname, setDelname] = useState(null);
    const [confirmDelname, setConfirmDelname] = useState("");

    // eslint-disable-next-line

    useEffect(() => {
        getTeamAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const deleteRow = async (e) => {
        e.preventDefault()
        console.log(confirmDelname.split("-")[0])
        try {
            if (delname !== confirmDelname.split("-")[1]) {
                showAlert({
                    type: "danger",
                    msg: "Email does not match!"
                });
            } else {
                setLoading()
                let token = JSON.parse(localStorage.getItem("token"));
                const { data } = await axios.delete(`/api/admin/team/teamadmin/${confirmDelname.split("-")[0]}`, {
                    headers: { "x-auth-token": token.token }
                });
                removeLoading();
                showAlert({
                    type: "success",
                    msg: data.success
                });
                setTimeout(() => {
                    setDel(false)
                    getTeamAdmins()
                }, 1000)
            }
        } catch (error) {
            removeLoading();
            console.log(error.response.data);
        }
    };

    const suspendRow = async (e) => {
        e.preventDefault()
        try {
            if (delname !== confirmDelname.split("-")[1]) {
                showAlert({
                    type: "danger",
                    msg: "Email does not match!"
                });
            } else {
                setLoading()
                let token = JSON.parse(localStorage.getItem("token"));
                const { data } = await axios.delete(`/api/admin/team/teamadmin/suspend/${confirmDelname.split("-")[0]}`, {
                    headers: { "x-auth-token": token.token },
                    data: { userstatus: "suspended" }
                });
                removeLoading();
                showAlert({
                    type: "success",
                    msg: data.success
                });
                setTimeout(() => {
                    setDel(false)
                    getTeamAdmins()
                }, 1000)
            }
        } catch (error) {
            removeLoading();
            console.log(error.response.data);
        }
    };

    const activeRow = async (e) => {
        e.preventDefault()
        try {
            if (delname !== confirmDelname.split("-")[1]) {
                showAlert({
                    type: "danger",
                    msg: "Email does not match!"
                });
            } else {
                setLoading()
                let token = JSON.parse(localStorage.getItem("token"));
                const { data } = await axios.delete(`/api/admin/team/teamadmin/suspend/${confirmDelname.split("-")[0]}`, {
                    headers: { "x-auth-token": token.token },
                    data: { userstatus: "active" }
                });
                removeLoading();
                showAlert({
                    type: "success",
                    msg: data.success
                });
                setTimeout(() => {
                    setDel(false)
                    getTeamAdmins()
                }, 1000)
            }
        } catch (error) {
            removeLoading();
            console.log(error.response.data);
        }
    };

    // if (loading) return <Loading />;

    return (<>
        <AdminNavbar />
        <CContainer className="adminpagebox" style={{ marginTop: "5%", }} >
            <CRow>
                <CCol xs={{ cols: "auto", row: "auto", }} sm={{ cols: "auto", row: "auto", }} md={{ cols: "auto", row: "auto", }}>
                    <h1 className="display-6">
                        <span role="img" aria-label="padlock icon">
                            {" "}
                            📝
                        </span>{" "}
                        Team Admin Dashboard{" "}
                        <CButton
                            style={{
                                color: "white",
                                backgroundColor: "#9370db",
                                border: "2px solid #9370db",
                                margin: "2px",
                                cursor: "pointer",
                                boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                            }}
                            onClick={() => setVisible(true)}
                        >
                            Add Team Admin
                        </CButton>
                        <AddTeamAdmin />
                    </h1>
                    <center>
                        <CTable bordered>
                            <CTableHead>
                                <CTableRow color="dark">
                                    <CTableHeaderCell scope="col">S.No</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Team Admin Name</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Edit/Delete</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {admins.length ? admins.map((e, i) => (
                                    <Fragment key={e._id}>
                                        {edit === e._id ?
                                            (<EditTeamAdmin />) : (
                                                <ReadOnlyRow
                                                    key={e._id}
                                                    ele={e}
                                                    index={i}
                                                    del={del}
                                                    setDel={setDel}
                                                    setConfirmDelname={setConfirmDelname}
                                                />
                                            )}
                                    </Fragment>
                                )) : <></>}
                            </CTableBody>
                        </CTable>
                        {/* Delete Modal */}
                        <CModal visible={del ? true : false} onClose={() => setDel(false)}>
                            <CModalHeader onClose={() => setDel(false)}>
                                <CModalTitle>{confirmDelname.split("-")[2]} Team Admin</CModalTitle>
                            </CModalHeader>
                            <CModalBody>
                                <center>
                                    {alert !== null && (
                                        <CAlert color={alert.type} className="alerts">
                                            {alert.msg}
                                        </CAlert>
                                    )}
                                </center>
                                <CForm onSubmit={confirmDelname.split("-")[2] === "Delete" ? deleteRow : (confirmDelname.split("-")[2] === "Activate" ? activeRow : suspendRow)}>
                                    <label>Please type email, <b>{confirmDelname.split("-")[1]}</b> to confirm.</label>
                                    <CFormInput
                                        type="text"
                                        id="exampleFormControlInput2"
                                        placeholder="Email Address"
                                        aria-describedby="exampleFormControlInputHelpInline"
                                        onChange={(e) => setDelname(e.target.value)}
                                    />
                                    <CModalFooter>
                                        <CButton color="secondary" onClick={() => setDel(false)}>
                                            Close
                                        </CButton>
                                        <CButton color="danger"
                                            type="submit"
                                        >
                                            {loading && (
                                                <img src={spinner} alt="spinner" width={25} />
                                            )}
                                            Confirm
                                        </CButton>
                                    </CModalFooter>
                                </CForm>
                            </CModalBody>
                        </CModal>
                    </center>
                </CCol>
            </CRow>
        </CContainer>
    </>
    );
}

export default Manage;