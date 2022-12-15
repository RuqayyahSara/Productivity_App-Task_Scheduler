import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios';
import {
    CAlert,
    CButton,
    CCol,
    CForm,
    CFormInput,
    CFormSelect,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle
} from "@coreui/react";

import spinner from "../../../Assets/Common/loading.gif";

import AdminContext from "../../../contexts/Admin/AdminContext";
import UtilsContext from '../../../contexts/Utils/UtilsContext';

function AddTeamAdmin() {
    const utilsContext = useContext(UtilsContext);
    const adminContext = useContext(AdminContext)

    const { alert, showAlert, setLoading, loading, removeLoading, countries, errorData, fetchFlags, setErrorData, visible, setVisible } = utilsContext;
    const { getTeamAdmins } = adminContext

    const [validated, setValidated] = useState(false);
    const [userData, setuserData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        country: "",
        address: ""
    });

    const onChangeHandler = (e) => {
        setuserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const submitHandler = async (e) => {
        try {
            e.preventDefault();
            setLoading();
            let token = JSON.parse(localStorage.getItem("token"));
            let { data } = await axios.post('/api/admin/team/addteamadmin', userData, { headers: { "x-auth-token": token.token } });
            removeLoading();
            showAlert({
                type: "success",
                msg: data.success,
            });
            setTimeout(() => {
                setVisible(false)
                getTeamAdmins()
            }, 1000)
        } catch (err) {
            removeLoading();
            let datas = {};
            if (err.response.data.error) {
                showAlert({
                    type: "danger",
                    msg: err.response.data.error
                });
            }
            if (err.response.data.errors) {
                err.response.data.errors.forEach((e) => {
                    let key = e.msg.split(" ")[0];
                    datas[key] = e.msg;
                });
                setErrorData(datas);
            }
            setTimeout(() => {
                setErrorData({})
            }, 3000)
            setValidated(true);
        }
    };

    useEffect(() => {
        fetchFlags()
        // eslint-disable-next-line
    }, [])
    return (
        <CModal visible={visible} onClose={() => setVisible(false)}>
            <CModalHeader onClose={() => setVisible(false)}>
                <CModalTitle>Add Team Admin </CModalTitle>
            </CModalHeader>
            <CModalBody>
                <center>
                    {alert !== null && (
                        <CAlert color={alert.type} className="alerts" style={{ width: "100%" }}>
                            {alert.msg}
                        </CAlert>
                    )}
                </center>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-12">
                            <div className="card mb-4 mx-4">
                                <div className="card-body p-4">

                                    <CForm
                                        className="row g-3"
                                        noValidate
                                        validated={validated}
                                        onSubmit={submitHandler}
                                    >
                                        <CCol md={6}>
                                            <CFormInput
                                                type="text"
                                                label="First name"
                                                name="firstname"
                                                defaultValue={userData.firstname}
                                                onChange={onChangeHandler}
                                                id="validationCustom01"
                                                feedbackValid={!errorData["First"] && 'Looks good!'}
                                                feedbackInvalid={errorData["First"]}
                                                invalid={errorData["First"] ? true : false}
                                            />
                                        </CCol>

                                        <CCol md={6}>
                                            <CFormInput
                                                type="text"
                                                name="lastname"
                                                label="Last name"
                                                value={userData.lastname}
                                                id="validationCustom02"
                                                required
                                                feedbackValid={!errorData["Last"] && 'Looks good!'}
                                                feedbackInvalid={errorData["Last"]}
                                                invalid={errorData["Last"] ? true : false}
                                                onChange={onChangeHandler}
                                            />
                                        </CCol>

                                        <CCol md={12}>
                                            <CFormInput
                                                type="email"
                                                name="email"
                                                label="Email Address"
                                                value={userData.email}
                                                id="validationCustomUsername"
                                                feedbackValid={!errorData["Email"] && 'Looks good!'}
                                                feedbackInvalid={errorData["Email"]}
                                                invalid={errorData["Email"] ? true : false}
                                                required
                                                onChange={onChangeHandler}
                                            />
                                        </CCol>
                                        <CCol md={12}>
                                            <CFormInput
                                                type="tel"
                                                label="Phone Number"
                                                name="phone"
                                                value={userData.phone}
                                                id="validationCustomUsername"
                                                feedbackValid={errorData["Phone"] ? true : false}
                                                feedbackInvalid={errorData["Phone"]}
                                                invalid={errorData["Phone"] ? true : false}
                                                required
                                                onChange={onChangeHandler}
                                            />
                                        </CCol>
                                        <CCol md={12}>
                                            <CFormSelect
                                                feedbackInvalid={errorData['Country']}
                                                aria-label="select Country"
                                                required
                                                onChange={(e) => {
                                                    setuserData({ ...userData, country: e.target.value })
                                                }}>
                                                <option value="">Select Country</option>
                                                {Object.keys(countries).map((e, i) => (
                                                    <option key={i} value={e}>{e}</option>
                                                ))}
                                            </CFormSelect>
                                        </CCol>

                                        <CCol md={12}>
                                            <CFormInput
                                                type="text"
                                                name="address"
                                                label="Address"
                                                placeholder='optional'
                                                feedbackValid='optional'
                                                onChange={onChangeHandler}
                                            />
                                        </CCol>
                                        <CModalFooter>
                                            <CButton color="secondary" onClick={() => {
                                                setVisible(false)
                                            }}> Close </CButton>
                                            <CButton color="primary" type='submit'>
                                                {loading && (
                                                    <img src={spinner} alt="spinner" width={25} />
                                                )}
                                                Add Team Admin</CButton>
                                        </CModalFooter>
                                    </CForm>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CModalBody>
        </CModal>
    )
}

export default AddTeamAdmin