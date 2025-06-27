import React, { useState, useEffect } from "react";
import "../styles/systemUsers.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const AssignPatrolLeaders = () => {
  const [users, setUsers] = useState([]);
  const [leaderAssignments, setLeaderAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/internalUser/getAll`);
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle patrol leader selection
  const handleLeaderChange = (approvalOfficerId, patrolLeaderId) => {
    setLeaderAssignments(prev => ({
      ...prev,
      [approvalOfficerId]: patrolLeaderId
    }));
  };

  // Submit assignment for a single user
  const submitAssignment = async (approvalOfficerId) => {
    const patrolLeaderId = leaderAssignments[approvalOfficerId];

    if (!patrolLeaderId) {
      alert("Please select a patrol leader before submitting.");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the payload to match backend expectations
      const payload = {
        approvalOfficerId: approvalOfficerId.toString(), // Convert to String to match backend
        patrolLeaderId: patrolLeaderId.toString()       // Convert to String to match backend
      };

      const response = await axios.post(
        `${API_URL}/api/assignPatrolOfficer/save`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Assignment saved:", response.data);
      alert("Patrol leader assigned successfully!");
      
      // Clear the selection
      setLeaderAssignments(prev => {
        const newState = {...prev};
        delete newState[approvalOfficerId];
        return newState;
      });
      
      // Refresh data after successful assignment
      fetchUsers();
    } catch (error) {
      console.error("Full error details:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        alert(`Error: ${error.response.data || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        alert("No response from server. Check your connection.");
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message);
        alert("Request error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="system-users-container">
      <ToastContainer/>
      <table className="system-users-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Assign Patrol Leader</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users
            .filter(user => user.systemUser?.empId === 6) // Filter Approval Officers
            .map(user => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.name}</td>
                <td>Approval Officer</td>
                <td>
                  <select
                    value={leaderAssignments[user.userId] || ""}
                    onChange={(e) => handleLeaderChange(user.userId, e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select Patrol Leader</option>
                    {users
                      .filter(leader => leader.systemUser?.empId === 3) // Filter Patrol Leaders
                      .map(leader => (
                        <option key={leader.userId} value={leader.userId}>
                          {leader.name} (ID: {leader.userId})
                        </option>
                      ))}
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => submitAssignment(user.userId)}
                    disabled={loading || !leaderAssignments[user.userId]}
                    className={`submit-btn ${loading ? 'loading' : ''}`}
                  >
                    {loading ? "Processing..." : "Assign"}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignPatrolLeaders;