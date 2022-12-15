import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    CAlert,
    CButton,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CImage,
    CRow, CToast, CToastBody, CToastClose, CToaster,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle
} from "@coreui/react";

import homebg from "../Assets/Common/homebackground.jpg";
import spinner from "../Assets/Common/loading.gif";
import Navbar from "./Navbar";

// import userContext from "../contexts/Users/UserContext";
import UtilsContext from "../contexts/Utils/UtilsContext";

function Login() {
    let navigate = useNavigate()
    // const usersContext = useContext(userContext);
    const utilsContext = useContext(UtilsContext);

    // const {  } = usersContext;
    const { alert, showAlert, setLoading, loading, removeLoading, errorData, setErrorData } = utilsContext;

    const [validated, setValidated] = useState(false);
    const [visible, setVisible] = useState(false);
    const [userData, setUserData] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        let token = localStorage.getItem("token");
        if (JSON.parse(token))
            if (JSON.parse(token).role === "member")
                navigate(`/${JSON.parse(token).role}/member`)
            else
                navigate(`/${JSON.parse(token).role}`)
    });

    const onChangeHandler = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading();
            let { data } = await axios.post("/api/login", userData);
            localStorage.setItem("tokeno", JSON.stringify(data));
            removeLoading()
            navigate("/verify/otp", { replace: true });
        } catch (err) {
            removeLoading()
            let data, datas = {};
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


    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading();
            let { data } = await axios.post(`/api/resend/${visible}`, userData);
            showAlert({
                type: "success",
                msg: data.success,
            });
            removeLoading()
        } catch (err) {
            removeLoading()
            let data, datas = {};
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
            <Navbar />
            <CToaster style={{ float: "right", right: "0px", textDecoration: "none",top:"-10px" }}>
                <CToast autohide={false} visible={true} animation={true} color="success" style={{ cursor: "pointer" }}
                    className="text-white align-items-center">
                    <div className="d-flex" >
                        <CToastBody onClick={() => setVisible("email")}>Resend Email Verification</CToastBody>
                        <CToastClose className="me-2 m-auto" white />
                    </div>
                </CToast>
                <CToast autohide={false} visible={true} color="primary" style={{ cursor: "pointer" }}
                    className="text-white align-items-center">
                    <div className="d-flex" >
                        <CToastBody onClick={() => setVisible("phone")}>Resend Phone Verification</CToastBody>
                        <CToastClose className="me-2 m-auto" white />
                    </div>
                </CToast>
            </CToaster >

            <CModal visible={visible ? true: false} onClose={() => setVisible(false)}>
                <CModalHeader onClose={() => setVisible(false)}>
                    <CModalTitle>Add Team </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-12">
                                <div className="card mb-4 mx-4">
                                    <div className="card-body p-4">
                                        {alert !== null && (
                                            <CAlert color={alert.type} className="alerts">
                                                {alert.msg}
                                            </CAlert>
                                        )}
                                        <CForm
                                            className="row g-3"
                                            noValidate
                                            validated={validated}
                                            onSubmit={submitHandler}
                                        >
                                            <CCol md={12}>
                                                <CFormInput
                                                    type="text"
                                                    label="Email"
                                                    name="email"
                                                    value={userData.email}
                                                    onChange={onChangeHandler}
                                                    id="validationCustom01"
                                                    feedbackValid={!errorData["Email"] && 'Looks good!'}
                                                    feedbackInvalid={errorData["Email"]}
                                                    invalid={errorData["Email"] ? true : false}
                                                />
                                            </CCol>

                                            <CCol md={12}>
                                                <CFormInput
                                                    type="password"
                                                    label="Password"
                                                    name="password"
                                                    value={userData.password}
                                                    onChange={onChangeHandler}
                                                    id="validationCustom01"
                                                    feedbackValid={!errorData["Password"] && 'Looks good!'}
                                                    feedbackInvalid={errorData["Password"]}
                                                    invalid={errorData["Password"] ? true : false}
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
                                                    Resend</CButton>
                                            </CModalFooter>
                                        </CForm>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CModalBody>
                </CModal>
                <CContainer style={{ marginTop: "5%" }}>
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
                                                <h1>
                                                    <span role="img" aria-label="padlock icon">
                                                    🔐
                                                    </span>
                                                    Login
                                                </h1>
                                                {alert !== null && (
                                                    <CAlert color={alert.type} className="alerts">
                                                        {alert.msg}
                                                    </CAlert>
                                                )}
                                                <CForm
                                                    className="row g-3 needs-validation"
                                                    noValidate
                                                    validated={validated}
                                                    onSubmit={handleSubmit}
                                                >
                                                    <div className="col-md-8">
                                                        <label
                                                            htmlFor="validationCustomUsername"
                                                            className="form-label"
                                                        >
                                                            Email
                                                        </label>
                                                        <CFormInput
                                                            className="form-control"
                                                            type="email"
                                                            name="email"
                                                            feedbackValid="Looks good"
                                                            feedbackInvalid={errorData["Email"]}
                                                            id="validationCustomUsername"
                                                            required
                                                            onChange={onChangeHandler}
                                                        />
                                                    </div>

                                                    <div className="col-md-8">
                                                        <label
                                                            htmlFor="validationCustom01"
                                                            className="form-label"
                                                        >
                                                            Password
                                                        </label>
                                                        <CFormInput
                                                            className="form-control"
                                                            type="password"
                                                            name="password"
                                                            feedbackInvalid={errorData["Password"]}
                                                            id="validationCustom01"
                                                            autoComplete="off"
                                                            required
                                                            onChange={onChangeHandler}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <CButton
                                                            className="btn"
                                                            type="submit"
                                                            color="info"
                                                            style={{
                                                                color: "white",
                                                                backgroundColor: "#FF735C",
                                                                border: "2px solid #FF735C",
                                                                cursor: "pointer",
                                                                marginBottom: "10px",
                                                                boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                                                            }}
                                                            size="lg"
                                                        >
                                                            {loading && (
                                                                <img src={spinner} alt="spinner" width={25} />
                                                            )}
                                                            Login
                                                        </CButton>
                                                    </div>
                                                </CForm>
                                                <Link to="/register">
                                                    <p style={{ textDecoration: "none" }}>
                                                        Don't have an Account ?
                                                    </p>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CCol>
                        <CCol
                            // style={{ border: "4px solid red" }}

                            sm={{ cols: "auto", row: "auto" }}
                            md={{ cols: "auto", row: "auto" }}
                            xs={{ span: true, order: "last" }}
                        >
                            <CImage className="home2" fluid src={homebg} />
                        </CCol>
                    </CRow>
                </CContainer>
            </>
            );
}

            export default Login;
