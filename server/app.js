import config from "config";
import express from "express"
import path from "path";
import { fileURLToPath } from "url"

const app = express();

//DB Connection
import "./utils/dbConnect.js";

//Import Controllers
import memberRouter from "./controllers/index.js";
import rootRouter from "./controllers/root/index.js";
import userTasksRouter from "./controllers/usertasks/index.js";
import teamProjects from "./controllers/team/index.js";
import adminRouter from "./controllers/admin/index.js";
import adminTeamRouter from "./controllers/admin/teams/index.js"
import adminUserRouter from "./controllers/admin/users/index.js"

const __filename = fileURLToPath(import.meta.url); //
const __dirname = path.dirname(__filename); //
// Heroku Port Taking from Process.env
app.use(express.json()); //json body parser
const port = process.env.PORT || config.get("PORT");
app.use(express.static(path.join(__dirname, "build")));
app.use("/api/member", memberRouter);
app.use("/api", rootRouter);
app.use("/api/team", teamProjects);
app.use("/api/user/task", userTasksRouter);
app.use("/api/admin", adminRouter)
app.use("/api/admin/team", adminTeamRouter)
app.use("/api/admin/user", adminUserRouter)

   app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
app.listen(port , () => {
  console.log(`Server Started AT ${port}`);
  console.log(`Yoo Deployed at : ${config.get("URL")}`)
});
