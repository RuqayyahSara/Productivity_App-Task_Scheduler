import { Outlet, Navigate } from "react-router-dom";
import React from "react";

function PrivateRoute() {
  let auth = localStorage.getItem("token");
  return auth ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;
