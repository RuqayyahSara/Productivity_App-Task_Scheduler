import React, { useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom';
import AdminContext from '../contexts/Admin/AdminContext';
import AuthContext from '../contexts/Auth/AuthContext';
import UtilsContext from '../contexts/Utils/UtilsContext';
import Loading from "./Loading"

import { CContainer } from "@coreui/react";
import {
    CHeader,
    CHeaderBrand
} from "@coreui/react";

function UserProfile(id) {
    const { role } = useParams(id)
    let adminContext = useContext(AdminContext)
    let authContext = useContext(AuthContext)
    let utilsContext = useContext(UtilsContext)

    const { authUser, isAuth } = authContext
    const { getUserProfile, user } = adminContext
    const { loading, setLoading, removeLoading } = utilsContext

    useEffect(() => {
        setLoading()
        if (!isAuth)
            authUser(role)
        else {
            getUserProfile(isAuth._id)
            removeLoading()
        }
        // eslint-disable-next-line
    }, [isAuth]);

    return (
        <>
            <CHeader>
                <CContainer fluid>
                    <CHeaderBrand >User Profile</CHeaderBrand>
                </CContainer>
            </CHeader>

            {loading ? <Loading /> : (<div style={{ marginTop: "50px", marginLeft: "50px", marginRight: "100px" }}>
                <h1>{user && user.firstname} {user && user.lastname}</h1> <br />
                <span style={{ color: "#36454f", display: "inline-flex" }}><h5> Email &nbsp;</h5></span>
                <span style={{ color: "#36454f", display: "inline-flex" }}> {user && user.email}</span> <br />

                <hr />
                <span style={{ color: "#36454f", display: "inline-flex" }}><h5> Phone &nbsp;</h5></span>
                <span style={{ color: "#36454f", display: "inline-flex" }}> {user && user.phone}</span> <br />

                <hr />
                <span style={{ color: "#36454f", display: "inline-flex" }}><h5> Country &nbsp;</h5></span>
                <span style={{ color: "#36454f", display: "inline-flex" }}> {user && user.country}</span> <br />

                {/* <hr />
                <span style={{ color: "#36454f", display: "inline-flex" }}><h5> Address &nbsp;</h5></span>
                <span style={{ color: "#36454f", display: "inline-flex" }}> {user.address ? user.address : 'Nil'}</span> <br /> */}

                <hr />
                <span style={{ color: "#36454f", display: "inline-flex" }}><h5> User Type &nbsp;</h5></span>
                <span style={{ color: "#36454f", display: "inline-flex" }}> {user && user.usertype}</span> <br />
                <hr />
                <span style={{ color: "#36454f", display: "inline-flex" }}><h5> Plan Type &nbsp;</h5></span>
                <span style={{ color: "#36454f", display: "inline-flex" }}> {user && user.plantype}</span> <br />

                <hr />
                <span style={{ color: "#36454f", display: "inline-flex" }}><h5> User Status &nbsp;</h5></span>
                <span style={{ color: "#36454f", display: "inline-flex" }}> 🟢 {user && user.userstatus}</span> <br />

                <hr />
                <span style={{ color: "#36454f", display: "inline-flex" }}><h5> Credits &nbsp;</h5></span>
                <div style={{ color: "#36454f" }}> <b>Wallet - &nbsp;</b> {user && user.wallet}</div>
                <div style={{ color: "#36454f" }}> <b>Email - &nbsp;</b> {user && user.credits.email}</div>
                <div style={{ color: "#36454f" }}> <b>Phone - &nbsp;</b> {user && user.credits.sms}</div>

                <hr />
                <span style={{ color: "#36454f", display: "inline-flex" }}><h5> Account Created On &nbsp;</h5></span>
                <span style={{ color: "#36454f", display: "inline-flex" }}> {user && new Date(user.createdAt).toLocaleDateString()}</span> <br />
                <hr />
            </div>)}
        </>
    )
}

export default UserProfile