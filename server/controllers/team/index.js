import express from "express";
import config from "config";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import axios from "axios";
import bcrypt from "bcrypt";

const teamProjects = express.Router();

import authMiddleware from "../../middlewares/auth/verifyToken.js";
import { addProjectRules, addTeamValidatorRules, addMemberValidatorRules, scheduleTaskValidatorRules, editScheduleTaskValidatorRules, errorMiddleware } from "../../middlewares/validations/index.js";
import TeamProjects from "../../models/TeamProjects/index.js";
import {
    randomString,
    sendEmail,
    sendSMS,
    strongPassowordGenerator
} from "../../utils/index.js";
import Admin from "../../models/Admin/index.js";
import Members from "../../models/TeamMember/index.js";
import Users from "../../models/Users/index.js";
import { CustomerProfilesEvaluationsPage } from "twilio/lib/rest/trusthub/v1/customerProfiles/customerProfilesEvaluations.js";
/*
    API --> api/team/project
    Access --> Private
    Method --> POST
    Description --> Manager can add a new project
*/
teamProjects.post("/project", authMiddleware, addProjectRules(), errorMiddleware, async (req, res) => {
    try {
        /*
            Querying the _id from payload in user key in
            TeamProjects Schema
        */
        let userData = await TeamProjects.findOne({ user: req.payload._id });
        if (!userData) return res.status(404).json({ error: `Invalid credentials !` });

        /*
            Pushing the project name inside the
            project array & saving it
        */
        userData.projects.push(req.body);
        await userData.save();

        res.status(200).json({ success: `Project created successfully` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Issue` });
    }
});

/*
    API --> api/team/project/:project_id
    Access --> Private
    Method --> PUT
    Description --> User can only change the project name
                    & in case team is already existing then
                    the array remains as it is
*/
teamProjects.put("/project/:project_id", authMiddleware, addProjectRules(), errorMiddleware, async (req, res) => {
    try {

        /*
            Querying the _id from payload in user key in
            TeamProjects Schema
        */
        let userData = await TeamProjects.findOne({ user: req.payload._id });
        if (!userData) return res.status(404).json({ error: `Invalid credentials !` });

        /*
            Code considering colons
        */
        req.params.project_id = req.params.project_id.split(":");
        req.params.project_id = req.params.project_id[req.params.project_id.length - 1];

        /*
            Finding project_id from params in userData
        */
        let pid = userData.projects.find(id => id._id == req.params.project_id);
        if (!pid) return res.status(404).json({ error: `Invalid project_id !` });

        /*
            Changing the project name
        */
        pid.projectName = req.body.projectName;
        await userData.save();

        res.status(200).json({ success: `Project name changed successfully` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Issue` });
    }
});

/*
    API --> api/team/project/:project_id
    Access --> Private
    Method --> PUT
    Description --> User can only change the project name
                    & in case team is already existing then
                    the array remains as it is
*/
teamProjects.delete("/project/:project_id", authMiddleware, async (req, res) => {
    try {
        /* Querying the _id from payload in user key in TeamProjects Schema*/
        let userData = await TeamProjects.findOne({ user: req.payload._id });
        if (!userData) return res.status(404).json({ error: `Invalid credentials !` });

        let pid = userData.projects.find(id => id._id == req.params.project_id);
        if (!pid) return res.status(404).json({ error: `Invalid project_id !` });

        /* Deleted the project*/
        userData.projects = userData.projects.filter(id => id._id != req.params.project_id);
        await userData.save();

        let arr = []
        pid.teams.forEach(e => {
            let ids = e.members.map(ele => ele.member)
            arr = arr.concat(ids)
        })
        if (arr.length) {
            for (let i = 0; i < arr.length; i++) {
                let memberData = await Members.findById(arr[i])
                let projectIndex = memberData.projects_involved.findIndex(e => e.project_id == req.params.project_id)
                if (projectIndex !== -1)
                    memberData.projects_involved = memberData.projects_involved.filter(e => e.project_id != req.params.project_id);
                await memberData.save();
            }
        }
        res.status(200).json({ success: "Project deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Issue` });
    }
});

/*
    API --> api/team/project/:project_id
    Access --> Private
    Method --> GET
    Description --> User can get project details with project_id
*/
teamProjects.get("/project/:project_id", authMiddleware, async (req, res) => {
    try {

        /*
            Querying the _id from payload in user key in
            TeamProjects Schema
        */
        let userData = await TeamProjects.findOne({ user: req.payload._id });
        if (!userData) return res.status(404).json({ error: `Invalid credentials !` });

        /*
            Code considering colons
        */
        req.params.project_id = req.params.project_id.split(":");
        req.params.project_id = req.params.project_id[req.params.project_id.length - 1];

        /*
            Finding project_id from params in userData
        */
        let projectFound = userData.projects.find(id => id._id == req.params.project_id);
        if (!projectFound) return res.status(404).json({ error: `Invalid project_id !` });

        res.status(200).json({ project: projectFound });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Issue` });
    }
});

/*
    API --> api/team/projects
    Access --> Private
    Method --> GET
    Description --> User can get all project details
*/
teamProjects.get("/projects", authMiddleware, async (req, res) => {
    try {

        /*
            Querying the _id from payload in user key in
            TeamProjects Schema
        */
        let userData = await TeamProjects.findOne({ user: req.payload._id });
        if (!userData) return res.status(404).json({ error: `Invalid credentials !` });

        res.status(200).json({ projects: userData.projects });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Issue` });
    }
});




