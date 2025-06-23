import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "./UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";
import "../styles/Login.css";
import logo from "../assets/logo.png";
import MicrosoftIcon from "../assets/microsoft-icon.svg";

const SLTLogin = () => {
  const { setUser } = useUser();
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    
    try {
      // 1. Authenticate with Microsoft
      const loginResponse = await instance.loginPopup(loginRequest);
      
      // 2. Get account information
      const accounts = instance.getAllAccounts();
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }
      
      // 3. Get token silently
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      });
      
      // 4. Send token to backend
      const res = await axios.get(`https://frdattendancemanagementsystemtestdiployment-production.up.railway.app/api/user/me`, {
        headers: {
          Authorization: `Bearer ${tokenResponse.idToken || tokenResponse.accessToken}`,
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      });

      if (res.status === 200) {

        const userData = res.data;
        const userId = userData.userId;
        const role = userData.userRole;

        toast.success(`Welcome ${role}`, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          onClose: () => {
            setUser(userId, role);
            navigate(`/admin/${role}`);
          }
        });
      } else {
        console.error("Backend response:", res);
        throw new Error(res.data || "Authentication failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Authentication failed. Please try again.";
      
      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { 
        position: "top-right",
        className: "error-toast",
        progressStyle: { background: "#ff4d4f" }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modern-login-container">
      <div className="tech-grid"></div>
      <div className="particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="particle" style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`
          }}></div>
        ))}
      </div>
      
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="card-header">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={logo} alt="Company Logo" className="logo" />
          </motion.div>
          <h2>SLT User Login</h2>
          <p>Internal security management system</p>
        </div>

        <div className="microsoft-login-container">
          <motion.button
            className="microsoft-login-btn"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="loader"></span>
            ) : (
              <>
                <img src={MicrosoftIcon} alt="Microsoft" className="microsoft-icon" />
                <span>Sign in with Microsoft</span>
              </>
            )}
          </motion.button>
        </div>

        <div className="footer">
          <div className="version">v2.4.1</div>
        </div>
      </motion.div>

      <ToastContainer 
        position="top-right"
        toastClassName="modern-toast"
        progressClassName="toast-progress"
      />
    </div>
  );
};

export default SLTLogin;