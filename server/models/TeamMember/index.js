import mongoose from "mongoose";

let taskSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    reminders: {
        type: [Date],
        required: true,
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    notificationType: {
        type: String,
        default: "email"
    }
})

//This is Main User Schema
const memberSchema = new mongoose.Schema({
    usertype: {
        type: String,
        default: "member"
    },
    plantype: {
        type: String,
        default: "free"
    },
    projects_involved: [{
        admin_id: String,
        project_id: String,
        inviteToken: {
            type: String,
            default: null
        },
        inviteAccepted: {
            type: Boolean,
            default: false
        },
        teams: [{
            team_id: String,
            tasks: [taskSchema]
        }]
    }],
    fullname: {
        type: String,
        maxlength: 25,
        minlength: 2,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    userverified: {
        email: {
            type: Boolean,
            default: false
        },
        phone: {
            type: Boolean,
            default: false
        }
    },
    userverifytoken: {
        email: {
            type: String,
            // required: true
        },
        phone: {
            type: String,
            // required: true
        }
    },
    passwordresettoken: {
        type: String,
        default: null
    },
    userstatus: {
        type: String,
        default: "pending"
    },
    invite: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    lastLogin: {
        type: Date,
        default: null
    }
});

export default mongoose.model("Members", memberSchema, "members");