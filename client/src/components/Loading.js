import React from "react";
import loading from "../components/assets/loading.gif";

function Loading() {
  return (
    <>
      <center>
        <img src={loading} alt="Loading.." style={{ marginTop: "170px" }} />
      </center>
    </>
  );
}

export default Loading;
