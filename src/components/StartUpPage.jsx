import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/logo.png";

const LoginSelection = () => {
  const navigate = useNavigate();

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
            <img src={logo} alt="SITMOBITEL" className="logo" />
          </motion.div>
          <h2>Welcome to Security System</h2>
          <p>Please select your login type</p>
        </div>

        <div className="login-options">
          <motion.button
            className="login-option-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/company-login")}
          >
            <div className="option-icon">🏢</div>
            <h3>Company User</h3>
            <p>Login with your company email</p>
          </motion.button>

          <motion.button
            className="login-option-btn secondary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/slt-login")}
          >
            <div className="option-icon">🔐</div>
            <h3>SLT User</h3>
            <p>Internal system login</p>
          </motion.button>
        </div>

        <div className="footer">
          <div className="version">v2.4.1</div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSelection;