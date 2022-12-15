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

import UtilsContext from '../../contexts/Utils/UtilsContext';
import TeamContext from "../../contexts/Team/TeamContext";

function ReadOnly({ ele, index
  // eslint-disable-next-line
}) {
  const teamContext = useContext(TeamContext)
  const utilsContext = useContext(UtilsContext);

  const { getTeamProjects } = teamContext
  const { setEdit } = utilsContext;

  const deleteRow = async (e) => {
    try {
      let token = JSON.parse(localStorage.getItem("token"));
      await axios.delete(`api/team/project/${e.target.id}`, { headers: { "x-auth-token": token.token } });
      getTeamProjects()
    } catch (err) {
      console.log(err.response.data)
    }
  }

  return (
    <CTableRow>
      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
      <CTableDataCell><CIcon icon={cilPeople} size="lg"></CIcon> {ele.projectName}</CTableDataCell>
      <CTableDataCell>
        <Link to={`/team/projects/teams/${ele._id}`}>
          <CButton style={{
            color: "white",
            backgroundColor: "#2FB85D",
            border: "2px solid #2FB85D",
            margin: "2px",
            cursor: "pointer",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
          }}> View Teams
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
          Edit Project
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
          Delete Project
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
}

export default ReadOnly;