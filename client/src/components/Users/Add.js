import React, { useState, useContext } from 'react'
import axios from 'axios';
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
    CFormSelect,
    CModalTitle
} from "@coreui/react";

import spinner from "../../Assets/Common/loading.gif";

import TodoContext from "../../contexts/Todos/TodoContext";
import UtilsContext from '../../contexts/Utils/UtilsContext';

function Add() {
    const utilsContext = useContext(UtilsContext);
    const todoContext = useContext(TodoContext)

    const { alert, showAlert, setLoading, loading, removeLoading, errorData, setErrorData, visible, setVisible } = utilsContext;
    const { getTasks } = todoContext

    const [validated, setValidated] = useState(false);
    let [count, setCount] = useState(0)
    let [reminderArray, setReminderArray] = useState([])
    const [userData, setuserData] = useState({
        task: '',
        deadline: '',
        reminders: [],
        notificationType: ''
    });

    const onChangeHandler = (e) => {
        setuserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault()
        try {
            console.log(userData)
            let token = JSON.parse(localStorage.getItem("token"))
            setLoading()
            let { data } = await axios.post("/api/user/task", userData, { headers: { "x-auth-token": token.token } });
            showAlert({
                type: "success",
                msg: data.success
            });
            removeLoading()
            setTimeout(() => {
                setVisible(false)
                getTasks()
            }, 1000)
        } catch (err) {
            removeLoading()
            let data, datas = {}
            console.log(err.response.data)
            if (err.response.data.error) {
                data = err.response.data.error
                showAlert({
                    type: "danger",
                    msg: data
                });
            }
            if (err.response.data.errors) {
                err.response.data.errors.forEach(e => {
                    let key = e.msg.split(" ")[0]
                    datas[key] = e.msg
                })
                setErrorData(datas)
                setTimeout(() => {
                    setErrorData({})
                }, 3000)
                if (datas['Deadline']) {
                    showAlert({
                        type: "danger",
                        msg: datas['Deadline']
                    });
                }
                if (datas['Reminders']) {
                    showAlert({
                        type: "danger",
                        msg: datas['Reminders']
                    });
                }
                if (datas['Cannot']) {
                    showAlert({
                        type: "danger",
                        msg: datas['Cannot']
                    });
                }
            }
            setValidated(true)
        }
    }

    const setCountHandler = async (e) => {
        setCount(e.target.value)
    }

    const onAddHandler = async (e) => {
        let a = []
        let length = +count
        while (length) {
            a.push(length)
            length--
        }
        setReminderArray(a)
        let arr = userData.reminders
        arr.length = count
        setuserData({
            ...userData,
            reminders: arr
        })
    }

    return (
        <CModal visible={visible} onClose={() => setVisible(false)}>
            <CModalHeader onClose={() => setVisible(false)}>
                <CModalTitle>Add Task </CModalTitle>
            </CModalHeader>
            <CModalBody>
                <div className="card-body p-4">
                    <div className="container">
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
                                    label="Task Name"
                                    type="text"
                                    name="task"
                                    onChange={onChangeHandler}
                                    id="validationCustom02"
                                    value={userData.task}
                                    feedbackValid={!errorData["Task"] && ''}
                                    feedbackInvalid={errorData['Task']}
                                    invalid={errorData["Task"] ? true : false}
                                />
                            </CCol>

                            <CCol md={12}>
                                <CFormInput
                                    label="Deadline"
                                    type="datetime-local"
                                    name="deadline"
                                    value={userData.deadline}
                                    feedbackInvalid={errorData['Deadline']}
                                    onChange={onChangeHandler}
                                    id="validationCustom01"
                                    feedbackValid={!errorData["Deadline"] && ''}
                                    invalid={errorData["Deadline"] ? true : false}
                                />
                            </CCol>

                            <div className="col-md-12">
                                <label
                                    htmlFor="validationCustomUsername"
                                    className="form-label"
                                >How many Reminders do you want to Add? </label>
                                <span className="countsDiv">
                                    <CFormInput
                                        className="form-control"
                                        type="number"
                                        name="count"
                                        value={count}
                                        placeholder='optional'
                                        onChange={setCountHandler}
                                        id="validationCustomUsername"
                                    /> &nbsp;&nbsp;
                                    <span> <CButton style={{ backgroundColor: "#ff735c", border: "1px solid #ff735c" }} onClick={onAddHandler}>+</CButton></span>
                                </span>
                            </div>

                            {reminderArray.map((e, i) => (
                                <div className="col-md-8" key={i}>
                                    <label
                                        htmlFor="validationCustomUsername"
                                        className="form-label"
                                    >Add Reminder {i + 1}</label>
                                    <CFormInput
                                        className="form-control"
                                        type="datetime-local"
                                        name="reminders"
                                        value={userData.reminders[i] == null ? '' : userData.reminders[i]}
                                        feedbackInvalid="Cannot leave empty"
                                        id="validationCustomUsername"
                                        onChange={(e) => {
                                            let arr = userData.reminders
                                            arr[i] = e.target.value
                                            setuserData({
                                                ...userData,
                                                reminders: arr
                                            })
                                        }}
                                    />
                                </div>
                            ))}
                            <div className="col-md-12">
                                <CFormSelect
                                    feedbackInvalid={errorData['Notification']}
                                    feedbackValid={!errorData["Notification"] && 'Looks good!'}
                                    invalid={errorData["Notification"] ? true : false}
                                    value={userData.notificationType}
                                    aria-label="select example"
                                    required
                                    onChange={(e) => {
                                        setuserData({ ...userData, notificationType: e.target.value })
                                    }}
                                >
                                    <option value="">
                                        Select Notification Type
                                    </option>
                                    <option value="email">Email</option>
                                    <option value="sms">SMS</option>
                                    <option value="both">Both</option>
                                </CFormSelect>
                            </div>
                            <CModalFooter>
                                <CButton color="secondary" onClick={() => {
                                    setVisible(false)
                                }}> Close </CButton>
                                <CButton color="primary" type='submit'>
                                    {loading && (
                                        <img src={spinner} alt="spinner" width={25} />
                                    )}
                                    Add Task</CButton>
                            </CModalFooter>
                        </CForm>
                    </div>
                </div>
            </CModalBody>
        </CModal>
    )
}

export default Add