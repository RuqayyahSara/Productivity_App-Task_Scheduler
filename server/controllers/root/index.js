import express from "express";
import bcrypt from "bcrypt";
import config from "config";
import jwt from "jsonwebtoken";
import cryptoJS from "crypto-js";
import fs from "fs/promises";
import axios from "axios";

const { JWT, CRYPTO } = config.get("SECRET_KEYS1")

// DB Models
import Users from "../../models/Users/index.js";
import UserTasks from "../../models/UserTasks/index.js";
import TeamProjects from "../../models/TeamProjects/index.js";
import Admin from "../../models/Admin/index.js";
import Members from "../../models/TeamMember/index.js"
import {
  randomString,
  sendEmail,
  sendSMS,
  strongPassowordGenerator,
} from "../../utils/index.js";
import {
  userRegisterValidatorRules,
  userLoginValidatorRules,
  errorMiddleware,
  forgotpasswordValidatorRules,
  verifyforgotpasswordValidatorRules,
  resetPasswordValidatorRules,
  OTPValidatorRules
} from "../../middlewares/validations/index.js";
import { authMiddleware, generateToken, verifyOTPToken } from "../../middlewares/auth/index.js";

const router = express.Router();

// get a country's flag
router.get("/flag", async (req, res) => {
  try {
    let fileData = await fs.readFile("countries.json")
    fileData = JSON.parse(fileData)
    res.status(200).send(fileData)
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error" });
  }
})

/*
    API End Point : /api/register
    Method : POST
    Access Type : Public
    Validations:
        Password must be 8 characters minimum length, 1 uppercase, 1 special character,1 lowercase is mandatory
        Email address is unique and required field
        Valid international phone number
        Firstname length not more than 25 characters
        Address is optional
        password & password2 should match, but save password field only.
    Description: User Signup

*/

