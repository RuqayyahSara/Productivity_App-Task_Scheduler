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
import TeamContext from '../../../contexts/Team/TeamContext';
function Edit({ project_id, team_id }) {
  const utilsContext = useContext(UtilsContext);
  const teamContext = useContext(TeamContext)
  const { alert, showAlert, setLoading, loading, removeLoading, errorData, setErrorData, edit, setEdit } = utilsContext;
  const { getMembers, getMember, setMember, member } = teamContext

  const [validated, setValidated] = useState(false);
  const [userData, setuserData] = useState({
    fullname: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (!member)
      getMember(project_id, team_id, edit)
    else
      setuserData({
        fullname: member.fullname,
        email: member.email,
        phone: member.phone,
      })
      // eslint-disable-next-line
  }, [member])

  const submitHandler = async (e) => {
    try {
      e.preventDefault();
      setLoading();
      let token = JSON.parse(localStorage.getItem("token"));
      let { data } = await axios.put(`/api/team/project/${project_id}/team/${team_id}/member/${edit}`, userData, { headers: { "x-auth-token": token.token } });

      removeLoading();
      showAlert({
        type: "success",
        msg: data.success
      });
      setTimeout(() => {
        setEdit(false)
        setMember(null)
        getMembers(project_id, team_id)
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

  const onChangeHandler = (e) => {
    setuserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <CModal visible={edit ? true : false} onClose={() => setEdit(false)}>
      <CModalHeader onClose={() => setEdit(false)}>
        <CModalTitle>Edit Member </CModalTitle> <br />
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
                    <CCol md={12}>
                      <CFormInput
                        type="text"
                        label="Full Name"
                        name="fullname"
                        value={userData.fullname}
                        onChange={onChangeHandler}
                        id="validationCustom01"
                        feedbackValid={!errorData["Fullname"] && ''}
                        feedbackInvalid={errorData["Fullname"]}
                        invalid={errorData["Fullname"] ? true : false}
                      />
                    </CCol>

                    <CCol md={12}>
                      <CFormInput
                        type="text"
                        label="Email Address"
                        name="email"
                        value={userData.email}
                        onChange={onChangeHandler}
                        id="validationCustom01"
                        feedbackValid={!errorData["Email"] && ''}
                        feedbackInvalid={errorData["Email"]}
                        invalid={errorData["Email"] ? true : false}
                      />
                    </CCol>

                    <CCol md={12}>
                      <CFormInput
                        type="text"
                        label="Phone Number"
                        name="phone"
                        value={userData.phone}
                        onChange={onChangeHandler}
                        id="validationCustom01"
                        feedbackValid={!errorData["Phone"] && ''}
                        feedbackInvalid={errorData["Phone"]}
                        invalid={errorData["Phone"] ? true : false}
                      />
                    </CCol>
                    <CModalFooter>
                      <CButton color="secondary" onClick={() => {
                        setEdit(false)
                        setMember(null)
                      }}> Close </CButton>
                      <CButton color="primary" type='submit'>
                        {loading && (
                          <img src={spinner} alt="spinner" width={25} />
                        )}
                        Update</CButton>
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

export default Edit