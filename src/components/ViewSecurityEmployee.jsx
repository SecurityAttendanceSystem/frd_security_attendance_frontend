import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ViewSecurityEmployee.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewSecurityEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`https://frdattendancemanagementsystemtestdiployment-production.up.railway.app/api/security-staff/all`);
        setEmployees(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch employee data");
        setLoading(false);
        console.error("Error fetching employees:", err);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return <div className="loading-message">Loading employee data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="security-employee-table-container">
      <ToastContainer />
      <h2>Security Employee List</h2>
      <div className="security-employee-table-wrapper">
        <table className="security-employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Contact No</th>
              <th>Address</th>
              <th>Supervisor</th>
              <th>Company Name</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.empId}</td>
                <td>{emp.contact}</td>
                <td>{emp.address}</td>
                <td>{emp.supervisor}</td>
                <td>{emp.companyName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewSecurityEmployee;