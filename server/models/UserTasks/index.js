import mongoose from "mongoose";

let taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    tasks: [
        {
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
                maxlength: 3
            },
            isCompleted: {
                type: Boolean,
                default: false
            },
            notificationType: {
                type: String,
                default: "email"
            }
        }
    ]
});



export default mongoose.model("UserTasks", taskSchema, "usertasks");