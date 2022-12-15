import { body, validationResult } from 'express-validator';

function userRegisterValidatorRules() {
    return [
        body("firstname", "First Name is Required").notEmpty().isLength({ min: 2 }),
        body("lastname", "Last Name is Required / Min 2 Characters").notEmpty().isLength({ min: 2 }),
        body("email", "Email is Required").isEmail(),
        body("password", "Password should be Min 8 Characters, Atleast 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Character")
            .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
        body("password2").custom(
            (value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Password, & Confirm Password do not match");
                } else {
                    return true;
                }
            }
        ),
        body("phone", "Phone Number is not valid").isMobilePhone(),
        body("country", "Country cannot be empty").notEmpty()
    ]
}

function userLoginValidatorRules() {
    return [
        body("password", "Password is Required").notEmpty(),
        body("email", "Email is Required").isEmail(),
    ]
}

function scheduleTaskValidatorRules() {
    return [
        body("task", "Task Name is required").notEmpty(),
        body("deadline").custom(value => {
            if (new Date(value) == "Invalid Date")
                throw new Error('Deadline is invalid.')

            let deadline = new Date(value);
            let mins = (deadline - new Date()) / (1000 * 60);
            let days = (deadline - new Date()) / (1000 * 60 * 60 * 24);
            if (mins < 30 || days > 30)
                throw new Error('Deadline must be greater than 30 mins, less than 30 days or be backdated.');
            else
                return true;
        }),
        body("reminders", "Cannot put more than 3 reminders. (Subscribe to premium to unlock the feature)").isArray({ max: 3 }),
        body("reminders.*").custom((value, { req }) => {
            if (new Date(value) == "Invalid Date" || new Date(value) > new Date(req.body.deadline) || new Date(value) < new Date())
                throw new Error('Reminders cannot be an invalid timestamp, be backdated or be more than deadline');
            else
                return true;
        }),
        body("reminders").custom((value) => {
            for (let i = 0; i < value.length; i++) {
                for (let j = i + 1; j < value.length; j++) {
                    if ((Math.abs(new Date(value[j]) - new Date(value[i]))) / (1000 * 60) < 5)
                        throw new Error('Reminders cannot have a difference of less than 5 minutes.');
                }
            }
            return true;
        }),
        body("notificationType").custom((value) => {
            if (value === "email" || value === "sms" || value === "both")
                return true;
            else
                throw new Error('Notification Type should be either "email", "sms" or "both".');
        })
    ]
}

function editScheduleTaskValidatorRules() {
    const rules = scheduleTaskValidatorRules();
    return [
        ...rules,
        body("isCompleted", "isCompleted cannot be empty & Should be a boolean").isBoolean()
    ]
}

function forgotpasswordValidatorRules() {
    return [
        body("email", "Email is Required").isEmail()
    ]
}

function verifyforgotpasswordValidatorRules() {
    return [
        body("email", "Email is Required").isEmail(),
        body("otp", "OTP is needed").notEmpty()
    ]
}

function resetPasswordValidatorRules() {
    return [

        body("newpassword", "New Password should be Min 8 Characters, Atleast 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Character")
            .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
        body("confirmnewpassword").custom(
            (value, { req }) => {
                if (value !== req.body.newpassword) {
                    throw new Error("Password & Confirm Password do not match");
                } else {
                    return true;
                }
            }
        )
    ]
}

function complaintValidatorRules() {
    return [
        body("email", "Email is Required").isEmail(),
        body("title", "Title is Required / 2-25 characters required.").notEmpty().isLength({ min: 2, max: 25 }),
        body("description", "Description is Required / Min 2 Characters.").notEmpty().isLength({ min: 2 }),
    ]
}

function addProjectRules() {
    return [
        body("projectName", "Project name cannot be empty").notEmpty()
    ];
}

function addTeamValidatorRules() {
    return [
        body("teamName", "Team Name is Required and Cannot be more than 25 Characters").notEmpty().isLength({ max: 25 })
    ]
}

function addMemberValidatorRules() {
    return [
        body("fullname", "Fullname is Required and Cannot be more than 25 Characters").notEmpty().isLength({ max: 25 }),
        body("email", "Email is Required").isEmail(),
        body("phone", "Phone Number is not valid").isMobilePhone()
    ]
}


function addTeamAdminValidatorRules() {
    return [
        body("firstname", "First Name is Required").notEmpty().isLength({ min: 2 }),
        body("lastname", "Last Name is Required / Min 2 Characters").notEmpty().isLength({ min: 2 }),
        body("email", "Email is Required").isEmail(),
        body("phone", "Phone Number is not valid").isMobilePhone(),
        body("country", "Country cannot be empty").notEmpty()
    ]
}

function editTeamAdminValidatorRules() {
    // const rules = addTeamAdminValidatorRules();
    //Add Status Pending Active Suspend Deleted
    return [
        body("firstname", "First Name is Required").notEmpty().isLength({ min: 2 }),
        body("lastname", "Last Name is Required / Min 2 Characters").notEmpty().isLength({ min: 2 }),
        body("email", "Email is Required").isEmail(),
        body("phone", "Phone Number is not valid").isMobilePhone()
        // ...rules,
        // body("userstatus", "Status Cannot be Empty").notEmpty()
    ]
}


function errorMiddleware(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    return next();
}

function OTPValidatorRules() {
    return [
        body("otp", "Otp is Required").notEmpty()
    ]
}

export {
    userRegisterValidatorRules,
    userLoginValidatorRules,
    scheduleTaskValidatorRules,
    editScheduleTaskValidatorRules,
    forgotpasswordValidatorRules,
    verifyforgotpasswordValidatorRules,
    resetPasswordValidatorRules,
    complaintValidatorRules,
    addProjectRules,
    addTeamValidatorRules,
    addMemberValidatorRules,
    addTeamAdminValidatorRules,
    editTeamAdminValidatorRules,
    errorMiddleware,
    OTPValidatorRules
}