import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../contexts/Auth/AuthContext';
import UtilsContext from '../contexts/Utils/UtilsContext';

import {
    CButton,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CRow,
    CAlert
} from "@coreui/react";

function ResetPassword(id) {
    let { role } = useParams(id)
    let navigate = useNavigate()
    let authContext = useContext(AuthContext)
    let utilsContext = useContext(UtilsContext)

    const { authUser, isAuth } = authContext
    const { alert, showAlert, errorData, setErrorData } = utilsContext

    const [validated, setValidated] = useState(false);
    const [userData, setUserData] = useState({
        newpassword: "",
        confirmnewpassword: "",
    });

    useEffect(() => {
        if (!isAuth)
            authUser(role)
        // eslint-disable-next-line
    }, [isAuth]);

    const onChangeHandler = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            let token = JSON.parse(localStorage.getItem("token"));
            let { data } = await axios.post("/api/resetpassword", userData, { headers: { "x-auth-token": token.token } });
            showAlert({
                type: "success",
                msg: data.success,
            });
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000)
        } catch (err) {
            let data,
                datas = {};
            if (err.response.data.error) {
                data = err.response.data.error;
                showAlert({
                    type: "danger",
                    msg: data,
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

    return (
        <>
            <CContainer style={{ marginTop: "5%" }}>
                <center>
                    <CRow>
                        <CCol
                            sm={{ cols: "auto", row: "auto" }}
                            md={{ cols: "auto", row: "auto" }}
                            xs={{ span: true, order: "last" }}
                        >
                            <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-md-12">
                                        <div className="card mb-4 mx-4">
                                            <div className="card-body p-4">
                                                <h3 style={{ color: "grey" }}>Reset password</h3>
                                                {alert !== null && (

                                                    <CAlert color={alert.type} className="alerts" width='500px'>
                                                        {alert.msg}
                                                    </CAlert>

                                                )}
                                                <CForm className="row g-3 needs-validation" noValidate validated={validated} onSubmit={submitHandler}>
                                                    <center>
                                                        <div className="col-md-8">
                                                            <label
                                                                htmlFor="validationCustom04"
                                                                className="form-label"
                                                            >
                                                                Password
                                                            </label>
                                                            <CFormInput
                                                                className="form-control"
                                                                type="password"
                                                                name="newpassword"
                                                                feedbackInvalid={errorData["New"]}
                                                                id="validationCustom04"
                                                                autoComplete="off"
                                                                invalid={errorData["New"] ? true : false}
                                                                required
                                                                onChange={onChangeHandler}
                                                            />
                                                        </div>

                                                        <div className="col-md-8">
                                                            <label
                                                                htmlFor="validationCustom03"
                                                                className="form-label"
                                                            >
                                                                Confirm Password
                                                            </label>
                                                            <CFormInput
                                                                className="form-control"
                                                                type="password"
                                                                name="confirmnewpassword"
                                                                feedbackInvalid={errorData["Password"]}
                                                                autoComplete="off"
                                                                id="validationCustom03"
                                                                invalid={errorData["Password"] ? true : false}
                                                                required
                                                                onChange={onChangeHandler}
                                                            />
                                                        </div>
                                                    </center>
                                                    <CCol xs={12}>
                                                        <CButton color="info" type="submit">
                                                            Reset
                                                        </CButton>
                                                    </CCol>
                                                </CForm>


                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CCol>
                    </CRow>
                </center>
            </CContainer>
        </>
    )
}

export default ResetPassword