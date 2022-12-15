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
function Edit({ project_id }) {
  const utilsContext = useContext(UtilsContext);
  const teamContext = useContext(TeamContext)
  const { alert, showAlert, setLoading, loading, removeLoading, errorData, setErrorData, edit, setEdit } = utilsContext;
  const { getTeams, getTeam, setTeam, team } = teamContext

  const [validated, setValidated] = useState(false);
  const [userData, setuserData] = useState({
    teamName: ''
  });

  useEffect(() => {
    if (!team)
      getTeam(project_id, edit)
    else
      setuserData({
        teamName: team.teamName,
      })
      // eslint-disable-next-line
  }, [team])

  const submitHandler = async (e) => {
    try {
      e.preventDefault();
      setLoading();
      let token = JSON.parse(localStorage.getItem("token"));
      let { data } = await axios.put(`/api/team/project/${project_id}/team/${edit}`, userData, { headers: { "x-auth-token": token.token } });

      removeLoading();
      showAlert({
        type: "success",
        msg: data.success
      });
      setTimeout(() => {
        setEdit(false)
        setTeam(null)
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

  const onChangeHandler = (e) => {
    setuserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <CModal visible={edit ? true : false} onClose={() => setEdit(false)}>
      <CModalHeader onClose={() => setEdit(false)}>
        <CModalTitle>Edit Team </CModalTitle> <br />
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
                        name="teamName"
                        label="Team Name"
                        value={userData.teamName}
                        id="validationCustom01"
                        required
                        feedbackValid={!errorData["Team"] && 'Looks good!'}
                        feedbackInvalid={errorData["Team"]}
                        invalid={errorData["Team"] ? true : false}
                        onChange={onChangeHandler}
                      />
                    </CCol>
                    <CModalFooter>
                      <CButton color="secondary" onClick={() => {
                        setEdit(false)
                        setTeam(null)
                      }}> Close </CButton>
                      <CButton color="primary" type='submit'>
                        {loading && (
                          <img src={spinner} alt="spinner" width={25} />
                        )}
                        Update Team</CButton>
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