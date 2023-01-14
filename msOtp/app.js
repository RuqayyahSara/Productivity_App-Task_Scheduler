import express from "express";
import config from "config";
import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 300 });

import generateToken from "./generateToken.js";

const app = express();
const port = process.env.PORT || config.get("PORT");
app.use(express.json());

app.get("/", (req, res) => {
    res.send("OTP Microservice!")
})

app.post("/create", (req, res) => {
    try {
        const { email, otp, phone, status } = req.body
        if (status == "suspended")
            return res.status(401).json({ error: "Account Suspended. Try again later" })

        myCache.set(`${email}-${otp}`, { otp: otp, attempts: 4 })
        console.log(myCache.data)
        res.status(200).json({ success: 'Otp sent successfully' })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.post("/verify", (req, res) => {
    try {
        const { id, email, type, otp, userOtp, status } = req.body
        if (status == "suspended")
            return res.status(401).json({ error: "Account Suspended. Try again later" })

        if (!myCache.has(`${email}-${otp}`))
            return res.status(404).json({ error: 'OTP Expired.' })

        let key = myCache.data[`${email}-${otp}`]
        if (otp != userOtp) {
            if (key.v.attempts <= 1) {
                myCache.del(`${email}-${otp}`)
                return res.status(200).json({ error: 'Account Suspended. Try again after 15 minutes', block: true})
            }
            key.v.attempts -= 1
            return res.status(404).json({ error: `Invalid OTP. Remaining Attempts: ${key.v.attempts}` })
        }
        // Delete OTP from cache
        myCache.del(`${email}-${userOtp}`)
        // Generate Auth Token
        let payloadData = {
            email: email,
            _id: id,
            type: type,
        };
        console.log(myCache.data)
        console.log(payloadData)
        let token = generateToken(payloadData);
        res.status(200).json({ token })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.listen(port, () => {
    console.log(`Scheduler MicroService is up and running at ${port}`);
});
