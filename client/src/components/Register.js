import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CAlert,
  CButton,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CImage,
  CRow,
} from "@coreui/react";

import Navbar from "./Navbar";
import homebg from "../Assets/Common/homebackground.jpg";
import spinner from "../Assets/Common/loading.gif";

import UtilsContext from "../contexts/Utils/UtilsContext";

function Register() {
  let navigate = useNavigate();
  const utilsContext = useContext(UtilsContext);
  const { alert, showAlert, setLoading, loading, removeLoading, countries, errorData, fetchFlags, setErrorData } = utilsContext;

  const [validated, setValidated] = useState(false);
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    password: "",
    password2: "",
  });

  const onChangeHandler = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading();
      let { data } = await axios.post("/api/register", userData);

      showAlert({
        type: "success",
        msg: data.success,
      });
      removeLoading()
      navigate("/login", { replace: true });
    } catch (err) {
      removeLoading()
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

  useEffect(() => {
    fetchFlags()
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <Navbar />
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
                      <h1>Register</h1>
                      {alert !== null && (
                        <CAlert color={alert.type} className="alerts">
                          {alert.msg}
                        </CAlert>
                      )}
                      <CForm
                        className="row g-3 needs-validation"
                        noValidate
                        validated={validated}
                        onSubmit={submitHandler}
                      >
                        <CCol md={4}>
                          <CFormInput
                            type="text"
                            name="firstname"
                            feedbackValid={!errorData["First"] && 'Looks good!'}
                            feedbackInvalid={errorData["First"]}
                            id="validationCustom01"
                            label="First name"
                            invalid={errorData["First"] ? true : false}
                            required
                            onChange={onChangeHandler}
                          />
                        </CCol>

                        <CCol md={4}>
                          <CFormInput
                            type="text"
                            name="lastname"
                            feedbackValid={!errorData["Last"] && 'Looks good!'}
                            feedbackInvalid={errorData["Last"]}
                            id="validationCustom02"
                            label="Last name"
                            invalid={errorData["Last"] ? true : false}
                            required
                            onChange={onChangeHandler}
                          />
                        </CCol>

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
                            feedbackValid={!errorData["Email"] && 'Looks good!'}
                            feedbackInvalid={errorData["Email"]}
                            id="validationCustomUsername"
                            invalid={errorData["Email"] ? true : false}
                            required
                            onChange={onChangeHandler}
                          />
                        </div>

                        <div className="col-md-8">
                          <label
                            htmlFor="validationCustomUsername"
                            className="form-label"
                          >
                            Phone
                          </label>
                          <CFormInput
                            className="form-control"
                            type="tel"
                            name="phone"
                            feedbackValid={errorData["Phone"] ? true : false}
                            feedbackInvalid={errorData["Phone"]}
                            id="validationCustomUsername"
                            invalid={errorData["Phone"] ? true : false}
                            required
                            onChange={onChangeHandler}
                          />
                        </div>

                        <div className="col-md-8">
                          <label
                            className="form-label"
                          >
                            Country
                          </label>
                          <CFormSelect
                            feedbackInvalid={errorData['Country']}
                            aria-label="select Country"
                            required
                            onChange={(e) => {
                              setUserData({ ...userData, country: e.target.value })
                            }}
                          >
                            <option value="">
                              Select Country
                            </option>
                            {
                              Object.keys(countries).map((e, i) => (
                                <option key={i} value={e}>{e}</option>
                              ))
                            }
                          </CFormSelect>
                        </div>

                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            name="address"
                            label="Address"
                            feedbackValid='optional'
                            onChange={onChangeHandler}
                          />
                        </CCol>

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
                            name="password"
                            feedbackInvalid={errorData["Password"]}
                            id="validationCustom04"
                            autoComplete="off"
                            invalid={errorData["Password"] ? true : false}
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
                            name="password2"
                            feedbackInvalid={errorData["Password,"]}
                            autoComplete="off"
                            id="validationCustom03"
                            invalid={errorData["Password,"] ? true : false}
                            required
                            onChange={onChangeHandler}
                          />
                        </div>

                        <CCol xs={12}>
                          <CButton color="primary" type="submit">
                            {loading && (
                              <img src={spinner} alt="spinner" width={25} />
                            )}
                            Create Account
                          </CButton>
                        </CCol>
                      </CForm>

                      <Link to="/login">
                        <p style={{ textDecoration: "none", marginTop: "10px" }}>
                          Already Have an Account ?
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CCol>
          <CCol
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

export default Register;
