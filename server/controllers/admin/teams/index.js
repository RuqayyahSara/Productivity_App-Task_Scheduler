import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";

// DB Models
import Users from "../../../models/Users/index.js";
import Members from "../../../models/TeamMember/index.js";
import Admin from "../../../models/Admin/index.js";
import TeamProjects from "../../../models/TeamProjects/index.js";



import { authMiddleware } from "../../../middlewares/auth/index.js";

import { addTeamAdminValidatorRules, editTeamAdminValidatorRules, errorMiddleware } from "../../../middlewares/validations/index.js";
import { strongPassowordGenerator, randomString, sendEmail, sendSMS } from "../../../utils/index.js"


const router = express.Router();

/*
    API --> api/admin/team/
    Access --> Private
    Method --> GET
    Description --> Admin fetches all 'team' accounts in order of 'recently created'
*/

router.get("/", authMiddleware, async (req, res) => {
    try {
        let userData = await Admin.findById(req.payload._id);
        if (!userData) return res.status(401).json({ error: "Invalid User" });

        let data = await Users.find({ usertype: "team" }, { password: 0, userverified: 0, userverifytoken: 0, passwordresettoken: 0 }).sort({ 'createdAt': -1 })
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



/*
    API --> api/admin/team/analytics
    Access --> Private
    Method --> GET
    Description --> Admin fetches user, revenue, emails and sms count of 'team' accounts
*/
router.get("/analytics", authMiddleware, async (req, res) => {
    try {
        let userData = await Admin.findById(req.payload._id);
        if (!userData) return res.status(401).json({ error: "Invalid User" });

        // User count
        let data = [];
        for (let i = 0; i < 7; i++) {
            let d = new Date();
            d.setMonth(d.getMonth() - i);
            d.setDate(1);
            d.setHours(0, 0, 0, 0);
            let curr = new Date(d);
            curr.setMonth(d.getMonth() - 1)

            let monthCount = await Users.aggregate([
                { $match: { createdAt: { $gte: new Date(curr), $lt: new Date(d) }, usertype: 'team' } },
                {
                    $group: {
                        _id: "",
                        users: { $sum: 1 },
                        revenue: { $sum: "$wallet" },
                        emailsSent: { $sum: "$count.email" },
                        smsSent: { $sum: "$count.sms" },
                    },
                },

            ]);
            data.push(monthCount);
        }
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




/*
    API --> api/admin/team/top/emails
    Access --> Private
    Method --> GET
    Description --> Admin fetches top 10 'team' accounts in decreasing order of their max. email delivery count
*/
router.get("/top/emails", authMiddleware, async (req, res) => {
    try {
        let userData = await Admin.findById(req.payload._id);
        if (!userData) return res.status(401).json({ error: "Invalid User" });

        // Rank based on email count
        let top10 = await Users.find({ usertype: "team" }, { password: 0, userverified: 0, userverifytoken: 0, passwordresettoken: 0, createdAt: 0 }).sort({ 'count.email': -1 }).limit(10)
        res.status(200).send(top10);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/*
    API --> api/admin/team/teamadmin/suspend/:admin_id
    Access --> Private
    Method --> DELETE
    Description --> Suspend Users from the Collection Can be Both Team or Normal User
    Validations --> 
                

*/
router.delete("/teamadmin/suspend/:admin_id", authMiddleware, async (req, res) => {
    try {
        let { userstatus } = req.body
        if (req.payload.type !== 'admin') {
            return res.status(401).json({ error: "Unauthorised Access" });
        }
        let admin_id = req.params.admin_id;

        let userData = await Admin.findById(admin_id);

        if (!userData) {
            userData = await Users.findById(admin_id);

            if (!userData) {
                userData = await Members.findById(admin_id);
                if (!userData)
                    return res.status(404).json({ error: "Invalid Credentials" });
            }
        }
        if (userData.usertype == "team" && userData.userstatus == "pending" && userstatus == "active")
            userData.userstatus = "pending"
        else
            userData.userstatus = userstatus
        await userData.save()
        console.log('status updated')
        res.status(200).json({ success: "User Status updated Successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

/*
    API End Point : /api/resend/email
    Method : POST
    Access Type : Private
    Validations: Admin Access
    Description: Resend Invitation Email

*/
router.get(
    "/resend/invite/:admin_id",
    authMiddleware,
    async (req, res) => {
        try {
            let { admin_id } = req.params
            if (req.payload.type !== 'admin') {
                return res.status(401).json({ error: "Unauthorised Access" });
            }
            let userData = await Users.findById(admin_id);

            if (!userData)
                return res.status(404).json({ error: "Invalid Credentials" });

            if (userData.invite) return res.status(201).json({ success: "Team Admin has already accepted the invite" });

            userData.inviteToken = randomString(8);
            const token = jwt.sign(
                { inviteToken: userData.inviteToken },
                "inviteToken@cs1",
                { expiresIn: "1h" }
            );
            await userData.save();
            res.status(200).json({ success: "Email Invite has been successfully sent to the User" });

            //Trigger Email Verification
            sendEmail({
                subject: "Team Admin Invitation - Tasky Solutions M7",
                to: userData.email,
                body: `Hi ${userData.firstname}<br/>
        Tasky Solutions has invited you to join our platform to become a Team Admin, to create and manage projects and teams.
        You can accept or ignore this invitation. 
        Please <a href='${config.get("URL")}/api/invite/verify/${token}'>Click Here </a>
        to accept the invitation from your email address. <br/><br/>
        Thank you <br/>
        <b>Team Tasky M7 Solutions.</b>`,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

/*
    API --> api/admin/team/addteamadmin
    Access --> Private
    Method --> POST
    Description --> Super Admin can Add Team Admin 

*/
router.post("/addteamadmin", addTeamAdminValidatorRules(), errorMiddleware, authMiddleware, async (req, res) => {
    try {

        if (req.payload.type !== 'admin') {
            return res.status(401).json({ error: "Unauthorised Access" });
        }

        //Get the Team Admin Details from Request Body
        let { firstname, lastname, email, phone, country, usertype } = req.body;

        let userData = await Admin.findOne({ email: email });
        if (userData)
            return res.status(409).json({ error: "User Email Already Registered" });

        userData = await Users.findOne({ email });
        if (userData)
            return res.status(409).json({ error: "User Email Already Registered" });

        let password = strongPassowordGenerator(8);
        let hashPassword = await bcrypt.hash(password, 12);

        let newUserData = { firstname, lastname, email, phone, password: hashPassword, usertype, country }
        newUserData.usertype = "team"
        newUserData.userstatus = "pending"
        const user = new Users(newUserData);
        const project = new TeamProjects();
        project.user = user._id;
        await project.save();

        //These are used to Accept Invites after Onboarding
        user.userverifytoken.phone = randomString(16);
        user.userverifytoken.email = randomString(8);
        user.inviteToken = randomString(8);

        const tokenInvite = jwt.sign(
            { inviteToken: user.inviteToken },
            "inviteToken@cs1",
            { expiresIn: "1h" }
        );

        await user.save();
        res.status(200).json({ success: "User is Registered Successfully" });

        //Trigger Email Verification
        sendEmail({
            subject: "Team Admin Invitation - Tasky Solutions M7",
            to: email,
            body: `Hi ${firstname}<br/>
                Tasky Solutions has invited you to join our platform to become a Team Admin, to create and manage projects and teams.
                You can accept or ignore this invitation. 
                Please <a href='${config.get("URL")}/api/invite/verify/${tokenInvite}'>Click Here </a>
                to accept the invitation from your email address. <br/><br/>
                Thank you <br/>
                <b>Team Tasky M7 Solutions.</b>`,
        });

        //Trigger Email Verification
        sendEmail({
            subject: "Login Credentials of Your Account - Tasky Solutions ",
            to: email,
            body: `Hi ${firstname} ${lastname} <br/>
                      Thank you for Signing Up. Your Login Credentials are : <br/>
                      email:${email} <br/>
                      password:${password} <br/>
        
                      Please use these Credentials to Login <br/>.
                      <b>Note</b> : Make sure you verify your Email and Mobile before Logging in.
        
                      <br/><br/>
                      Thank you <br/>
                      <b>Team Tasky Solutions.</b>`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


/*
    API --> api/admin/team/teamadmin/:admin_id
    Access --> Private
    Method --> PUT
    Description --> Super Admin can Edit Team Admin 

*/
router.put("/teamadmin/:admin_id", authMiddleware, editTeamAdminValidatorRules(), errorMiddleware, async (req, res) => {
    try {

        if (req.payload.type !== 'admin') {
            return res.status(401).json({ error: "Unauthorised Access" });
        }

        let admin_id = req.params.admin_id;
        let { firstname, lastname, email, phone } = req.body;

        let userData = await Users.findById(admin_id);
        if (!userData)
            return res.status(404).json({ error: "Invalid User ID Entered" });

        let emailFound = await Users.findOne({ email });
        if (emailFound)
            return res.status(409).json({ error: "User Email Already Registered" });

        userData.firstname = firstname
        userData.lastname = lastname

        // if email is changed, send new invitation link to the member
        if (userData.email !== email) {
            userData.email = email;
            // jwt expiration invite Token
            const tokenEmail = jwt.sign(
                { emailToken: userData.userverifytoken.email },
                "emailToken@cs",
                { expiresIn: "1h" }
            );
            // changing invite status to false again
            userData.userverified.email = false;

            //Trigger Email Verification
            sendEmail({
                subject: "User Account Verification - Tasky Solutions",
                to: userData.email,
                body: `Hi ${userData.firstname} ${userData.lastname} <br/>
                      Thank you for Signing Up. Please <a href='${config.get("URL")}/api/email/verify/${tokenEmail}'>Click Here </a>
                      to verify your Email Address. <br/><br/>
                      Thank you <br/>
                      <b>Team Tasky Solutions.</b>`,
            });
        }

        // if phone number is changed, send new invitation link to the member
        if (userData.phone != phone) {
            userData.phone = phone;
            // jwt expiration invite Token
            const tokenPhone = jwt.sign(
                { phoneToken: userData.userverifytoken.phone },
                "phoneToken@cs",
                { expiresIn: "1h" }
            );
            // changing invite status to false again
            userData.userverified.phone = false;

            //Trigger SMS Verification
            sendSMS({
                body: `Hi ${userData.firstname}, Please click the given link to verify your phone ${config.get("URL")}/api/phone/verify/${tokenPhone}`,
                phone: userData.phone,
            });
        }
        await userData.save()
        res.status(200).json({ success: "User Edited Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


/*
    API --> api/admin/team/teamadmin/:admin_id
    Access --> Private
    Method --> DELETE
    Description --> Super Admin can Delete Team Admin 

*/


router.delete("/teamadmin/:admin_id", authMiddleware, async (req, res) => {
    try {
        if (req.payload.type !== 'admin') {
            return res.status(401).json({ error: "Unauthorised Access" });
        }
        let admin_id = req.params.admin_id;

        let userData = await Users.findByIdAndRemove(admin_id);
        if (!userData)
            return res.status(404).json({ error: "Invalid User ID Entered" });

        let teamFound = await TeamProjects.findOneAndRemove({ user: admin_id });

        res.status(200).json({ success: "User Deleted Successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//ANOTHER APPROACH

// /*
//     API --> api/admin/team/admin/:admin_id
//     Access --> Private
//     Method --> DELETE
//     Description --> Remove Users from the Collection Can be Both Team or Normal User

// */

// router.delete("/admin/:admin_id", authMiddleware, async (req, res) => {
//     try {

//         if (req.payload.type != "admin") {
//             return res.status(401).json({ error: "Unauthorised Access" });
//         }
//         let admin_id = req.params.admin_id;
//         let userData = await Users.findByIdAndDelete(admin_id);
//         if (!userData) {
//             res.status(404).json({ error: "Invalid User ID Entered" });
//         }

//         res.status(200).json({ success: "User Deleted Successfully" });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// })

export default router;
