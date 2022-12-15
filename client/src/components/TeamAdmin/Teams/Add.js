import React, { useState, useContext } from 'react'
import axios from 'axios';
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

import TeamContext from "../../../contexts/Team/TeamContext";
import UtilsContext from '../../../contexts/Utils/UtilsContext';

function Add({ project_id }) {
  const utilsContext = useContext(UtilsContext);
  const teamContext = useContext(TeamContext)

  const { alert, showAlert, setLoading, loading, removeLoading, errorData, setErrorData, visible, setVisible } = utilsContext;
  const { getTeams } = teamContext

  const [validated, setValidated] = useState(false);
  const [userData, setuserData] = useState({
    teamName: ''
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
      let { data } = await axios.post(`/api/team/project/${project_id}/team`, userData, { headers: { "x-auth-token": token.token } });
      removeLoading();
      showAlert({
        type: "success",
        msg: data.success,
      });
      setTimeout(() => {
        setVisible(false)
        getTeams(project_id)
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

  return (
    <CModal visible={visible} onClose={() => setVisible(false)}>
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
                        label="Team Name"
                        name="teamName"
                        value={userData.teamName}
                        onChange={onChangeHandler}
                        id="validationCustom01"
                        feedbackValid={!errorData["Team"] && 'Looks good!'}
                        feedbackInvalid={errorData["Team"]}
                        invalid={errorData["Team"] ? true : false}
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
                        Add Team</CButton>
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

export default Add