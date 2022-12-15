import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
    CAlert,
} from "@coreui/react";

function Invite(id1, id2, id3, id4, id5) {
    const { token } = useParams(id1)
    const { project_id } = useParams(id2)
    const { team_id } = useParams(id3)
    const { member_id } = useParams(id4)
    const { _id } = useParams(id5)
    
    const [msg, setMsg] = useState(null)

    const invite = async () => {
        try {
            let { data } = await axios.get(`/api/team/project/${project_id}/team/${team_id}/member/invite/${_id}/${token}/${member_id}`)
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
        invite()
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

export default Invite