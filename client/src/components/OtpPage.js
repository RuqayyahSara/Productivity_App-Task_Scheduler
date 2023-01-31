import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useContext } from "react";
import {
    CButton,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CRow,
    CAlert
} from "@coreui/react";
import UtilsContext from "../contexts/Utils/UtilsContext"

function OtpPage() {
    let navigate = useNavigate();
    const utilsContext = useContext(UtilsContext);

    const { alert, showAlert } = utilsContext;
    const [validated, setValidated] = useState(false);
    const [errorData, setErrorData] = useState({});
    let [otp, setOtp] = useState('')
    let [timer, setTimer] = useState(60)

    const onChangeHandler = (e) => {
        setOtp(e.target.value);
    };

    const submitHandler = async (e) => {
        e.preventDefault()
        try {
            let token = JSON.parse(localStorage.getItem("tokeno"));
            let { data } = await axios.post("/api/verify/otp", { otp }, {
                headers: { "x-otp-token": token.token },
            });
            localStorage.setItem("token", JSON.stringify(data))
            showAlert({
                type: "success",
                msg: 'OTP Verified Successfully. Redirecting...',
            });

            localStorage.removeItem("tokeno")
            setTimeout(() => {
                if (data.role === "user")
                    navigate("/user", { replace: true });
                else if (data.role === "member")
                    navigate("/member/member", { replace: true });
                else if (data.role === "team")
                    navigate("/team", { replace: true });
                else navigate("/admin", { replace: true });
            }, 2000)

        } catch (err) {
            let data,
                datas = {};
            if (err.response.data.error) {
                data = err.response.data.error;

                showAlert({
                    type: "danger",
                    msg: data,
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
            // setTimer(60)
        }
    }

    const resendOtp = async () => {
        try {
            let token = JSON.parse(localStorage.getItem("tokeno"));
            let bodyData = { email: token.email }
            // console.log(bodyData)
            let { data } = await axios.post("/api/resend/otp", bodyData, {
                headers: { "x-otp-token": token.token },
            });
            localStorage.setItem("tokeno", JSON.stringify(data))
            setTimer(60)
            showAlert({
                type: "success",
                msg: 'An OTP has been resent to your phone number successfully',
            });
        } catch (err) {
            if (err.response.data.error)
                showAlert({
                    type: "danger",
                    msg: err.response.data.error,
                });
        }
    }
    useEffect(() => {
        if (timer > 0) {
            setTimeout(() => {
                setTimer(--timer)
            }, 1000)
        }
        // eslint-disable-next-line
    }, [timer]);
    return (
        <CContainer style={{ marginTop: "5%" }}>
            <center>
                <CRow>
                    <CCol
                        sm={{ cols: "auto", row: "auto" }}
                        md={{ cols: "auto", row: "auto" }}
                        xs={{ span: true, order: "last" }}
                    >
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-md-12">
                                    <div className="card mb-4 mx-4">
                                        <div className="card-body p-4">
                                            <h3 style={{ color: "grey" }}>Please Enter the OTP to Verify your Account</h3>
                                            {alert !== null && (

                                                <CAlert color={alert.type} className="alerts" width='500px'>
                                                    {alert.msg}
                                                </CAlert>

                                            )}
                                            <CForm className="row g-3 needs-validation" noValidate validated={validated} onSubmit={submitHandler}>

                                                <CCol md={12}>
                                                    <label>
                                                        A OTP (One Time Password) has been sent to your number
                                                    </label>
                                                    <br /> <br />
                                                    <CFormInput
                                                        style={{ width: '40%' }}
                                                        type="text"
                                                        feedbackValid={!errorData["Otp"] && ''}
                                                        feedbackInvalid={errorData["Otp"]}
                                                        id="validationCustom01"
                                                        invalid={errorData["Otp"] ? true : false}
                                                        autoComplete="on"
                                                        required
                                                        onChange={onChangeHandler}
                                                    />
                                                </CCol>
                                                <CCol xs={12}>
                                                    <CButton color="info" type="submit">
                                                        Validate OTP
                                                    </CButton>
                                                    <br /><br />
                                                    <span style={{ color: 'grey' }}> If you didn't receive OTP in {timer >= 0 ? timer : '0'} secs &nbsp;
                                                        <CButton color="danger" disabled={timer <= 0 ? false : true} size="sm" onClick={resendOtp}>
                                                            Resend
                                                        </CButton>
                                                    </span>
                                                </CCol>
                                            </CForm>


                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CCol>
                </CRow>
            </center>
        </CContainer>
    )
}

export default OtpPage