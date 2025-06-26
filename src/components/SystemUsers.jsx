import React, { useState, useEffect } from "react";
import "../styles/systemUsers.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SystemUsers = () => {
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);

    function sendData(e) {
    e.preventDefault();

    const newSystemUser = {
      empId: 0,
      userRole: role,
    };

    fetch(`http://localhost:8080/api/systemUser/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSystemUser),
    })
    .then(response => response.json())
    .then(data => {
      console.log("Success:", data);
      toast.success("System user added successfully!");
      fetchUsers();
    })
    .catch(error => {
      toast.error("System user save failed!");
      console.error("Error:", error);
    });
  }

  function fetchUsers() {
    axios.get(`http://localhost:8080/api/systemUser/getAll`)
      .then((response) => {
        console.log("Fetched Users:", response.data);
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="system-users-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <table className="system-users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.empId}>
              <td>{user.empId}</td>
              <td>{user.userRole}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="add-user-section">
        <form method="post" onSubmit={sendData}>
          <input
            type="text"
            name="role"
            placeholder="Enter new role..."
            onChange={(e) => {
              setRole(e.target.value);
              console.log("Role:", e.target.value);
            }}
          />
          <button type="submit">Add User</button>
        </form>
      </div>
    </div>
  );
};

export default SystemUsers;