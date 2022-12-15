import { cilEnvelopeLetter, cilPeople} from "@coreui/icons";
import axios from 'axios'
import CIcon from "@coreui/icons-react";
import {
  CButton,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow,
  CModal, CModalHeader, CModalBody
} from "@coreui/react";
import React, { useContext, useState } from "react";
import UtilsContext from '../../../contexts/Utils/UtilsContext';

function ReadOnly({
  ele,
  // eslint-disable-next-line
  index,
  setDel,
  setConfirmDelname
}) {
  const utilsContext = useContext(UtilsContext);
  const { setEdit } = utilsContext;
  let [visible, setVisible] = useState(null)

  let resendInvite = async (e)=>{
try{
 let id = e.target.id
 let token = JSON.parse(localStorage.getItem("token"));
 let {data} = await axios.get(`/api/admin/team/resend/invite/${id}`, { headers: { "x-auth-token": token.token }})
 setVisible(data.success)
 console.log(data)
}catch(err){
  console.log(err.response.data)
}
  }
  return (
    <CTableRow>
      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
      <CTableDataCell><CIcon icon={cilPeople} size="lg"></CIcon> {ele.firstname}{" "}{ele.lastname}</CTableDataCell>
      <CTableDataCell><CIcon icon={cilEnvelopeLetter} size="lg"></CIcon> {ele.email}</CTableDataCell>
      <CTableDataCell> {ele.userstatus === "active" ? "🟢 Active" : (ele.userstatus === "suspended" ? "🔴 Suspended" : "🟡 Pending")} </CTableDataCell>
      <CTableDataCell>
        <CButton
          style={{
            color: "white",
            backgroundColor: "#0066cc",
            border: "2px solid #0066cc",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }} onClick={() => setEdit(ele._id)}>
          Edit Admin
        </CButton>

        <CButton
          style={{
            color: "white",
            backgroundColor: "#e8000d",
            border: "2px solid #e8000d ",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }}
          onClick={() => {
            setDel(true);
            setConfirmDelname(`${ele._id}-${ele.email}-Delete`);
          }}
        >
          Delete 
        </CButton>

        <CButton
          style={{
            color: "white",
            backgroundColor: "#ff4f00",
            border: "2px solid #ff4f00 ",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }}
          onClick={() => {
            setDel(true);
            setConfirmDelname(`${ele._id}-${ele.email}-Suspend`);
          }}
        >
          Suspend
        </CButton>
        <CButton
          style={{
            color: "white",
            backgroundColor: "#cb4154",
            border: "2px solid #cb4154",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }}
           id = {ele._id}
           onClick={resendInvite}
           >
          Resend Invite
        </CButton>
        <CButton
          style={{
            color: "white",
            backgroundColor: "#32cd32",
            border: "2px solid #32cd32 ",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }}
          onClick={() => {
            setDel(true);
            setConfirmDelname(`${ele._id}-${ele.email}-Activate`);
          }}
        >
          Activate
        </CButton>

      </CTableDataCell>
      <CModal visible={visible ? true : false} onClose={() => setVisible(false)}>
                            <CModalHeader onClose={() => setVisible(false)}>
                            </CModalHeader>
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