import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";
import Users from "../models/Users/index.js"
import Members from "../models/TeamMember/index.js"
async function connectDB() {
    try {
        await mongoose.connect(config.get("DB_URI"));
        console.log(`DB Connected`);
    } catch (error) {
        console.log(error);
    }
}
connectDB();


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
    userstatus: {
        type: String,
        default: "active"
    },
});

let adminModel = new mongoose.model("Admin", adminSchema, "admin");

async function insertAdmin() {
    try {
        let admin = {
            name: "Prash",
            phone: "+919989151967",
            password: bcrypt.hashSync("Prash@123", 12),
            email: "prashanth@code.in",
            role: "admin",
        };

        let adminData = new adminModel(admin);

        await adminData.save();
        console.log(`Admin Added Successfully`);
    } catch (error) {
        console.log(error);
    }
}
// insertAdmin();

async function updateTeam() {
    try {
        let adminData = await Users.updateMany({ usertype: "team" }, { $set: { "inviteToken": null } })
        console.log(adminData);
    } catch (error) {
        console.log(error);
    }
}

updateTeam()