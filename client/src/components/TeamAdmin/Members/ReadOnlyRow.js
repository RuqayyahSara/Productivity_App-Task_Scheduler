import React, { useContext, useState} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  CButton,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow, CModal, CModalHeader, CModalBody
} from "@coreui/react";

import UtilsContext from '../../../contexts/Utils/UtilsContext';
import TeamContext from "../../../contexts/Team/TeamContext";

function ReadOnly({ ele, index, project_id, team_id }) {
  const teamContext = useContext(TeamContext)
  const utilsContext = useContext(UtilsContext);

  const { getMembers } = teamContext
  const { setEdit } = utilsContext;
  let [visible, setVisible] = useState(null)

  const deleteRow = async (e) => {
    try {
      let token = JSON.parse(localStorage.getItem("token"));
      await axios.delete(`/api/team/project/${project_id}/team/${team_id}/member/${e.target.id}`, { headers: { "x-auth-token": token.token } });
      getMembers(project_id, team_id)
    } catch (err) {
      console.log(err.response.data)
    }
  }

  // let resendInvite = async (e)=>{
  //   try{
  //    let id = e.target.id
  //    let token = JSON.parse(localStorage.getItem("token"));
  //    let {data} = await axios.post(`/api/team/project/${project_id}/team/${team_id}/member/${id}/resend/invite/email`, { headers: { "x-auth-token": token.token }})
  //    setVisible(data.success)
  //    console.log(data)
  //   }catch(err){
  //     console.log(err.response.data)
  //   }
  //     }

  return (
    <CTableRow>
      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
      <CTableHeaderCell scope="row">{ele.member.fullname}</CTableHeaderCell>
      <CTableHeaderCell scope="row">{ele.member.email}</CTableHeaderCell>
      <CTableDataCell scope="row"> {ele.member.phone}</CTableDataCell>
      <CTableDataCell scope="row"> {ele.member.userstatus === "active" ? "🟢 Active" : "🟡 Pending"}</CTableDataCell>
      <CTableDataCell>
        <Link to={`/team/projects/teams/${project_id}/members/${team_id}/tasks/${ele.member._id}`}>
          <CButton style={{
            color: "white",
            backgroundColor: "#2FB85D",
            border: "2px solid #2FB85D",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }}> View Tasks
          </CButton>
        </Link>
        <CButton
          style={{
            color: "white",
            backgroundColor: "#3299FE",
            border: "2px solid #3299FE",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }} onClick={() => setEdit(ele.member._id)}>
          Edit Member
        </CButton>
        <CButton
          style={{
            color: "white",
            backgroundColor: "#E55353",
            border: "2px solid #E55353 ",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }}
          id={ele.member._id}
          onClick={deleteRow}
        >
          Delete Member
        </CButton>

        {/* <CButton
          style={{
            color: "white",
            backgroundColor: "#cb4154",
            border: "2px solid #cb4154",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }}
           id = {ele.member._id}
           onClick={resendInvite}
           >
          Resend Invite
        </CButton> */}

      </CTableDataCell>
      <CModal visible={visible ? true : false} onClose={() => setVisible(false)}>
           <CModalHeader onClose={() => setVisible(false)}> </CModalHeader>
                 <CModalBody>
                   <center>
                    {visible}
                  </center>
         </CModalBody>
      </CModal>
    </CTableRow>
  );
}

export default ReadOnly;
