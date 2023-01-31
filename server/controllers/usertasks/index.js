import express from "express";
const router = express.Router();
import axios from "axios";
// DB Models
import UserTasks from "../../models/UserTasks/index.js";
import Users from "../../models/Users/index.js";
import config from "config";
import {
    sendEmail,
    sendSMS,
} from "../../utils/index.js";

import {
    scheduleTaskValidatorRules,
    editScheduleTaskValidatorRules,
    errorMiddleware
} from "../../middlewares/validations/index.js";

import { authMiddleware, msAuthMiddleware } from "../../middlewares/auth/index.js";
import { scheduleJob, cancelJob, scheduledJobs } from "node-schedule";

/*
    API End Point : /api/user/task
    Method : POST
    Access Type : Private
    Validations:
       Task Name should not be empty 
        Deadline can’t be an Invalid Timestamp and can’t be backdated, it can not be within 30 mins and can’t be more than 30 days from current time. 
        Reminders cannot be more than three elements for freemium users, they can’t be an Invalid Timestamps and no two reminders can have a difference of less than 5 minutes and reminder can’t be after deadline

    Description: Schedule Task


*/

router.post(
    "/",
    authMiddleware,
    scheduleTaskValidatorRules(),
    errorMiddleware,
    async (req, res) => {
        try {
            const payload = req.payload;

            //Finding taskData from Payload
            const taskData = await UserTasks.findOne({ user: payload._id }).populate("user");

            //If No taskData return Invalid User
            if (!taskData) return res.status(401).json({ error: "Unauthorised Access" });

            //Destructuring The Data from req.body
            let { task, deadline, reminders, notificationType } = req.body;

	    //Sorting Reminders Array in Ascending Order
            reminders.sort(function (a, b) {
                return new Date(a) - new Date(b);
            });

            if ((taskData.user.credits[`${notificationType}`] <= 0) ||
                (notificationType === "both" &&
                    (taskData.user.credits.sms <= 0 || taskData.user.credits.email <= 0))) {
                return res.status(400).json({ error: `Not enough credits for ${notificationType}. Recharge the wallet.` });
            }
            // //Pushing the Data to tasks Subdocument
            taskData.tasks.push({ task, deadline, reminders, notificationType });
            let msPayload = {};
            msPayload.taskdata = taskData.tasks[taskData.tasks.length - 1];
            msPayload.userdata = {
                uid: payload._id,
                firstname: taskData.user.firstname,
                email: taskData.user.email,
                phone: taskData.user.phone
            }

            // //Saving in MongoDB
            await taskData.save();
            //Success Response
            res
                .status(200)
                .json({
                    success: "Task Added Successfully and Reminders Have been Scheduled accordingly",
                });

            //Trigger MS

            await axios.post(`${config.get("MS_URL")}/newjob`, msPayload);


        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);


/*
    API End Point : /api/user/task/ack
    Method : GET
    Access Type : Private
   
    Description: Ack to Wallet deduction
*/

router.get("/ack", msAuthMiddleware, async (req, res) => {
    try {
        const payload = req.payload;
        if (payload.notificationType == "email")
            await Users.findByIdAndUpdate({ _id: payload.uid }, { $inc: { wallet: -1, 'credits.email': -1 } });
        else if (payload.notificationType == "sms")
            await Users.findByIdAndUpdate({ _id: payload.uid }, { $inc: { wallet: -1, 'credits.sms': -1 } });
        else
            await Users.findByIdAndUpdate({ _id: payload.uid }, { $inc: { wallet: -2, 'credits.sms': -1, 'credits.email': -1 } });

        res.status(200).json({ success: "Task is Ack'ed Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/*
    API End Point : /api/user/task/all
    Method : GET
    Access Type : Private
    Validations:
    Description: Fetch All the tasks

*/
router.get("/all", authMiddleware, async (req, res) => {
    try {
        //Checking Auth Token from Headers
        const payload = req.payload;

        //Finding UserData from Payload
        const taskData = await UserTasks.findOne({ user: payload._id });

        //If No userData return Invalid User
        if (!taskData) return res.status(401).json({ error: "Invalid User" });

        //Giving all tasks as response

        res.status(200).json({ tasks: taskData.tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



/*
    API End Point : /api/user/task/:task_id
    Method : GET
    Access Type : Private
    Validations:
    Valid Task ID
    Description: Fetch a Particular Task with ID

*/

router.get("/:task_id", authMiddleware, async (req, res) => {
    try {
        const payload = req.payload;

        //Finding UserData from Payload
        const taskData = await UserTasks.findOne({ user: payload._id });

        //If No userData return Invalid User
        if (!taskData) return res.status(401).json({ error: "Invalid User" });

        // Querying the task id there in params

        let tasks = taskData.tasks.find((ele) => ele._id == req.params.task_id);

        // In case of id not found

        if (!tasks) return res.status(401).json({ error: "Invalid Task ID !" });

        res.status(200).json({ tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});





/*
    API End Point : /api/user/task/:task_id
    Method : DELETE
    Access Type : Private
    Validations: Valid Task ID
    Description: Delete a particular Task
*/

router.delete("/:task_id", authMiddleware, async (req, res) => {
    try {
        const payload = req.payload;

        //Finding UserData from Payload
        const taskData = await UserTasks.findOne({ user: payload._id }).populate("user", "firstname");

        //If No userData return Invalid User
        if (!taskData) return res.status(401).json({ error: "Invalid User" });
        let matchIndex = taskData.tasks.findIndex(
            (ele) => ele._id == req.params.task_id
        );
        if (matchIndex == -1)
            return res.status(404).json({ error: "Invalid Task ID" });

        let msPayload = {};
        msPayload.taskdata = taskData.tasks[matchIndex];
        msPayload.userdata = {
            firstname: taskData.user.firstname,
        }

        await axios.delete(`${config.get("MS_URL")}/job`,
            { data: { msPayload } });
        taskData.tasks.splice(matchIndex, 1);
        await taskData.save();

        res.status(200).json({ success: "Task is deleted" });
        //The Reason why Response is at Last is Because the Task cannot be Deleted before we Cancelling Jobs
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/*
    API End Point : /api/user/task/:task_id
    Method : PUT
    Access Type : Private
    Validations: Valid Task ID
    Description: Edit a particular Task

*/

router.put(
    "/:task_id",
    authMiddleware,
    async (req, res, next) => {
        try {
            if (req.body.isCompleted == true) {
                const payload = req.payload;

                //Finding UserData from Payload
                const taskData = await UserTasks.findOne({ user: payload._id }).populate("user");

                //If No taskData return Invalid User
                if (!taskData) return res.status(401).json({ error: "Invalid User" });

                let matchIndex = taskData.tasks.findIndex(
                    (ele) => ele._id == req.params.task_id
                );
                if (matchIndex == -1)
                    return res.status(401).json({ error: "Invalid Task ID !" });
                taskData.tasks[matchIndex].isCompleted = true;
                await taskData.save();

                res
                    .status(200)
                    .json({ success: "Your task has been Marked as Completed" });

                let msPayload = {};
                msPayload.taskdata = taskData.tasks[matchIndex];
                msPayload.userdata = {
                    firstname: taskData.user.firstname,
                }

                await axios.delete(`${config.get("MS_URL")}/job`,
                    { data: { msPayload } });
            } else {
                next(); //Move on to the other Middleware
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    editScheduleTaskValidatorRules(),
    errorMiddleware,
    async (req, res) => {
        try {
            //Checking Auth Token from Headers
            const payload = req.payload;

            //Finding UserData from Payload
            const taskData = await UserTasks.findOne({ user: payload._id }).populate("user");

            //If No taskData return Invalid User
            if (!taskData) return res.status(401).json({ error: "Invalid User" });

            let matchIndex = taskData.tasks.findIndex(
                (ele) => ele._id == req.params.task_id
            );
            if (matchIndex == -1)
                return res.status(401).json({ error: "Invalid Task ID !" });

            let task = req.body;
            task._id = req.params.task_id;

            //Sorting Reminders Array in Ascending Order
            task.reminders.sort(function (a, b) {
                return new Date(a) - new Date(b);
            });
            taskData.tasks[matchIndex] = task;


            await taskData.save();

            if ((taskData.user.credits[`${req.body.notificationType}`] <= 0) ||
                (req.body.notificationType === "both" &&
                    (taskData.user.credits.sms <= 0 || taskData.user.credits.email <= 0))) {
                return res.status(400).json({ error: `Not enough credits for ${req.body.notificationType}. Recharge the wallet.` });
            }

            let msPayload = {};
            msPayload.taskdata = taskData.tasks[matchIndex];
            msPayload.userdata = {
                uid: payload._id,
                firstname: taskData.user.firstname,
                email: taskData.user.email,
                phone: taskData.user.phone
            }

            //Success Response
            res
                .status(200)
                .json({
                    success: "Task Added Successfully and Reminders Have been recheduled accordingly",
                });

            //Trigger MS
            await axios.delete(`${config.get("MS_URL")}/job`,
                { data: { msPayload } });

            await axios.post(`${config.get("MS_URL")}/newjob`, msPayload);
            return
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);







export default router;
