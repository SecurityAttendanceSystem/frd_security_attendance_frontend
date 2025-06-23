import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from "./components/UserContext";
import AdminDashboard from "./components/AdminDashboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./components/ForgotPassword";
import LoginSelection from "./components/StartUpPage";
import SLTLogin from "./components/SLT_User_login";
import CompanyUserLogin from "./components/CompanyUserLogin";

const App = () => {
  return (

    <UserProvider>
      <Router>
        <Routes>
            {/* Routes without Sidebar & Navbar */}
            {/*<Route path="/" element={<RoleSelector/>} />*/}
            <Route path="/" element={<LoginSelection/>} />
            <Route path="/slt-login" element={<SLTLogin/>}/>
            <Route path="/company-login" element={<CompanyUserLogin/>}/>
            <Route path="/admin/:roleName" element={<AdminDashboard/>} />
            <Route path="/forgot-password" element={<ForgotPassword/>} />
          </Routes>
        </Router>
    </UserProvider>
    
  );
};

export default App;
