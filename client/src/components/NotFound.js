import React from "react";
import { CButton, CCol, CContainer, CImage, CRow } from "@coreui/react";
import { Link } from "react-router-dom";

import error404 from "../Assets/Common/error404.gif";
function NotFound() {
  document.body.style = "background: #F4F5F6;";
  return (
    <>
      <CContainer style={{ marginTop: "1%", backgroundColor: "#F4F5F6" }}>
        <CRow>
          <CCol
            // style={{ border: "4px solid red" }}
            sm={{ cols: "auto", row: "auto" }}
            md={{ cols: "auto", row: "auto" }}
            xs={{ span: true, order: "last" }}
          >
            <h1
              className="display-4"
              id="err"
              style={{ width: "350px", textAlign: "center", margin: "4%" }}
            >
              <b>Error 404!! 🤖</b>
            </h1>
            <h1
              className="display-6"
              id="err2"
              style={{ marginLeft: "15px", textAlign: "justify" }}
            >
              Sorry, this page isn't available.
              <br />
              The link you followed may be broken, or the page may have been
              removed
              <span role="img" aria-label="padlock icon"></span>
            </h1>
          </CCol>
          <CCol
            // style={{ border: "4px solid red" }}
            sm={{ cols: "auto", row: "auto" }}
            md={{ cols: "auto", row: "auto" }}
            xs={{ span: true, order: "last" }}
          >
            <CImage
              className="home2"
              style={{ border: "10px solid #F4F5F6" }}
              fluid
              src={error404}
            />
          </CCol>
        </CRow>
        <center>
          <Link to="/login">
            <CButton
              className="btn "
              style={{
                color: "white",
                backgroundColor: "#FF735C",
                border: "2px solid #FF735C",
                margin: "10px",
                cursor: "pointer",
                marginBottom: "30px",
                boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
              }}
              color="info"
              size="lg"
            >
              Home Page
            </CButton>
          </Link>
        </center>
      </CContainer>
    </>
  );
}

export default NotFound;