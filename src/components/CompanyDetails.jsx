import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/CompanyDetails.css";
import companyImage from "../assets/company.jpg";

const API_URL = import.meta.env.VITE_API_URL;

const CompanyDetails = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    contactNumber: "",
    companyAddress: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user types
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
    if (!formData.companyName.trim()) errors.companyName = "Company name is required";
    if (!formData.contactNumber.trim()) errors.contactNumber = "Contact number is required";
    if (!formData.companyAddress.trim()) errors.companyAddress = "Address is required";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    const newCompany = {
      companyName: formData.companyName,
      contactNumber: formData.contactNumber,
      companyAddress: formData.companyAddress
    };
    
    try {
      const response = await axios.post(
        `${API_URL}/api/securityCompany/save`,
        newCompany, // This is the data payload
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Company saved successfully:", response.data);
      
      toast.success("Company added successfully!", {
        position: "top-right",
        autoClose: 3000,
        onClose: () => navigate("/") // Navigate after toast closes
      });
      
      // Reset form
      setFormData({
        companyName: "",
        contactNumber: "",
        companyAddress: ""
      });
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Failed to add company", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="company-details-container">
      <ToastContainer />
      
      <div className="company-details-card">
        <div className="form-section">
          <div className="form-header">
            <h2>Register New Company</h2>
            <p>Please fill in the company details below</p>
          </div>
          
          <form onSubmit={handleSubmit} className="company-form">
            <div className={`form-group ${validationErrors.companyName ? "has-error" : ""}`}>
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
              />
              {validationErrors.companyName && (
                <span className="error-message">{validationErrors.companyName}</span>
              )}
            </div>

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

            <div className={`form-group ${validationErrors.companyAddress ? "has-error" : ""}`}>
              <label htmlFor="companyAddress">Company Address</label>
              <textarea
                id="companyAddress"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                placeholder="Enter company address"
                rows="4"
              />
              {validationErrors.companyAddress && (
                <span className="error-message">{validationErrors.companyAddress}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                "Register Company"
              )}
            </button>
          </form>
        </div>
        
        <div className="image-section">
          <img src={companyImage} alt="Company office" className="company-image" />
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;