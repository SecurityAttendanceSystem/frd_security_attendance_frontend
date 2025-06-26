import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DefaultComponent.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DefaultComponent = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    internalUsers: 0,
    securityCompanies: 0,
    securityOfficers: 0,
    loading: true
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [internalUsers, securityCompanies, securityOfficers] = await Promise.all([
          axios.get(`http://localhost:8080/api/internalUser/getInternalUsersCount`),
          axios.get(`http://localhost:8080/api/securityCompany/getSecurityCompanyCount`),
          axios.get(`http://localhost:8080/api/security-staff/getSecurityOfficersCount`)
        ]);

        setCounts({
          internalUsers: internalUsers.data,
          securityCompanies: securityCompanies.data,
          securityOfficers: securityOfficers.data,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
        setCounts(prev => ({ ...prev, loading: false }));
      }
    };

    fetchCounts();
  }, []);

  const handleGuidelinesClick = () => {
    navigate("../logo.png");
  };

  return (
    <div className="default-component">
      <ToastContainer />
      <h1 className="default-title">Security Management Dashboard</h1>
      
      <div className="default-cards-container">
        {/* Guidelines Card (Clickable) */}
        <div 
          className="default-card clickable-card"
        >
          <div className="default-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 4.58V4c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v.58a8 8 0 0 1 1.92 1.11l.5-.29a2 2 0 0 1 2.74.73l1 1.74a2 2 0 0 1-.73 2.73l-.5.29a8.06 8.06 0 0 1 0 2.22l.5.3a2 2 0 0 1 .73 2.72l-1 1.74a2 2 0 0 1-2.73.73l-.5-.3A8 8 0 0 1 15 19.43V20a2 2 0 0 1 2 2h-2a2 2 0 0 1-2-2v-.58a8 8 0 0 1-1.92-1.11l-.5.29a2 2 0 0 1-2.74-.73l-1-1.74a2 2 0 0 1 .73-2.73l.5-.29a8.06 8.06 0 0 1 0-2.22l-.5-.3a2 2 0 0 1-.73-2.72l1-1.74a2 2 0 0 1 2.73-.73l.5.3A8 8 0 0 1 9 4.57zM7.88 7.64l-.54.51-1.77-1.02-1 1.74 1.76 1.01-.17.73a6.02 6.02 0 0 0 0 2.78l.17.73-1.76 1.01 1 1.74 1.77-1.02.54.51a6 6 0 0 0 2.4 1.4l.72.2V20h2v-2.04l.71-.2a6 6 0 0 0 2.41-1.4l.54-.51 1.77 1.02 1-1.74-1.76-1.01.17-.73a6.02 6.02 0 0 0 0-2.78l-.17-.73 1.76-1.01-1-1.74-1.77 1.02-.54-.51a6 6 0 0 0-2.4-1.4l-.72-.2V4h-2v2.04l-.71.2a6 6 0 0 0-2.41 1.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
            </svg>
          </div>
          <h3>User Guidelines</h3>
          <p>View and manage all security protocols and procedures</p>
          <a href="../guidlines.pdf" className="guidelines-link"><div className="default-card-link">Click to view →</div></a>
        </div>

        {/* Security Officers Card */}
        <div className="default-card">
          <div className="default-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h3>Security Officers</h3>
          <div className="default-stat-number">
            {counts.loading ? <div className="loading-dots">...</div> : counts.securityOfficers}
          </div>
          <p>Currently registered</p>
        </div>

        {/* Security Companies Card */}
        <div className="default-card">
          <div className="default-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
            </svg>
          </div>
          <h3>Security Companies</h3>
          <div className="default-stat-number">
            {counts.loading ? <div className="loading-dots">...</div> : counts.securityCompanies}
          </div>
          <p>Partner companies</p>
        </div>

        {/* Internal Users Card */}
        <div className="default-card">
          <div className="default-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <h3>Internal Users</h3>
          <div className="default-stat-number">
            {counts.loading ? <div className="loading-dots">...</div> : counts.internalUsers}
          </div>
          <p>System administrators</p>
        </div>
      </div>
    </div>
  );
};

export default DefaultComponent;