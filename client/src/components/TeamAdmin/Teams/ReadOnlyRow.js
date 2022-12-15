import React, { useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { cilPeople } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
  CButton,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow,
} from "@coreui/react";

import UtilsContext from '../../../contexts/Utils/UtilsContext';
import TeamContext from "../../../contexts/Team/TeamContext";

function ReadOnly({ ele, index, project_id }) {
  const teamContext = useContext(TeamContext)
  const utilsContext = useContext(UtilsContext);

  const { getTeams } = teamContext
  const { setEdit } = utilsContext;

  const deleteRow = async (e) => {
    try {
      let token = JSON.parse(localStorage.getItem("token"));
      await axios.delete(`/api/team/project/${project_id}/team/${e.target.id}`, { headers: { "x-auth-token": token.token } });
      getTeams(project_id)
    } catch (err) {
      console.log(err.response.data)
    }
  }

  return (
    <CTableRow>
      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
      <CTableDataCell><CIcon icon={cilPeople} size="lg"></CIcon> {ele.teamName}</CTableDataCell>
      <CTableDataCell>
        <Link to={`/team/projects/teams/${project_id}/members/${ele._id}`}>
          <CButton style={{
            color: "white",
            backgroundColor: "#2FB85D",
            border: "2px solid #2FB85D",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }}> View Members
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
          }} onClick={() => setEdit(ele._id)}>
          Edit Team
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
          id={ele._id}
          onClick={deleteRow}
        >
          Delete Team
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
}

export default ReadOnly;