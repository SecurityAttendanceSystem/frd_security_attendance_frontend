import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/forgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = email input, 2 = new password input
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`http://localhost:8080/api/internalUser/request-reset`, null, {
        params: { email }
      });
      
      toast.success(response.data, {
        position: "top-right",
        autoClose: 3000
      });
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data || 'Error sending reset link', {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`http://localhost:8080/api/internalUser/reset-password`, null, {
        params: { token, newPassword }
      });
      
      toast.success(response.data, {
        position: "top-right",
        autoClose: 2000,
        onClose: () => navigate('/')
      });
    } catch (error) {
      toast.error(error.response?.data || 'Error resetting password', {
        position: "top-right",
        autoClose: 3000
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
          <h2>{step === 1 ? 'Reset Password' : 'Set New Password'}</h2>
          <p>{step === 1 ? 'Enter your email to receive a reset link' : 'Enter your new password'}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestReset}>
            <motion.div 
              className="input-container"
              whileFocus={{ boxShadow: "0 0 0 2px rgba(62, 152, 255, 0.5)" }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder=" "
              />
              <label>Email Address</label>
              <span className="input-icon">✉️</span>
            </motion.div>

            <motion.button
              type="submit"
              className="login-btn"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                'Send Reset Link'
              )}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <motion.div 
              className="input-container"
              whileFocus={{ boxShadow: "0 0 0 2px rgba(62, 152, 255, 0.5)" }}
            >
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                placeholder=" "
              />
              <label>Reset Token</label>
              <span className="input-icon">🔑</span>
            </motion.div>

            <motion.div 
              className="input-container"
              whileFocus={{ boxShadow: "0 0 0 2px rgba(62, 152, 255, 0.5)" }}
            >
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="7"
                placeholder=" "
              />
              <label>New Password</label>
              <span className="input-icon">🔒</span>
            </motion.div>

            <motion.button
              type="submit"
              className="login-btn"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                'Reset Password'
              )}
            </motion.button>
          </form>
        )}

        <div className="footer">
          <button 
            className="back-to-login" 
            onClick={() => navigate('/')}
          >
            Back to Login
          </button>
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

export default ForgotPassword;