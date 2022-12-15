import mongoose from "mongoose";

let adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    usertype: {
        type: String,
        default: "admin"
    },
    userstatus: {
        type: String,
        default: "active"
    },
});

export default mongoose.model("Admin", adminSchema, "admin");