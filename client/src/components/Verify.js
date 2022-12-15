import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
    CAlert,
} from "@coreui/react";

function Verify(id1, id2) {
    const { token } = useParams(id1)
    const { type } = useParams(id2)
    const [msg, setMsg] = useState(null)

    const verify = async () => {
        try {
            let { data } = await axios.get(`/api/${type}/verify/${token}`)
            setMsg({
                type: "success",
                msg: data.success
            });
        } catch (err) {
            if (err.response.data.error) {
                setMsg({
                    type: "danger",
                    msg: err.response.data.error,
                });
            }
            console.log(err)
        }
    }
    useEffect(() => {
        verify()
        // eslint-disable-next-line
    }, [])
    return (
        <div>
            <center>
                {msg !== null && (
                    <CAlert color={msg.type} className="alerts" style={{ marginTop: "200px" }}>
                        {msg.msg}
                    </CAlert>
                )}
            </center>

        </div>
    )
}

export default Verify