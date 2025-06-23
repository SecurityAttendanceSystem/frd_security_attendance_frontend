import React, { useState } from "react";
import "../styles/EmployeeForm.CSS"; // Import the external CSS file

const EmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    contactNumber: "",
    address: "",
    email: "",
    patrolLeader: "",
    registerCompany: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted: ", formData);
  };

  return (
    <div className="form-container-Employee">
      <h2 className="form-title">Employee Registration</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="input-field"
          required
        />

        <input
          type="text"
          name="employeeId"
          placeholder="Employee ID"
          value={formData.employeeId}
          onChange={handleChange}
          className="input-field"
          required
        />

        <input
          type="tel"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          className="input-field"
          required
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="input-field"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="input-field"
          required
        />

        {/* Patrol Leaders Dropdown */}
        <select
          name="patrolLeader"
          value={formData.patrolLeader}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value="">Select Patrol Leader</option>
          <option value="Leader A">Leader A</option>
          <option value="Leader B">Leader B</option>
          <option value="Leader C">Leader C</option>
          <option value="Leader D">Leader D</option>
        </select>

        {/* Register Company Dropdown */}
        <select
          name="registerCompany"
          value={formData.registerCompany}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value="">Select Register Company</option>
          <option value="Company A">Company A</option>
          <option value="Company B">Company B</option>
          <option value="Company C">Company C</option>
          <option value="Company D">Company D</option>
        </select>

        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default EmployeeForm;
