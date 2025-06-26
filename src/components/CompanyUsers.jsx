import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/CompanyUser.css";

const CompanyUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    contactNumber: "",
    company: "",
    address: "",
    email: "",
    password: ""
  });

  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/securityCompany/all`);
        setCompanies(response.data);
      } catch (error) {
        toast.error("Failed to load companies", {
          position: "top-right",
          autoClose: 3000,
        });
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.designation.trim()) errors.designation = "Designation is required";
    if (!formData.contactNumber.trim()) errors.contactNumber = "Contact number is required";
    if (!formData.company) errors.company = "Company is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.password.trim()) errors.password = "Password is required";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Sanitize and structure the data according to backend expectations
      const sanitizedData = {
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        contactNumber: formData.contactNumber.trim(),
        companyId: parseInt(formData.company), // Ensure companyId is a number
        address: formData.address.trim(),
        email: formData.email.trim(),
        password: formData.password.trim()
      };

      console.log("Sending data:", JSON.stringify(sanitizedData, null, 2));

      const response = await axios({
        method: 'post',
        url: 'http://localhost:8080/api/companyUser/save',
        data: sanitizedData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      toast.success("Company user registered successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reset form
      setFormData({
        name: "",
        designation: "",
        contactNumber: "",
        company: "",
        address: "",
        email: "",
        password: ""
      });
    } catch (error) {
      console.error("Error saving company user:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Show more specific error message if available
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Failed to register company user";
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="company-user-container">
      <ToastContainer />
      
      <div className="company-user-card">
        <div className="form-header">
          <h2>Company User Registration</h2>
          <p>Register new company users with their details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="company-user-form">
          <div className="form-grid">
            {/* Name Field */}
            <div className={`form-group ${validationErrors.name ? "has-error" : ""}`}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
              {validationErrors.name && (
                <span className="error-message">{validationErrors.name}</span>
              )}
            </div>

            {/* Designation Field */}
            <div className={`form-group ${validationErrors.designation ? "has-error" : ""}`}>
              <label htmlFor="designation">Designation</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Enter designation"
              />
              {validationErrors.designation && (
                <span className="error-message">{validationErrors.designation}</span>
              )}
            </div>

            {/* Contact Field */}
            <div className={`form-group ${validationErrors.contactNumber ? "has-error" : ""}`}>
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter contact number"
              />
              {validationErrors.contactNumber && (
                <span className="error-message">{validationErrors.contactNumber}</span>
              )}
            </div>

            {/* Company Field */}
            <div className={`form-group ${validationErrors.company ? "has-error" : ""}`}>
              <label htmlFor="company">Company</label>
              <select
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              >
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
              {validationErrors.company && (
                <span className="error-message">{validationErrors.company}</span>
              )}
            </div>

            {/* Email Field */}
            <div className={`form-group ${validationErrors.email ? "has-error" : ""}`}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
              {validationErrors.email && (
                <span className="error-message">{validationErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className={`form-group ${validationErrors.password ? "has-error" : ""}`}>
              <label htmlFor="password">Temporary Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter temporary password"
              />
              {validationErrors.password && (
                <span className="error-message">{validationErrors.password}</span>
              )}
            </div>

            {/* Address Field */}
            <div className={`form-group full-width ${validationErrors.address ? "has-error" : ""}`}>
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                rows="3"
              />
              {validationErrors.address && (
                <span className="error-message">{validationErrors.address}</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Registering...
                </>
              ) : (
                "Register User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyUser;