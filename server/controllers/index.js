import express from "express";
import config from "config";

const memberRouter = express.Router();

import authMiddleware from "../middlewares/auth/verifyToken.js";

import TeamProjects from "../models/TeamProjects/index.js";
import Members from "../models/TeamMember/index.js";

// Get Member Projects and Teams
memberRouter.get("/", authMiddleware, async (req, res) => {
    try {

        let memberData = await Members.findOne({ email: req.payload.email });
        if (!memberData) return res.status(404).json({ error: `Unauthorized access` });

        let projectFound = memberData.projects_involved.filter(e => e.inviteAccepted == true)
        projectFound = projectFound.map(e => ({ admin: e.admin_id, project: e.project_id, teams: e.teams.map(ele => ele.team_id) }))
        let projects = []
        for (let i = 0; i < projectFound.length; i++) {
            let admin = await TeamProjects.findOne({ user: projectFound[i].admin }).populate('user', 'firstname lastname email')
            admin.projects = admin.projects.filter(e => e._id == projectFound[i].project)
            admin.projects[0].teams = admin.projects[0].teams.filter(e => projectFound[i].teams.includes(String(e._id)))
            projects.push(admin)
        }
        // console.log(projects)
        res.status(200).send(projects);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

// Get Member Tasks
memberRouter.get("/project/:project_id/team/:team_id", authMiddleware, async (req, res) => {
    try {

        // checking member exists
        // let memberData = await Members.findById(req.payload._id)
        let memberData = await Members.findOne({ email: req.payload.email })
        if (!memberData) return res.status(404).json({ error: `Invalid credentials !` });

        let projectIndex = memberData.projects_involved.findIndex(e => e.project_id == req.params.project_id)
        if (projectIndex == -1) return res.status(401).json({ error: "Invalid Project ID !" });

        let teamFound = memberData.projects_involved[projectIndex].teams.find(e => e.team_id == req.params.team_id)
        if (!teamFound) return res.status(401).json({ error: "Invalid Team ID !" });

        // teamFound.
        res.status(200).send(teamFound.tasks);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Internal Server Error` });
    }
});


export default memberRouter;