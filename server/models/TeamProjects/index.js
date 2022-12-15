import mongoose from "mongoose";

let projectSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    projects: [{
        projectName: {
            type: String,
            required: true,
        },
        teams: [{
            teamName: {
                type: String,
                required: true,
            },
            members: [{
                member: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Members"
                }
            }]
        }]
    }]
});

export default mongoose.model("TeamProjects", projectSchema, "teamprojects");