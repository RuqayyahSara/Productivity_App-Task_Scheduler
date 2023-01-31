import express from "express";
import config from "config";
const app = express();
import { scheduleJob, cancelJob, scheduledJobs } from "node-schedule";

import axios from "axios";

import {
    sendEmail,
    sendSMS,
    generateToken
} from "./utils/index.js";


const port = process.env.PORT || config.get("PORT");
app.use(express.json());

app.get("/", (req,res)=>{
res.send("Scheduler Microservice at work!")
})


app.post("/newjob", async (req, res) => {
    try {
        const { taskdata, userdata } = req.body;
        //Storing the Dynamically Created Task_id for Jobs
        let job_id = taskdata._id;
        let reminders = taskdata.reminders;
        //Scheduling Jobs for the Reminders Array
        reminders.forEach((ele, i) => {
            scheduleJob(`${userdata.firstname}_${job_id}_${i}`, ele, async () => {
                if (taskdata.notificationType === "email") {
                    sendEmail({
                        to: userdata.email,
                        subject: `Reminder ${i + 1} for Task - ${taskdata.task}`,
                        body: `<p>Hey ${userdata.firstname},<br> This is the ${i + 1
                            } Reminder to Complete your Task: ${taskdata.task}. Please complete it before the Deadline.</p>`,
                    });
                } else if (taskdata.notificationType === "sms") {
                    sendSMS({
                        body: `Hi ${userdata.firstname}, This is ${i + 1
                            } Reminder for you to Complete the Task : ${taskdata.task}`,
                        phone: userdata.phone
                    });
                } else {
                    sendSMS({
                        body: `Hi ${userdata.firstname}, This is ${i + 1
                            } Reminder for you to Complete the Task : ${taskdata.task}`,
                        phone: userdata.phone
                    });
                    sendEmail({
                        to: userdata.email,
                        subject: `Reminder ${i + 1} for Task - ${taskdata.task}`,
                        body: `<p>Hey ${userdata.firstname},<br> This is the ${i + 1} Reminder to Complete your Task: ${taskdata.task}. Please complete it before the Deadline.</p>`,
                    });
                }
                let header_payload = generateToken({ uid: userdata.uid, notificationType: taskdata.notificationType });
                await axios.get(`${config.get("MAIN_URL")}/api/user/task/ack`, { headers: { "ms-auth-token": header_payload } });

            });
        });
        console.log(scheduledJobs);
        res.json({ success: "All okay" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.delete(
    "/job",
    async (req, res) => {
        try {
            //Destructuring The Data from req.body
            let { taskdata, userdata } = req.body.msPayload;
            taskdata.reminders.forEach((ele, i) => {
                cancelJob(`${userdata.firstname}_${taskdata._id}_${i}`);
            });
            res.status(200).json({ success: "Job is deleted" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

app.get("/jobs", async (req, res) => {
    try {
        res.status(200).json({
            jobs: Object.keys(scheduledJobs)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get("/job/:task_id", async (req, res) => {
    try {
        let jobs = Object.keys(scheduledJobs);
        let foundJobs = jobs.filter((ele) => ele.includes(`${req.params.task_id}`));
        console.log(foundJobs);
        res.status(200).json({ jobs: foundJobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})



app.post("/activate", async (req, res) => {
    try {
        const { id, token, role, invite } = req.body;
        let status = null
        if (role == "team" || role == "member") {
            if (invite)
                status = "active"
            else
                status = "pending"
        }
        else
            status = "active"

        scheduleJob(id, new Date(+new Date() + 15 * 60 * 1000), async () => {
            const { data } = await axios.delete(`${config.get("MAIN_URL")}/api/admin/team/teamadmin/suspend/${id}`,
                { headers: { "x-auth-token": token }, data: { userstatus: status } })
            console.log(data)
        });
        console.log(scheduledJobs);
        res.status(200).json({ success: "All okay" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.listen(port, () => {
    console.log(`Scheduler MicroService is up and running at ${port}`);
});
