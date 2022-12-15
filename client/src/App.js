import { Route, Routes} from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import OtpPage from "./components/OtpPage";
import PrivateRoute from "./Utils/PrivateRoute";
import EmailVerify from "./components/Verify";
import Invite from "./components/Invite";
import NotFound from "./components/NotFound";
//Private Route
import AdminDashboard from "./components/Admin/Dashboard";
import UserAnalytics from "./components/Admin/UserAnalytics";
import TeamAdminAnalytics from "./components/Admin/Teams/Analytics"

import UserDashboard from "./components/Users/Dashboard";
import UserProfile from "./components/UserProfile";
import ResetPassword from "./components/ResetPassword";

import TeamDashboard from "./components/TeamAdmin/Dashboard";
import TeamsDashboard from "./components/TeamAdmin/Teams/Dashboard";
import TeamAdminManage from "./components/Admin/Teams/Manage"
import TeamMemberDashboard from "./components/TeamAdmin/Members/Dashboard"
import TasksDashboard from "./components/TeamAdmin/Tasks/Dashboard"
import MembersDashboard from "./components/Members/Dashboard"
import MemberTeams from "./components/Members/Teams"
import TasksDash from "./components/Members/Tasks"
// Context
import UtilsState from "./contexts/Utils/UtilsState";
import AdminState from "./contexts/Admin/AdminState";
import AuthState from "./contexts/Auth/AuthState";
import TodoState from "./contexts/Todos/TodoState";
import TeamState from "./contexts/Team/TeamState";
import MemberState from "./contexts/Member/MemberState";
function App() {
  return (
    <AuthState>
      <UtilsState>
        <AdminState>
          <TeamState>
            <MemberState>
              <TodoState>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/:type/verify/:token" element={<EmailVerify />} />
                  <Route path="/project/:project_id/team/:team_id/member/invite/:_id/:token/:member_id" element={<Invite />} />

                  <Route path="/verify/otp"
                    element={<OtpPage />} />

                  <Route element={<PrivateRoute />}>
                    <Route path="/user" element={<UserDashboard />} />

                    <Route path="/user/profile/:role" element={<UserProfile />} />
                    <Route path="/resetpassword/:role" element={<ResetPassword />} />

                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/team" element={<TeamDashboard />} />
                    {/* <Route path="/team/member/:role" element={<TeamProjects />} /> */}

                    <Route path="/member/:role" element={<MembersDashboard />} />
                    <Route path="/member/:project_id/tasks/:team_id/:role" element={<TasksDash />} />
                    <Route path="/member/:project_id/:i/:role" element={<MemberTeams />} />


                    <Route path="/team/projects/teams/:project_id" element={<TeamsDashboard />} />
                    <Route path="/team/projects/teams/:project_id/members/:team_id" element={<TeamMemberDashboard />} />
                    <Route path="/team/projects/teams/:project_id/members/:team_id/tasks/:member_id" element={<TasksDashboard />} />

                    <Route path="/admin/users" element={<UserAnalytics />} />
                    <Route path="/admin/teams" element={<TeamAdminAnalytics />} />
                    <Route path="/admin/teams/manage" element={<TeamAdminManage />} />
                  </Route>

                  {/* <Route path="/404" element={} /> */}
                  <Route path="*" element={<NotFound />} />

                </Routes>
              </TodoState>
            </MemberState>
          </TeamState>
        </AdminState>
      </UtilsState>
    </AuthState>
  );
}

export default App;