/*

    API : /api/team/project/:project_id/team
    Access : Private
    Method : GET
    Description : Add Team

*/


teamProjects.post("/project/:project_id/team", authMiddleware, addTeamValidatorRules(), errorMiddleware, async (req, res) => {
    try {
        /*
            Querying the _id from payload in user key in
            TeamProjects Schema
        */
        let userData = await TeamProjects.findOne({ user: req.payload._id });
        if (!userData) return res.status(404).json({ error: `Invalid credentials !` });
        let projectIndex = userData.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        /*
            Pushing the project name inside the
            project array & saving it
        */
        userData.projects[projectIndex].teams.push(req.body);
        await userData.save();
        res.status(200).json({ success: `Team created successfully` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});



/*
    API --> api/team/project/:project_id/team/:team_id
    Access --> Private
    Method --> PUT
    Description --> User can only change the Team name
                    & in case members is already existing then
                    the array remains as it is
*/


teamProjects.put("/project/:project_id/team/:team_id", authMiddleware, addTeamValidatorRules(), errorMiddleware, async (req, res) => {
    try {

        /*
            Querying the _id from payload in user key in
            TeamProjects Schema
        */

        let userData = await TeamProjects.findOne({ user: req.payload._id });
        if (!userData) return res.status(404).json({ error: `Invalid credentials !` });

        let projectIndex = userData.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        let teamIndex = userData.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });
        userData.projects[projectIndex].teams[teamIndex].teamName = req.body.teamName;
        await userData.save();
        res.status(200).json({ success: `Team name changed successfully` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});


/*
    API --> api/team/project/:project_id/team/:team_id
    Access --> Private
    Method --> DELETE
    Description --> The manager can delete an Entire Team
*/
teamProjects.delete("/project/:project_id/team/:team_id", authMiddleware, async (req, res) => {
    try {
        /*
            Querying the _id from payload in user key in
            TeamProjects Schema
        */

        let userData = await TeamProjects.findOne({ user: req.payload._id });
        if (!userData) return res.status(404).json({ error: `Invalid credentials !` });

        let projectIndex = userData.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        let teamIndex = userData.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

        let arr = []
        arr = userData.projects[projectIndex].teams[teamIndex].members.map(e => e.member)

        if (arr.length) {
            for (let i = 0; i < arr.length; i++) {
                let memberData = await Members.findById(arr[i])
                let projectFound = memberData.projects_involved.find(e => e.project_id == req.params.project_id)
                if (projectFound) {
                    if (projectFound.teams.length == 1)
                        memberData.projects_involved = memberData.projects_involved.filter(e => e.project_id != req.params.project_id);
                    else
                        projectFound.teams = projectFound.teams.filter(e => e.team_id != req.params.team_id);
                }
                await memberData.save();
            }
        }

        userData.projects[projectIndex].teams.splice(teamIndex, 1)
        await userData.save();
        res.status(200).json({ success: `Team Deleted Successfully` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});



/*
    API --> api/team/project/:project_id/team/:team_id
    Access --> Private
    Method --> GET
    Description --> The manager can Access a Team by ID
*/
teamProjects.get("/project/:project_id/team/:team_id", authMiddleware, async (req, res) => {
    try {
        /*
            Querying the _id from payload in user key in
            TeamProjects Schema
        */

        let userData = await TeamProjects.findOne({ user: req.payload._id });
        if (!userData) return res.status(404).json({ error: `Invalid credentials !` });

        let projectIndex = userData.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        let teamIndex = userData.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

        //Displaying Team Data
        let team = userData.projects[projectIndex].teams[teamIndex];


        res.status(200).json({ team });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});


/*
    API --> api/team/project/:project_id/teams
    Access --> Private
    Method --> GET
    Description --> The manager can Access all the Teams in the Project
*/
teamProjects.get("/project/:project_id/teams", authMiddleware, async (req, res) => {
    try {

        /*
            Querying the _id from payload in user key in
            TeamProjects Schema
        */

        let userData = await TeamProjects.findOne({ user: req.payload._id });
        if (!userData) return res.status(404).json({ error: `Invalid credentials !` });

        let projectIndex = userData.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });


        //Displaying Team Data
        let teams = userData.projects[projectIndex].teams;
        res.status(200).json({ teams });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});



/*

    API : /api/team/project/:project_id/team/:team_id/member/:member_id/resend/invite/phone
    Access : Public
    Method : POST
    Description : Resend Phone Invite SMS

*/

teamProjects.post("/project/:project_id/team/:team_id/member/:member_id/resend/invite/phone", authMiddleware, async (req, res) => {
    try {

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id }).populate("user");
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectIndex = userFound.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        // Checking if Team ID is valid
        let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

        // Checking if Member ID is valid
        let memberIndex = userFound.projects[projectIndex].teams[teamIndex].members.findIndex((ele) => ele._id == req.params.member_id);
        if (memberIndex == -1) return res.status(401).json({ error: "Invalid Member ID !" });

        // Fetch member details
        let member = userFound.projects[projectIndex].teams[teamIndex].members[memberIndex];

        const tokenPhone = jwt.sign({ phoneToken: member.inviteToken.phone },
            "phoneToken@teams", { expiresIn: "1h" }
        );
        res.status(200).json({ success: `Project Invite SMS has been resent successfully` });

        //Trigger SMS Verification
        sendSMS({
            body: `Hi ${member.fullname}, Please click the given link to accept invitation for the ${userFound.projects[projectIndex].projectName} project from your phone ${config.get(
                "URL")}/api/team/project/${req.params.project_id}/team/${req.params.team_id}/member/phone/invite/${req.payload._id}/${tokenPhone}`,
            phone: member.phone
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});



/*

    API : /api/team/project/:project_id/team/:team_id/member/:member_id/resend/invite/email
    Access : Public
    Method : POST
    Description : Resend email Invite

*/

teamProjects.post("/project/:project_id/team/:team_id/member/:member_id/resend/invite/email", authMiddleware, async (req, res) => {
    try {

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id }).populate("user");
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectIndex = userFound.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        // Checking if Team ID is valid
        let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

        // Checking if Member ID is valid
        let memberIndex = userFound.projects[projectIndex].teams[teamIndex].members.findIndex((ele) => ele._id == req.params.member_id);
        if (memberIndex == -1) return res.status(401).json({ error: "Invalid Member ID !" });

        // Fetch member details
        let member = userFound.projects[projectIndex].teams[teamIndex].members[memberIndex];

        const tokenEmail = jwt.sign({ emailToken: member.inviteToken.email },
            "emailToken@teams", { expiresIn: "1h" }
        );
        res.status(200).json({ success: `Project Invite email has been resent successfully` });

        //Trigger Email Verification
        sendEmail({
            subject: "User Collaborate Invitation - Tasky Solutions M7",
            to: member.email,
            body: `Hi ${member.fullname}<br/>
            ${userFound.user.firstname} has invited you to collaborate on the ${userFound.projects[projectIndex].projectName} project. 
            You can accept or ignore this invitation. Please <a href='${config.get(
                "URL"
            )}/api/team/project/${req.params.project_id}/team/${req.params.team_id}/member/email/invite/${req.payload._id}/${tokenEmail}'>Click Here </a>
            to accept the invitation from your email address. <br/><br/>
            Thank you <br/>
            <b>Team Tasky M7 Solutions.</b>`,
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

/*
    API End Point : /api/team/project/:project_id/team/:team_id/member/email/invite/:user_id/:token
    Method : GET
    Access Type : Public
    Validations:
       Check for Valid Token
    Description: Member Email Invitation Acceptation API

*/
teamProjects.get("/project/:project_id/team/:team_id/member/invite/:user_id/:token/:member_id", async (req, res) => {
    try {
        let { token, user_id, project_id, team_id, member_id } = req.params;
        const emailPayload = jwt.verify(token, "projectToken@member");
        if (!emailPayload)
            return res
                .status(401)
                .json({
                    error: "Link expired. Request to resend a new Email Invitation Acceptation Link",
                });

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: user_id });
        if (!userFound) return res.status(200).json({ error: "Unauthorized Access" });

        let projectIndex = userFound.projects.findIndex((ele) => ele._id == project_id);
        if (projectIndex == -1) return res.status(200).json({ error: "Invalid Project ID" });
        // check if team exists
        let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == team_id);
        if (!teamIndex == -1) return res.status(200).json({ error: "Invalid Team ID" });

        // Check if member exists
        let member = await Members.findById(member_id);
        if (!member) return res.status(200).json({ error: "Unauthorized Access" });

        let projectFound = member.projects_involved.findIndex((ele) => ele.inviteToken == emailPayload.token)
        if (projectFound == -1) return res.status(200).json({ error: "Invalid Project ID" });

        if (member.projects_involved[projectFound].inviteAccepted)
            return res.status(200).json({ success: "Invitation has been accepted already." });

        member.projects_involved[projectFound].inviteAccepted = true;
        
        if (member.userstatus == "pending") {
            member.userstatus = "active"
        }
        if (!member.invite)
            member.invite = true
        await member.save();
        res.status(200).json({ success: "The Invitation has been accepted Successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/*

    API : /api/team/project/:project_id/team/:team_id/member
    Access : Private
    Method : POST
    Description : Add Member

*/

teamProjects.post("/project/:project_id/team/:team_id/member", authMiddleware, addMemberValidatorRules(), errorMiddleware, async (req, res) => {
    try {

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id }).populate("user");
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectIndex = userFound.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        // Checking if Team ID is valid
        let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

        let memberData = await Admin.findOne({ email: req.body.email });
        if (memberData) return res.status(404).json({ error: `User already registered with different role` });

        memberData = await Members.findOne({ email: req.body.email });
        if (!memberData) {
            let member = new Members(req.body);

            let userData = await Users.findOne({ email: req.body.email });
            if (userData) {
                member.fullname = userData.firstname + " " + userData.lastname
                member.phone = userData.phone
                member.password = userData.password
                member.lastLogin = userData.lastLogin
                member.userstatus = userData.userstatus
                member.createdAt = userData.createdAt
                member.userverified.email = userData.userverified.email
                member.userverified.phone = userData.userverified.phone
            }

            else {
                var password = strongPassowordGenerator(8);
                let hashPassword = await bcrypt.hash(password, 12);
                member.password = hashPassword;
                // creating invite tokens
                member.userverifytoken.phone = randomString(16);
                member.userverifytoken.email = randomString(8);
                // jwt expiration invite Tokens
                const tokenEmail = jwt.sign({ emailToken: member.userverifytoken.email },
                    "emailToken@cs", { expiresIn: "1h" }
                );
                const tokenPhone = jwt.sign({ phoneToken: member.userverifytoken.phone },
                    "phoneToken@cs", { expiresIn: "1h" }
                );
                //Trigger Email Verification
                sendEmail({
                    subject: "User Account Verification - Tasky Solutions M7",
                    to: req.body.email,
                    body: `Hi ${req.body.fullname} <br/>
            Thank you for Signing Up. Please <a href='${config.get(
                        "URL"
                    )}/api/email/verify/${tokenEmail}'>Click Here </a>
            to verify your Email Address. <br/><br/>
            Thank you <br/>
            <b>Team Tasky M7 Solutions.</b>`,
                });

                //Trigger SMS Verification
                sendSMS({
                    body: `Hi ${req.body.fullname}, Please click the given link to verify your phone ${config.get("URL")}/api/phone/verify/${tokenPhone}`,
                    phone: req.body.phone,
                });

                // Send credentials
                sendEmail({
                    subject: "Login Credentials of Your Account - Tasky Solutions ",
                    to: req.body.email,
                    body: `Hi ${req.body.fullname}  <br/>
                      Thank you for Signing Up. Your Login Credentials are : <br/>
                      email:${req.body.email} <br/>
                      password:${password} <br/>

                      Please use these Credentials to Login. <br/>
                      make sure you verify your Email and Mobile before Logging in.

                      <br/><br/>
                      Thank you <br/>
                      <b>Team Tasky Solutions.</b>`,
                });

            }

            let token = randomString(8)
            let projects_involved = {
                admin_id: req.payload._id.toString(),
                project_id: req.params.project_id.toString(),
                teams: { team_id: req.params.team_id.toString() },
                inviteToken: token
            }
            member.projects_involved = projects_involved;
            const inviteToken = jwt.sign({ token: token },
                "projectToken@member", { expiresIn: "1h" }
            );
            member.save();
            // Adding members in team Project
            userFound.projects[projectIndex].teams[teamIndex].members.unshift({ member: member._id });

            //Trigger Email Verification
            sendEmail({
                subject: "User Collaborate Invitation - Tasky Solutions M7",
                to: req.body.email,
                body: `Hi ${member.fullname}<br/>
            ${userFound.user.firstname} has invited you to collaborate on the ${userFound.projects[projectIndex].projectName} project. 
            You can accept or ignore this invitation. 
            Please <a href='${config.get("URL")}/api/project/${req.params.project_id}/team/${req.params.team_id}/member/invite/${req.payload._id}/${inviteToken}/${member._id}'>Click Here </a>
            to accept the invitation from your email address. <br/><br/>
            Thank you <br/>
            <b>Team Tasky M7 Solutions.</b>`,
            });
        }
        else {
            // check if project exists in member collection
            let projectFound = memberData.projects_involved.find((ele) => ele.project_id == req.params.project_id);
            if (projectFound) {
                let teamsFound = projectFound.teams.find((ele) => ele == req.params.team_id);
                // check if team exists in member collection
                if (teamsFound)
                    return res.status(409).json({ error: "Member Already Added" });

                // Add team
                projectFound.teams.push({ team_id: req.params.team_id });
            } else {
                // add project and team
                let token = randomString(8)
                memberData.projects_involved.push({
                    admin_id: req.payload._id.toString(),
                    project_id: req.params.project_id.toString(),
                    teams: { team_id: req.params.team_id.toString() },
                    inviteToken: token
                })
                // jwt expiration invite Tokens
                const inviteToken = jwt.sign({ token: token },
                    "projectToken@member", { expiresIn: "1h" }
                );
                //Trigger Email Verification
                sendEmail({
                    subject: "User Collaborate Invitation - Tasky Solutions M7",
                    to: memberData.email,
                    body: `Hi ${memberData.fullname}<br/>
            ${userFound.user.firstname} has invited you to collaborate on the ${userFound.projects[projectIndex].projectName} project. 
            You can accept or ignore this invitation. 
            Please <a href='${config.get("URL")}/api/project/${req.params.project_id}/team/${req.params.team_id}/member/invite/${req.payload._id}/${inviteToken}/${memberData._id}'>Click Here </a>
            to accept the invitation from your email address. <br/><br/>
            Thank you <br/>
            <b>Team Tasky M7 Solutions.</b>`,
                });
            }
            memberData.save();
            userFound.projects[projectIndex].teams[teamIndex].members.unshift({ member: memberData._id });
        }
        await userFound.save();
        res.status(200).json({ success: `Invitation to add member sent successfully` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});



/*

    API : /api/team/project/:project_id/team/:team_id/member/:member_id
    Access : Private
    Method : PUT
    Description : Edit Member

*/
teamProjects.put("/project/:project_id/team/:team_id/member/:member_id", authMiddleware, addMemberValidatorRules(), errorMiddleware, async (req, res) => {
    try {

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id }).populate({
            path: 'projects.teams.members', populate: {
                path: 'member'
            }
        });
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectIndex = userFound.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        // Checking if Team ID is valid
        let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

        // Checking if Member ID is valid
        let memberIndex = userFound.projects[projectIndex].teams[teamIndex].members.findIndex((ele) => ele.member._id == req.params.member_id);
        if (memberIndex == -1) return res.status(401).json({ error: "Invalid Member ID !" });

        // Fetch member details
        let member = userFound.projects[projectIndex].teams[teamIndex].members[memberIndex].member
        if (member.userstatus !== "active")
            return res.status(401).json({ error: "User invitation pending. Please wait for the user to accept the invitation." })

        // Modifying the member in Members collection
        let memberData = await Members.findById(req.params.member_id);
        if (!memberData) return res.status(404).json({ error: `Invalid credentials !` });


        let emailFound = await Members.findOne({ email: req.body.email });
        if (emailFound)
            return res.status(409).json({ error: "User Email Already Registered" });

        memberData.fullname = req.body.fullname;
        memberData.email = req.body.email;
        memberData.phone = req.body.phone;

        await memberData.save();
        res.status(200).json({ success: "Member Edited Successfully" });

        // if email is changed, send new invitation link to the member
        if (memberData.email != req.body.email) {
            memberData.email = req.body.email;
            // jwt expiration invite Token
            const tokenEmail = jwt.sign(
                { emailToken: memberData.userverifytoken.email },
                "emailToken@cs",
                { expiresIn: "1h" }
            );
            // changing invite status to false again
            memberData.userverifytoken.email = false;
            //Trigger Email Verification
            sendEmail({
                subject: "User Account Verification - Tasky Solutions",
                to: memberData.email,
                body: `Hi ${memberData.fullname}  <br/>
                      Thank you for Signing Up. Please <a href='${config.get("URL")}/email/verify/${tokenEmail}'>Click Here </a>
                      to verify your Email Address. <br/><br/>
                      Thank you <br/>
                      <b>Team Tasky Solutions.</b>`,
            });
        }

        // if phone number is changed, send new invitation link to the member
        if (memberData.phone != req.body.phone) {
            memberData.phone = req.body.phone;
            // jwt expiration invite Token
            const tokenPhone = jwt.sign(
                { phoneToken: memberData.userverifytoken.phone },
                "phoneToken@cs",
                { expiresIn: "1h" }
            );
            // changing invite status to false again
            memberData.userverifytoken.phone = false;

            //Trigger SMS Verification
            sendSMS({
                body: `Hi ${memberData.fullname}, Please click the given link to verify your phone ${config.get("URL")}/phone/verify/${tokenPhone}`,
                phone: memberData.phone,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});


/*
    API : /api/team/project/:project_id/team/:team_id/member/:member_id
    Access : Private
    Method : DELETE
    Description : Delete Member

*/
teamProjects.delete("/project/:project_id/team/:team_id/member/:member_id", authMiddleware, async (req, res) => {
    try {
        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id });
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectIndex = userFound.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        // Checking if Team ID is valid
        let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

        // Checking if Member ID is valid
        let memberIndex = userFound.projects[projectIndex].teams[teamIndex].members.findIndex((ele) => ele.member == req.params.member_id);
        if (memberIndex == -1) return res.status(401).json({ error: "Invalid Member ID !" });

        // Delete Member from Team projects
        userFound.projects[projectIndex].teams[teamIndex].members.splice(memberIndex, 1)
        await userFound.save();


        // Delete project from the members collection
        let memberData = await Members.findById(req.params.member_id);
        if (!memberData) return res.status(404).json({ error: `Invalid credentials !` });
        // Checking if Project ID is valid
        let projectFound = memberData.projects_involved.findIndex((ele) => ele.project_id == req.params.project_id);
        if (projectFound == -1) return res.status(404).json({ error: "Invalid Project ID" });
        // Checking if Team ID is valid
        let teamsFound = memberData.projects_involved[projectFound].teams.findIndex((ele) => ele.team_id == req.params.team_id);
        if (teamsFound == -1) return res.status(404).json({ error: "Invalid Team ID" });

        if (memberData.projects_involved[projectFound].teams.length == 1)
            memberData.projects_involved.splice(projectFound, 1)
        else
            memberData.projects_involved[projectFound].teams.splice(teamsFound, 1);
        await memberData.save();
        res.status(200).json({ success: `Member Deleted Successfully` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});



/*
    API --> api/team/project/:project_id/team/:team_id/member/:member_id
    Access --> Private
    Method --> GET
    Description --> The manager can Access a member in the Team
*/
teamProjects.get("/project/:project_id/team/:team_id/member/:member_id", authMiddleware, async (req, res) => {
    try {

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id }).populate({
            path: 'projects.teams.members',
            populate: {
                path: 'member'
            },
            // select : '-__v'
        })
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectIndex = userFound.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        // Checking if Team ID is valid
        let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

        // Checking if Member ID is valid
        let memberIndex = userFound.projects[projectIndex].teams[teamIndex].members.findIndex((ele) => ele.member._id == req.params.member_id);
        if (memberIndex == -1) return res.status(401).json({ error: "Invalid Member ID !" });

        //Displaying Members Data
        let member = userFound.projects[projectIndex].teams[teamIndex].members[memberIndex].member
        member.password = undefined
        member.passwordresettoken = undefined
        res.status(200).json({ member });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});



/*
    API --> api/team/project/:project_id/team/:team_id/members
    Access --> Private
    Method --> GET
    Description --> The manager can Access all the members in the Team
*/
teamProjects.get("/project/:project_id/team/:team_id/members", authMiddleware, async (req, res) => {
    try {

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id }).populate({
            path: 'projects.teams.members',
            populate: {
                path: 'member'
            },
            // select : '-__v'
        })
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectIndex = userFound.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        // Checking if Team ID is valid
        let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

        //Displaying Members Data
        let members = userFound.projects[projectIndex].teams[teamIndex].members;
        res.status(200).json({ members });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});




/*

    API : /api/team/project/:project_id/team/:team_id/member/:member_id/task
    Access : Private
    Method : POST
    Description : Add Task

*/

teamProjects.post("/project/:project_id/team/:team_id/member/:member_id/task", authMiddleware, scheduleTaskValidatorRules(), errorMiddleware, async (req, res) => {
    try {

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id }).populate("user");
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectIndex = userFound.projects.findIndex((ele) => ele._id == req.params.project_id);
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        // Checking if Team ID is valid
        let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
        if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

        // Checking if Member ID is valid
        let memberIndex = userFound.projects[projectIndex].teams[teamIndex].members.findIndex((ele) => ele.member._id == req.params.member_id);
        if (memberIndex == -1) return res.status(401).json({ error: "Invalid Member ID !" });

        // checking project from the members collection
        let memberData = await Members.findById(req.params.member_id);
        if (!memberData) return res.status(404).json({ error: `Invalid credentials !` });
        // Checking if Project ID is valid
        let projectFound = memberData.projects_involved.findIndex((ele) => ele.project_id == req.params.project_id);
        if (projectFound == -1) return res.status(404).json({ error: "Invalid Project ID" });

        if (!memberData.projects_involved[projectFound].inviteAccepted)
            return res.status(401).json({ error: "User invitation pending. Please wait for the user to accept the invitation." })

        // Checking if Team ID is valid
        let teamsFound = memberData.projects_involved[projectFound].teams.findIndex((ele) => ele.team_id == req.params.team_id);
        if (teamsFound == -1) return res.status(404).json({ error: "Invalid Team ID" });

        //Destructuring the Data from req.body
        let { task, deadline, reminders, notificationType } = req.body;

        if ((userFound.user.credits[`${notificationType}`] <= 0) ||
            (notificationType === "both" &&
                (userFound.user.credits.sms <= 0 || userFound.user.credits.email <= 0))) {
            return res.status(400).json({ error: `Not enough credits for ${notificationType}. Recharge the wallet.` });
        }

        //Sorting Reminders Array in Ascending Order
        reminders.sort(function (a, b) {
            return new Date(a) - new Date(b);
        });

        memberData.projects_involved[projectFound].teams[teamsFound].tasks.push({ task, deadline, reminders, notificationType });

        let msPayload = {};

        let msMember = memberData.projects_involved[projectFound].teams[teamsFound];
        // console.log(memberData.projects_involved[projectFound].teams[teamsFound]);
        msPayload.taskdata = msMember.tasks[msMember.tasks.length - 1];
        msPayload.userdata = {
            uid: req.payload._id,
            firstname: userFound.user.firstname,
            email: userFound.user.email,
            phone: userFound.user.phone
        }
        //Saving Data to the DB
        await memberData.save();
        res.status(200).json({ success: `Task Added Successfully and Reminders Have been Scheduled accordingly` });
        await axios.post(`${config.get("MS_URL")}/newjob`, msPayload);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});




/*

    API : /api/team/project/:project_id/team/:team_id/member/:member_id/task/:task_id
    Access : Private
    Method : POST
    Description : Edit Task

*/

teamProjects.put("/project/:project_id/team/:team_id/member/:member_id/task/:task_id", authMiddleware,
    async (req, res, next) => {
        try {
            if (req.body.isCompleted == true) {

                // Checking if team Manager exists
                let userFound = await TeamProjects.findOne({ user: req.payload._id }).populate("user");
                if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

                // Checking if Project ID is valid
                let projectIndex = userFound.projects.findIndex((ele) => ele._id == req.params.project_id);
                if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

                // Checking if Team ID is valid
                let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
                if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

                // Checking if Member ID is valid
                let memberIndex = userFound.projects[projectIndex].teams[teamIndex].members.findIndex((ele) => ele.member._id == req.params.member_id);
                if (memberIndex == -1) return res.status(401).json({ error: "Invalid Member ID !" });


                // checking project from the members collection
                let memberData = await Members.findById(req.params.member_id);
                if (!memberData) return res.status(404).json({ error: `Invalid credentials !` });

                // Checking if Project ID is valid
                let projectFound = memberData.projects_involved.findIndex((ele) => ele.project_id == req.params.project_id);
                if (projectFound == -1) return res.status(404).json({ error: "Invalid Project ID" });
                // Checking if Team ID is valid
                let teamsFound = memberData.projects_involved[projectFound].teams.findIndex((ele) => ele.team_id == req.params.team_id);
                if (teamsFound == -1) return res.status(404).json({ error: "Invalid Team ID" });

                let taskIndex = memberData.projects_involved[projectFound].teams[teamsFound].tasks.findIndex((ele) => ele._id == req.params.task_id);
                if (taskIndex == -1) return res.status(401).json({ error: "Invalid Task ID !" });

                memberData.projects_involved[projectFound].teams[teamsFound].tasks[taskIndex].isCompleted = true;
                await memberData.save();
                res.status(200).json({ success: "Your task has been Marked as Completed" });

                let msMember = memberData.projects_involved[projectFound].teams[teamsFound];

                let msPayload = {};
                msPayload.taskdata = msMember.tasks[taskIndex];
                msPayload.userdata = {
                    firstname: userFound.user.firstname,
                }
                await axios.delete(`${config.get("MS_URL")}/job`, { data: { msPayload } });
            } else {
                next(); //Move on to the other Middleware
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    editScheduleTaskValidatorRules(), errorMiddleware, async (req, res) => {
        try {

            // Checking if team Manager exists
            let userFound = await TeamProjects.findOne({ user: req.payload._id }).populate("user");
            if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

            // Checking if Project ID is valid
            let projectIndex = userFound.projects.findIndex((ele) => ele._id == req.params.project_id);
            if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

            // Checking if Team ID is valid
            let teamIndex = userFound.projects[projectIndex].teams.findIndex((ele) => ele._id == req.params.team_id);
            if (teamIndex == -1) return res.status(401).json({ error: "Invalid Team ID !" });

            // Checking if Member ID is valid
            let memberIndex = userFound.projects[projectIndex].teams[teamIndex].members.findIndex((ele) => ele.member._id == req.params.member_id);
            if (memberIndex == -1) return res.status(401).json({ error: "Invalid Member ID !" });

            if ((userFound.user.credits[`${req.body.notificationType}`] <= 0) ||
                (req.body.notificationType === "both" &&
                    (userFound.user.credits.sms <= 0 || userFound.user.credits.email <= 0))) {
                return res.status(400).json({ error: `Not enough credits for ${req.body.notificationType}. Recharge the wallet.` });
            }


            // checking project from the members collection
            let memberData = await Members.findById(req.params.member_id);
            if (!memberData) return res.status(404).json({ error: `Invalid credentials !` });

            // Checking if Project ID is valid
            let projectFound = memberData.projects_involved.findIndex((ele) => ele.project_id == req.params.project_id);
            if (projectFound == -1) return res.status(404).json({ error: "Invalid Project ID" });
            // Checking if Team ID is valid
            let teamsFound = memberData.projects_involved[projectFound].teams.findIndex((ele) => ele.team_id == req.params.team_id);
            if (teamsFound == -1) return res.status(404).json({ error: "Invalid Team ID" });

            let taskIndex = memberData.projects_involved[projectFound].teams[teamsFound].tasks.findIndex((ele) => ele._id == req.params.task_id);
            if (taskIndex == -1) return res.status(401).json({ error: "Invalid Task ID !" });

            let taskbody = req.body;
            taskbody._id = req.params.task_id;
            //Sorting Reminders Array in Ascending Order
            req.body.reminders.sort(function (a, b) {
                return new Date(a) - new Date(b);
            });
            memberData.projects_involved[projectFound].teams[teamsFound].tasks[taskIndex] = taskbody;
            await memberData.save();
            let msMember = memberData.projects_involved[projectFound].teams[teamsFound];

            let msPayload = {};
            msPayload.taskdata = msMember.tasks[taskIndex];
            msPayload.userdata = {
                uid: req.payload._id,
                firstname: userFound.user.firstname,
                email: userFound.user.email,
                phone: userFound.user.phone
            }
            //Saving Data to the DB
            await axios.delete(`${config.get("MS_URL")}/job`, { data: { msPayload } });
            await axios.post(`${config.get("MS_URL")}/newjob`, msPayload);
            res.status(200).json({ success: `Task Added Successfully and Reminders Have been Re-Scheduled accordingly` });

            return
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: `Internal Server Error` });
        }
    });



/*
    API --> api/team/project/:project_id/team/:team_id/members/:member_id/task/:task_id
    Access --> Private
    Method --> GET
    Description --> You can fetch a Particular Task from the Member
*/

teamProjects.get("/project/:project_id/team/:team_id/member/:member_id/task/:task_id", authMiddleware, async (req, res) => {
    try {

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id });
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // checking project from the members collection
        let memberData = await Members.findById(req.params.member_id)
        if (!memberData) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectFound = memberData.projects_involved.findIndex((ele) => ele.project_id == req.params.project_id);
        if (projectFound == -1) return res.status(404).json({ error: "Invalid Project ID" });
        // Checking if Team ID is valid
        let teamsFound = memberData.projects_involved[projectFound].teams.findIndex((ele) => ele.team_id == req.params.team_id);
        if (teamsFound == -1) return res.status(404).json({ error: "Invalid Team ID" });

        let taskFound = memberData.projects_involved[projectFound].teams[teamsFound].tasks.find((ele) => ele._id == req.params.task_id);
        if (!taskFound) return res.status(401).json({ error: "Invalid Task ID !" });
        res.status(200).json(taskFound);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});


/*
    API --> api/team/project/:project_id/team/:team_id/members/:member_id/tasks
    Access --> Private
    Method --> GET
    Description --> You can fetch a All Task from the Member
*/

teamProjects.get("/project/:project_id/team/:team_id/member/:member_id/tasks", authMiddleware, async (req, res) => {
    try {

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id });
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // checking project from the members collection
        let memberData = await Members.findById(req.params.member_id)
        if (!memberData) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectFound = memberData.projects_involved.findIndex((ele) => ele.project_id == req.params.project_id);
        if (projectFound == -1) return res.status(404).json({ error: "Invalid Project ID" });
        // Checking if Team ID is valid
        let teamsFound = memberData.projects_involved[projectFound].teams.findIndex((ele) => ele.team_id == req.params.team_id);
        if (teamsFound == -1) return res.status(404).json({ error: "Invalid Team ID" });

        let tasks = memberData.projects_involved[projectFound].teams[teamsFound].tasks;

        res.status(200).json(tasks);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

/*
    API --> api/team/project/:project_id/team/:team_id/members/:member_id/task/:task_id
    Access --> Private
    Method --> DELETE
    Description --> You can Delete a Particular Task from the Member
*/

teamProjects.delete("/project/:project_id/team/:team_id/member/:member_id/task/:task_id", authMiddleware, async (req, res) => {
    try {

        // Checking if team Manager exists
        let userFound = await TeamProjects.findOne({ user: req.payload._id });
        if (!userFound) return res.status(404).json({ error: `Invalid credentials !` });

        // checking project from the members collection
        let memberData = await Members.findById(req.params.member_id)
        if (!memberData) return res.status(404).json({ error: `Invalid credentials !` });

        // Checking if Project ID is valid
        let projectFound = memberData.projects_involved.findIndex((ele) => ele.project_id == req.params.project_id);
        if (projectFound == -1) return res.status(404).json({ error: "Invalid Project ID" });
        // Checking if Team ID is valid
        let teamsFound = memberData.projects_involved[projectFound].teams.findIndex((ele) => ele.team_id == req.params.team_id);
        if (teamsFound == -1) return res.status(404).json({ error: "Invalid Team ID" });

        let taskIndex = memberData.projects_involved[projectFound].teams[teamsFound].tasks.findIndex((ele) => ele._id == req.params.task_id);
        if (taskIndex == -1) return res.status(401).json({ error: "Invalid Task ID !" });

        let msPayload = {};
        let msMember = memberData.projects_involved[projectFound].teams[teamsFound];
        msPayload.taskdata = msMember.tasks[taskIndex];
        msPayload.userdata = {
            firstname: userFound.user.firstname,
        }
        await axios.delete(`${config.get("MS_URL")}/job`, { data: { msPayload } });
        memberData.projects_involved[projectFound].teams[teamsFound].tasks.splice(taskIndex, 1)
        await memberData.save();
        res.status(200).json({ success: "Task is deleted" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});



/*
    API --> api/team/project/:project_id/team/:team_id/members/:member_id/tasks
    Access --> Private
    Method --> GET
    Description --> Fetch all projects for members
*/



export default teamProjects;