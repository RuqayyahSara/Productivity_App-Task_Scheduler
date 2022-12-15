import express from "express";

// DB Models
import Users from "../../models/Users/index.js";
import Admin from "../../models/Admin/index.js";

import { authMiddleware } from "../../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
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

            let percentIncrease = []
            let monthCount = await Users.aggregate([
                { $match: { createdAt: { $gte: new Date(curr), $lt: new Date(d) } } },
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

router.get("/top/emails", authMiddleware, async (req, res) => {
    try {
        let userData = await Admin.findById(req.payload._id);
        if (!userData) return res.status(401).json({ error: "Invalid User" });

        // Rank based on email count
        let top10 = await Users.find({}, { password: 0, userverified: 0, userverifytoken: 0, passwordresettoken: 0, createdAt: 0 }).sort({ 'count.email': -1 }).limit(10)
        res.status(200).send(top10);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
