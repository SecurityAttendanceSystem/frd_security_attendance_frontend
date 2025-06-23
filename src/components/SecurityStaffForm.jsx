import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/SecurityStaffForm.css";

const SecurityStaffForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    empId: "",
    contact: "",
    address: "",
    supervisor: "",
    companyName: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [supervisors, setSupervisors] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supervisorsRes, companiesRes] = await Promise.all([
          axios.get(`https://frdattendancemanagementsystemtestdiployment-production.up.railway.app/api/internalUser/getAll`),
          axios.get(`https://frdattendancemanagementsystemtestdiployment-production.up.railway.app/api/securityCompany/all`)
        ]);
        setSupervisors(supervisorsRes.data);
        setCompanies(companiesRes.data);
      } catch (error) {
        toast.error("Failed to load form data", {
          position: "top-right",
          autoClose: 3000,
        });
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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

  const handleClear = () => {
    setFormData({
      name: "",
      empId: "",
      contact: "",
      address: "",
      supervisor: "",
      companyName: "",
    });
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.empId.trim()) errors.empId = "Service number is required";
    if (!formData.contact.trim()) errors.contact = "Contact is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.supervisor) errors.supervisor = "Supervisor is required";
    if (!formData.companyName) errors.companyName = "Company is required";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Sanitize the data
      const sanitizedData = {
        name: formData.name.trim(),
        empId: formData.empId.trim(),
        contact: formData.contact.trim(),
        address: formData.address.trim(),
        supervisor: formData.supervisor,
        companyName: formData.companyName
      };

      console.log("Sending data:", JSON.stringify(sanitizedData, null, 2));

      const response = await axios({
        method: 'post',
        url: 'https://frdattendancemanagementsystemtestdiployment-production.up.railway.app/api/security-staff/add',
        data: sanitizedData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      toast.success("Security staff added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      handleClear();
    } catch (error) {
      console.error("Error saving data:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      if (error.response?.data) {
        setValidationErrors(error.response.data);
      } else {
        toast.error(error.response?.data?.message || "Failed to add security staff", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="security-form-container">
      <ToastContainer />
      
      <div className="security-form-card">
        <div className="form-header">
          <h2>Add Security Staff</h2>
          <p>Fill in the details below to register new security personnel</p>
        </div>
        
        <form onSubmit={handleSubmit} className="security-form">
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

            {/* Service Number Field */}
            <div className={`form-group ${validationErrors.empId ? "has-error" : ""}`}>
              <label htmlFor="empId">NIC Number</label>
              <input
                type="text"
                id="empId"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                placeholder="Enter service number"
              />
              {validationErrors.empId && (
                <span className="error-message">{validationErrors.empId}</span>
              )}
            </div>

            {/* Contact Field */}
            <div className={`form-group ${validationErrors.contact ? "has-error" : ""}`}>
              <label htmlFor="contact">Contact Number</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
              {validationErrors.contact && (
                <span className="error-message">{validationErrors.contact}</span>
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

            {/* Supervisor Field */}
            <div className={`form-group ${validationErrors.supervisor ? "has-error" : ""}`}>
              <label htmlFor="supervisor">Supervisor</label>
              <select
                id="supervisor"
                name="supervisor"
                value={formData.supervisor}
                onChange={handleChange}
              >
                <option value="">Select supervisor</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.userId} value={supervisor.userId}>
                    {supervisor.name}
                  </option>
                ))}
              </select>
              {validationErrors.supervisor && (
                <span className="error-message">{validationErrors.supervisor}</span>
              )}
            </div>

            {/* Company Field */}
            <div className={`form-group ${validationErrors.companyName ? "has-error" : ""}`}>
              <label htmlFor="companyName">Security Company</label>
              <select
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              >
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
              {validationErrors.companyName && (
                <span className="error-message">{validationErrors.companyName}</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                "Add Security Staff"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecurityStaffForm;