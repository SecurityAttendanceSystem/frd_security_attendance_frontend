import React, { useState,useEffect } from "react";
import axios from "axios";
import "../styles/CompanyTable.css";

const API_URL = import.meta.env.VITE_API_URL;

const CompanyTable = () => {
  // Sample Company Data (Replace with API data if needed)
  const [companies,setCompanies] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  // Filtered Companies Based on Search Input
  const filteredCompanies = companies.filter((company) =>
    company.companyName
  );

  function fetchCompanies() {
    axios
      .get(`${API_URL}/api/securityCompany/all`)
      .then((response) => {
        console.log("Fetched Companies:", response.data); // Debugging
        setCompanies(response.data);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });
  }

  useEffect(() => {
    fetchCompanies();
  }, []);


  return (
    <div className="company-table-container">
      <h2></h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search Company Name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="company-search-input"
      />

      {/* Table */}
      <table className="company-table">
        <thead>
          <tr>
            <th>Company ID</th>
            <th>Company Name</th>
            <th>Contact No</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {filteredCompanies.length > 0 ? (
            companies.map((company) => (
              <tr key={company.id}>
                <td>{company.id}</td>
                <td>{company.companyName}</td>
                <td>{company.contactNumber}</td>
                <td>{company.companyAddress}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="no-results">No companies found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTable;
