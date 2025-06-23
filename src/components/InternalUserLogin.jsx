import React, { useState } from "react";
import "../styles/internalUserRegistration.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InternalUserLogin = () => {
  const [formData, setFormData] = useState({
    name: "",
    contactNo: "",
    role: "",
    email: "",
    tempPassword: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const roles = ["Admin", "Manager", "Security", "Employee"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Form Submitted", formData);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="internal-user-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="internal-user-card">
        <div className="internal-user-header">
          <h2>Internal User Registration</h2>
          <p>Create new internal user accounts with appropriate permissions</p>
        </div>

        <form onSubmit={handleSubmit} className="internal-user-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactNo">Contact Number</label>
              <input
                type="tel"
                id="contactNo"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                placeholder="+94 XX XXX XXXX"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">User Role</label>
              <div className="select-wrapper">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select user role</option>
                  {roles.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tempPassword">Temporary Password</label>
              <div className="password-input">
                <input
                  type="password"
                  id="tempPassword"
                  name="tempPassword"
                  value={formData.tempPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <span className="password-strength"></span>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                rows="3"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Create User Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InternalUserLogin;