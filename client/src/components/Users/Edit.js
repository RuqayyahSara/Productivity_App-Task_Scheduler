import React, { useState, useContext, useEffect } from 'react'
import axios from "axios"
import {
    CAlert,
    CButton,
    CCol,
    CForm,
    CFormSelect,
    CFormInput,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle
} from "@coreui/react";
import spinner from "../../Assets/Common/loading.gif";
import UtilsContext from '../../contexts/Utils/UtilsContext';
import TodoContext from "../../contexts/Todos/TodoContext";
function EditTask() {

    const utilsContext = useContext(UtilsContext);
    const todoContext = useContext(TodoContext)
    const { alert, showAlert, setLoad, load, removeLoad, errorData, setErrorData, edit, setEdit } = utilsContext;
    const { getTasks, task, setTask, getTask } = todoContext

    const [validated, setValidated] = useState(false);
    const [userData, setuserData] = useState({
        task: '',
        deadline: '',
        reminders: [],
        notificationType: '',
        isCompleted: false
    });

    useEffect(() => {
        if (!task)
            getTask(edit)
        else {
            setuserData({
                task: task.task,
                deadline: task.deadline,
                reminders: task.reminders,
                notificationType: task.notificationType,
                isCompleted: task.isCompleted,
            })
        }
        // eslint-disable-next-line
    }, [task])

    const onChangeHandler = (e) => {
        setuserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const submitHandler = async (e) => {
        try {
            e.preventDefault();
            userData.isCompleted === 'true' ? userData.isCompleted = true : userData.isCompleted = false
            // console.log(userData)
            setLoad();
            let token = JSON.parse(localStorage.getItem("token"));
            let { data } = await axios.put(`/api/user/task/${edit}`, userData, { headers: { "x-auth-token": token.token } });

            removeLoad();
            showAlert({
                type: "success",
                msg: data.success
            });
            setTimeout(() => {
                setEdit(false)
                setTask(null)
                getTasks()
            }, 1000)
        } catch (err) {
            removeLoad();
            let datas = {};
            console.log(err.response.data)
            if (err.response.data.error) {
                showAlert({
                    type: "danger",
                    msg: err.response.data.error
                });
            }
            if (err.response.data.errors) {
                err.response.data.errors.forEach((e) => {
                    let key = e.msg.split(" ")[0];
                    datas[key] = e.msg;
                });
                setErrorData(datas);

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
            setValidated(true);
        }
    };

    return (
        <CModal visible={edit ? true : false} onClose={() => setEdit(false)}>
            <CModalHeader onClose={() => setEdit(false)}>
                <CModalTitle>Edit Task </CModalTitle> <br />
            </CModalHeader>
            <CModalBody>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-12">
                            <div className="card mb-4 mx-4">
                                <div className="card-body p-4">
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
                                            <label>Completed</label> <br />
                                            <input
                                                type="radio"
                                                name="isCompleted"
                                                value={Boolean(true)}
                                                onChange={onChangeHandler}
                                            /> True &nbsp; &nbsp;
                                            <input
                                                type="radio"
                                                name="isCompleted"
                                                value={Boolean(false)}
                                                onChange={onChangeHandler}
                                            /> False
                                        </CCol>

                                        <CCol md={12}>
                                            <CFormInput
                                                label="Deadline"
                                                type="datetime-local"
                                                name="deadline"
                                                value={userData.deadline && new Date(userData.deadline).toISOString().substring(0, 16)}
                                                feedbackInvalid={errorData['Deadline']}
                                                onChange={onChangeHandler}
                                                id="validationCustom01"
                                                feedbackValid={!errorData["Deadline"] && ''}
                                                invalid={errorData["Deadline"] ? true : false}
                                            />
                                        </CCol>

                                        {task && task.reminders.map((e, i) => (
                                            <div className="col-md-8" key={i}>
                                                <label
                                                    htmlFor="validationCustomUsername"
                                                    className="form-label"
                                                >Add Reminder {i + 1}</label>
                                                <CFormInput
                                                    className="form-control"
                                                    type="datetime-local"
                                                    name="reminders"
                                                    value={e && new Date(e).toISOString().substring(0, 16)}
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
                                                setEdit(false)
                                                setTask(null)
                                            }}> Close </CButton>
                                            <CButton color="primary" type='submit'>
                                                {load && (
                                                    <img src={spinner} alt="spinner" width={25} />
                                                )}
                                                Update</CButton>
                                        </CModalFooter>
                                    </CForm>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CModalBody>
        </CModal>
    )
}

export default EditTask