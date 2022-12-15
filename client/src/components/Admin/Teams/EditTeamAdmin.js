import React, { useState, useContext, useEffect } from 'react'
import axios from "axios"
import {
    CAlert,
    CButton,
    CCol,
    CForm,
    CFormInput,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle
} from "@coreui/react";
import spinner from "../../../Assets/Common/loading.gif";
import UtilsContext from '../../../contexts/Utils/UtilsContext';
import AdminContext from '../../../contexts/Admin/AdminContext';
function EditTeamAdmin() {
    const utilsContext = useContext(UtilsContext);
    const adminContext = useContext(AdminContext)
    const { alert, showAlert, setLoading, loading, removeLoading, errorData, setErrorData, edit, setEdit } = utilsContext;
    const { getUserProfile, user, setUser, getTeamAdmins } = adminContext

    const [validated, setValidated] = useState(false);
    const [userData, setuserData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (!user)
            getUserProfile(edit)
        else
            setuserData({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone
            })
        // eslint-disable-next-line
    }, [user])

    const submitHandler = async (e) => {
        try {
            e.preventDefault();
            setLoading();
            let token = JSON.parse(localStorage.getItem("token"));
            let { data } = await axios.put(`/api/admin/team/teamadmin/${edit}`, userData, { headers: { "x-auth-token": token.token } });

            removeLoading();
            showAlert({
                type: "success",
                msg: data.success
            });
            setTimeout(() => {
                setEdit(false)
                setUser(null)
                getTeamAdmins()
            }, 1000)
        } catch (err) {
            removeLoading();
            let datas = {};
            // console.log(err.response.data)
            if (err.response.data.error) {
                showAlert({
                    type: "danger",
                    msg: err.response.data.error
                });
            }
            if (err.response.data.errors) {
                err.response.data.errors.forEach((e) => {
                    let key = e.msg.split(" ")[0];
                    console.log(key)
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

    const onChangeHandler = (e) => {
        setuserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <CModal visible={edit ? true : false} onClose={() => setEdit(false)}>
            <CModalHeader onClose={() => setEdit(false)}>
                <CModalTitle>Edit Team Admin </CModalTitle> <br />
            </CModalHeader>
            <CModalBody>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-12">
                            <div className="card mb-4 mx-4">
                                <div className="card-body p-4">
                                    {alert !== null && (
                                        <CAlert color={alert.type} className="alerts" style={{ width: "100%" }}>
                                            {alert.msg}
                                        </CAlert>
                                    )}
                                    <CForm
                                        className="row g-3"
                                        noValidate
                                        validated={validated}
                                        onSubmit={submitHandler}
                                    >
                                        <CCol md={6}>
                                            <CFormInput
                                                type="text"
                                                name="firstname"
                                                label="First name"
                                                value={userData.firstname}
                                                id="validationCustom01"
                                                required
                                                feedbackValid={!errorData["First"] && 'Looks good!'}
                                                feedbackInvalid={errorData["First"]}
                                                invalid={errorData["First"] ? true : false}
                                                onChange={onChangeHandler}
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
                                        <CModalFooter>
                                            <CButton color="secondary" onClick={() => {
                                                setEdit(false)
                                                setUser(null)
                                            }}> Close </CButton>
                                            <CButton color="primary" type='submit'>
                                                {loading && (
                                                    <img src={spinner} alt="spinner" width={25} />
                                                )}
                                                Update Team Admin</CButton>
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

export default EditTeamAdmin