router.post(
  "/register",
  userRegisterValidatorRules(),
  errorMiddleware,
  async (req, res) => {
    try {
      //Destructuring Req.Body
      let { firstname, lastname, email, phone, password } = req.body;

      //Avoid Double Registration
      let userData = await Admin.findOne({ email });
      if (userData) {
        return res.status(409).json({ error: "User Email Already Registered" });
      }
      userData = await Users.findOne({ email });
      if (userData) {
        return res.status(409).json({ error: "User Email Already Registered" });
      }

      //Password Hashing
      req.body.password = await bcrypt.hash(password, 12);

      //Create Instance for The Model
      const user = new Users(req.body);
      if (user.usertype == "user") {
        const task = new UserTasks();
        task.user = user._id;
        await task.save();
      }
      user.userverifytoken.phone = randomString(16);
      user.userverifytoken.email = randomString(8);
      const tokenEmail = jwt.sign(
        { emailToken: user.userverifytoken.email },
        "emailToken@cs",
        { expiresIn: "1h" }
      );
      const tokenPhone = jwt.sign(
        { phoneToken: user.userverifytoken.phone },
        "phoneToken@cs",
        { expiresIn: "1h" }
      );
      await user.save();
      res.status(200).json({ success: "User is Registered Successfully" });

      //Trigger Email Verification
      sendEmail({
        subject: "User Account Verification - Tasky Solutions M7",
        to: email,
        body: `Hi ${firstname} ${lastname} <br/>
            Thank you for Signing Up. Please <a href='${config.get("URL")}/email/verify/${tokenEmail}'>Click Here </a>
            to verify your Email Address. <br/><br/>
            Thank you <br/>
            <b>Team Tasky M7 Solutions.</b>`,
      });

      //Trigger SMS Verification
      sendSMS({
        body: `Hi ${firstname}, Please click the given link to verify your phone ${config.get("URL")}/phone/verify/${tokenPhone}`,
        phone,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/*
    API End Point : /api/login
    Method : POST
    Access Type : Public
    Validations:
       Email is not Empty
       Password is Not Empty
    Description: User Login


*/

router.post(
  "/login",
  userLoginValidatorRules(),
  errorMiddleware,
  async (req, res) => {
    try {
      //Destructuring Req.Body
      let { email, password } = req.body;

      let userData = await Admin.findOne({ email });

      if (!userData) {
        userData = await Users.findOne({ email });
        if (!userData)
          userData = await Members.findOne({ email });
        if (!userData)
          return res.status(404).json({ error: "Invalid Credentials" });
      }

      const passValid = await bcrypt.compare(password, userData.password);
      if (!passValid)
        return res.status(401).json({ error: "Invalid Credentials" });

      if (userData.userstatus == "suspended")
        return res.status(401).json({ error: "Account Inactive. Try Again Later" });
      if (userData.userstatus == "pending")
        return res.status(401).json({ error: "Activate Account First" });

      if ((userData.usertype !== "admin" && !userData.userverified.email)) {
        return res.status(401).json({
          error: "Email Not Verified, Please Verify.",
        });
      }
      if ((userData.usertype !== "admin" && !userData.userverified.phone)) {
        return res.status(401).json({
          error: "Phone Not Verified, Please Verify.",
        });
      }

      // Generate OTP
      let otp = Math.floor(Math.random() * 899999) + 100000
      //Trigger Email Verification
      sendEmail({
        subject: "OTP Login - Tasky Solutions M7",
        to: userData.email,
        body: `Hi<br/>
        Your OTP for Login verification - ${otp} <br/><br/>
            Thank you <br/>
            <b>Team Tasky M7 Solutions.</b>`,
      });

      //Trigger SMS Verification
      sendSMS({
        body: `Hi, Your OTP for Login verification - ${otp}`,
        phone: userData.phone,
      });
      let data = await axios.post(`${config.get("OTP_MS_URL")}/create`, { email: userData.email, otp: otp, phone: userData.phone, status: userData.status });
      console.log(data.data)
      // Generate OTP Access Token
      let token = jwt.sign({ email: userData.email, _id: userData._id, otp: otp }, JWT, { expiresIn: "5m" });
      token = cryptoJS.AES.encrypt(token, CRYPTO).toString()
      res.status(200).json({ token })
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);


/*
    API End Point : /api/verify/otp
    Method : POST
    Access Type : Public
    Validations:
       Check for Valid Token

    Description: OTP Verification API

*/
router.post("/verify/otp", verifyOTPToken, OTPValidatorRules(), errorMiddleware, async (req, res) => {
  try {
    let payload = req.payloadOTP;
    let { otp } = req.body;

    let userData = await Admin.findOne({ email: payload.email });

    if (!userData) {
      userData = await Users.findOne({ email: payload.email });
      if (!userData)
        userData = await Members.findOne({ email: payload.email });
      if (!userData)
        return res.status(404).json({ error: "Invalid Credentials" });
    }

    let msPayload = {
      id: userData._id,
      email: payload.email,
      type: userData.usertype,
      otp: payload.otp,
      userOtp: otp,
      status: userData.userstatus
    };
    // ms
    let { data } = await axios.post(`${config.get("OTP_MS_URL")}/verify`, msPayload);
    // Suspend user for 15 minutes
    if (data.block) {
      let admin = await Admin.findOne({ usertype: "admin" });
      // Generate Auth Token
      let payloadData = {
        email: admin.email,
        _id: admin._id,
        type: admin.usertype
      };
      userData.userstatus = "suspended"
      await userData.save()
      let token = generateToken(payloadData);
      await axios.post(`${config.get("MS_URL")}/activate`, { id: userData._id, token, role: userData.usertype, invite: userData.invite });
      console.log(data.error)
      return res.status(404).json({ error: data.error });
    }
    // Update Login Time
    userData.lastLogin = new Date()
    await userData.save();
    res.status(200).json({ token: data.token, role: userData.usertype });
  } catch (error) {
    res.status(500).json({ error: error.response.data.error });
  }
});


/*
    API End Point : /api/resend/OTP
    Method : POST
    Access Type : Public
    Validations:
    Description: Resend OTP Mobile
*/
router.get(
  "/resend/otp", verifyOTPToken,
  async (req, res) => {
    try {
      let { email } = req.payloadOTP;

      let userData = await Admin.findOne({ email });

      if (!userData) {
        userData = await Users.findOne({ email });
        if (!userData)
          userData = await Members.findOne({ email });
        if (!userData)
          return res.status(401).json({ error: "Unauthorised Access" });
      }
      // Generate OTP
      let otp = Math.floor(Math.random() * 899999) + 100000
      sendEmail({
        subject: "OTP Login - Tasky Solutions M7",
        to: userData.email,
        body: `Hi<br/>
        Your OTP for Login verification - ${otp} <br/><br/>
            Thank you <br/>
            <b>Team Tasky M7 Solutions.</b>`,
      });

      //Trigger SMS Verification
      sendSMS({
        body: `Hi, Your OTP for Login verification - ${otp}`,
        phone: userData.phone,
      });
      let data = await axios.post(`${config.get("OTP_MS_URL")}/create`, { email: userData.email, otp: otp, phone: userData.phone, status: userData.userstatus });
      console.log(data.data)
      // Generate OTP Access Token
      let token = jwt.sign({ email: userData.email, _id: userData._id, otp: otp }, JWT, { expiresIn: "5m" });
      token = cryptoJS.AES.encrypt(token, CRYPTO).toString()
      res.status(200).json({ token })
    } catch (error) {
      res.status(500).json({ error: error.response.data.error });
    }
  }
);


/*
    API End Point : /api/user/phone/verify/:mobileToken
    Method : GET
    Access Type : Public
    Validations:
       Check for Valid Token

    Description: Phone Verification API

*/

router.get("/phone/verify/:token", async (req, res) => {
  try {
    let { token } = req.params;
    const phonePayload = jwt.verify(token, "phoneToken@cs");
    if (!phonePayload)
      return res.status(401).json({
        error: "Token expired. Request to resend a new Phone verification Link",
      });
    let userData = await Users.findOne({
      "userverifytoken.phone": phonePayload.phoneToken,
    });

    if (!userData)
      userData = await Members.findOne({ "userverifytoken.phone": phonePayload.phoneToken })

    if (userData.userverified.phone)
      return res
        .status(200)
        .json({ success: "The Mobile number has been Verified Already." });
    userData.userverified.phone = true;
    // userData.userverifytoken.phone = null
    await userData.save();
    res
      .status(200)
      .json({ success: "The Mobile number has been Verified Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/*
    API End Point : /api/email/verify/:emailToken
    Method : GET
    Access Type : Public
    Validations:
       Check for Valid Token

    Description: Email Verification API

*/

router.get("/email/verify/:token", async (req, res) => {
  try {
    let { token } = req.params;
    const emailPayload = jwt.verify(token, "emailToken@cs");
    if (!emailPayload)
      return res.status(401).json({
        error: "Token expired. Request to resend a new Email verification Link",
      });
    let userData = await Users.findOne({
      "userverifytoken.email": emailPayload.emailToken,
    });
    if (!userData)
      userData = await Members.findOne({ "userverifytoken.email": emailPayload.emailToken })

    if (userData.userverified.email)
      return res
        .status(200)
        .json({ success: "The Email has been Verified Already." });
    userData.userverified.email = true;
    // userData.userverifytoken.email = null
    await userData.save();
    res
      .status(200)
      .json({ success: "The Email has been Verified Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/*
    API End Point : /api/invite/verify/:token
    Method : GET
    Access Type : Public
    Validations: Check for Valid Token
    Description: Team Admin Invitation Acceptation API
*/
router.get("/invite/verify/:token", async (req, res) => {
  try {
    let { token } = req.params;

    const invitePayload = jwt.verify(token, "inviteToken@cs1");
    if (!invitePayload)
      return res.status(401).json({ error: "Link expired. Request to resend a new Email Invitation Acceptation Link", });

    let userData = await Users.findOne({ inviteToken: invitePayload.inviteToken });

    if (userData.invite)
      return res.status(200).json({ success: "The Invitation has been accepted already." });

    userData.invite = true
    userData.userstatus = "active"
    await userData.save();

    const tokenEmail = jwt.sign(
      { emailToken: userData.userverifytoken.email },
      "emailToken@cs",
      { expiresIn: "1h" }
    );
    const tokenPhone = jwt.sign(
      { phoneToken: userData.userverifytoken.phone },
      "phoneToken@cs",
      { expiresIn: "1h" }
    );

    res.status(200).json({ success: "The Invitation has been accepted Successfully. Check Email for Account Credentials" });

    //Trigger Email Verification
    sendEmail({
      subject: "User Account Verification - Tasky Solutions",
      to: userData.email,
      body: `Hi ${userData.firstname} ${userData.lastname} <br/>
            Thank you for Signing Up. Please <a href='${config.get("URL")}/email/verify/${tokenEmail}'>Click Here </a>
            to verify your Email Address. <br/><br/>
            Thank you <br/>
            <b>Team Tasky Solutions.</b>`,
    });

    //Trigger SMS Verification
    sendSMS({
      body: `Hi ${userData.firstname}, Please click the given link to verify your phone ${config.get("URL")}/phone/verify/${tokenPhone}`,
      phone: userData.phone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/*
    API End Point : /api/resend/email
    Method : POST
    Access Type : Public
    Validations:
       Email is not Empty
       Password is not Empty
    Description: Resend Verification Email

*/

router.post(
  "/resend/email",
  userLoginValidatorRules(),
  errorMiddleware,
  async (req, res) => {
    try {
      //Destructuring Req.Body
      let { email, password } = req.body;

      let userData = await Admin.findOne({ email });

      if (!userData) {
        userData = await Users.findOne({ email });
        if (!userData)
          userData = await Members.findOne({ email });
        if (!userData)
          return res.status(404).json({ error: "Invalid Credentials" });
      }

      const passValid = await bcrypt.compare(password, userData.password);
      if (!passValid)
        return res.status(401).json({ error: "Invalid Credentials" });

      if (userData.userstatus == "suspended")
        return res.status(401).json({
          error: "Account Inactive. Try Again Later",
        });

      // check if verified already
      if (userData.userverified.email)
        return res
          .status(201)
          .json({ success: "Your Email Address is already verified." });

      res.status(200).json({
        success:
          "Email verification link has been successfully sent to your Email Address",
      });
      const tokenEmail = jwt.sign(
        { emailToken: userData.userverifytoken.email },
        "emailToken@cs",
        { expiresIn: "1h" }
      );

      //Trigger Email Verification
      sendEmail({
        subject: "User Account Verification - Tasky Solutions M7",
        to: email,
        body: `Hi <br/>
            Please <a href='${config.get("URL")}/email/verify/${tokenEmail}'>Click Here </a>
            to verify your Email Address. <br/><br/>
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
    API End Point : /api/resend/phone
    Method : POST
    Access Type : Public
    Validations:
       Email is not Empty
       Password is not Empty
    Description: Resend Verification Mobile

*/

router.post(
  "/resend/phone",
  userLoginValidatorRules(),
  errorMiddleware,
  async (req, res) => {
    try {
      //Destructuring Req.Body
      let { email, password } = req.body;

      let userData = await Admin.findOne({ email });

      if (!userData) {
        userData = await Users.findOne({ email });
        if (!userData)
          userData = await Members.findOne({ email });
        if (!userData)
          return res.status(404).json({ error: "Invalid Credentials" });
      }

      const passValid = await bcrypt.compare(password, userData.password);
      if (!passValid)
        return res.status(401).json({ error: "Invalid Credentials" });

      if (userData.userstatus == "suspended")
        return res.status(401).json({
          error: "Account Inactive. Try Again Later",
        });

      // check if verified
      if (userData.userverified.phone)
        return res
          .status(201)
          .json({ success: "Your Phone Number is already verified." });

      const tokenPhone = jwt.sign(
        { phoneToken: userData.userverifytoken.phone },
        "phoneToken@cs",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        success:
          "Mobile verification link has been successfully sent to your Mobile Number",
      });

      //Trigger Phone Verification
      sendSMS({
        body: `Please click the given link to verify your phone ${config.get("URL")}/phone/verify/${tokenPhone}`,
        phone: userData.phone,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/*
    API End Point : /api/forgotpassword
    Method : POST
    Access Type : Public
    Validations:
       Email Cannot be Empty
    Description: Forgot Password

*/
router.post(
  "/forgotpassword",
  forgotpasswordValidatorRules(),
  errorMiddleware,
  async (req, res) => {
    try {
      //Destructuring Req.Body
      const userData = await Users.findOne({ email: req.body.email });
      if (!userData) {
        return res.status(200).json({
          success:
            "If you are registered with this email address, you will receive password reset instructions to your phone.",
        });
      }
      userData.passwordresettoken = randomString(8).toUpperCase();
      await userData.save();
      res.status(200).json({
        success:
          "If you are registered with this email address, you will receive password reset instructions to your phone.",
      });

      sendSMS({
        body: `This is your One Time Code to Reset the Password i.e ${userData.passwordresettoken}, Please use this to Request a new Password.`,
        phone: userData.phone,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/*
    API End Point : /api/verify/forgotpassword
    Method : POST
    Access Type : Public
    Validations:
       OTP is not Found
    Description: Forgot Password

*/
router.post(
  "/verify/forgotpassword",
  verifyforgotpasswordValidatorRules(),
  errorMiddleware,
  async (req, res) => {
    try {
      //Destructuring Req.Body
      const userData = await Users.findOne({ email: req.body.email });
      if (!userData) {
        return res
          .status(404)
          .json({ error: "Invalid Input Please Check Again" });
      }
      if (userData.passwordresettoken !== req.body.otp) {
        return res.status(401).json({ error: "Invalid OTP Entered" });
      }
      let newPassword = strongPassowordGenerator(8);
      sendEmail({
        subject: "New Password - Tasky Solutions M7",
        to: userData.email,
        body: `Hi ${userData.firstname} ${userData.lastname} <br/>
            This is your New password for login <b>${newPassword}</b> Please change it using the Change Password option in the Menu . <br/><br/>
            Thank you <br/>
            <b>Team Tasky M7 Solutions.</b>`,
      });
      userData.password = await bcrypt.hash(newPassword, 12);
      //Flushing out the Token V.V.Imp
      userData.passwordresettoken = null;
      await userData.save();
      res.status(200).json({
        success: "Your New Password has been Sent to your Email Successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/*
    API End Point : /api/resetpassword
    Method : POST
    Access Type : Protected
    Validations:
    oldpassword is not empty
    newpassword must be 8 characters minimum length, 1 uppercase, 1 special character,1 lowercase is mandatory
    confirmnewpassword is the same as new password
    Description: Reset Password

*/

router.post(
  "/resetpassword",
  authMiddleware,
  resetPasswordValidatorRules(),
  errorMiddleware,
  async (req, res) => {
    try {
      //Destructuring Req.Body
      const payload = req.payload;

      //Finding UserData from Payload
      let userData = await Users.findById(payload._id);

      //If No userData return Invalid User
      if (!userData)
        userData = await Members.findById(payload._id);
      if (!userData)
        return res.status(401).json({ error: "Invalid User" });

      userData.password = await bcrypt.hash(req.body.newpassword, 12);
      await userData.save();
      res
        .status(200)
        .json({ success: "Your Password has been Changed Successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/auth", async (req, res) => {
  try {
    const { JWT, CRYPTO } = config.get("SECRET_KEYS");
    let token = req.headers["x-auth-token"];
    let bytes = cryptoJS.AES.decrypt(token, CRYPTO); // decrypting token
    let originalToken = bytes.toString(cryptoJS.enc.Utf8); // original token
    const payload = jwt.verify(originalToken, JWT); // decoding token & getting payload
    res.status(200).json(payload)
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ error: "Access Denied. Invalid Token/Token Expired" });
  }
})

// Grt a user profile
router.get("/:user_id", authMiddleware, async (req, res) => {
  try {
    const payload = req.payload;
    console.log(payload)
    //Finding UserData from Payload
    let userData = await Users.findById(req.params.user_id, { password: 0, passwordresettoken: 0, userverifytoken: 0 });

    if (!userData)
      userData = await Members.findById(req.params.user_id, { password: 0, passwordresettoken: 0, userverifytoken: 0 });
    //If No userData return Invalid User
    if (!userData) {
      if (payload.email !== "prashanth@code.in")
        return res.status(401).json({ error: "Unauthorized Access" });
    }

    res.status(200).json({ user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router;
