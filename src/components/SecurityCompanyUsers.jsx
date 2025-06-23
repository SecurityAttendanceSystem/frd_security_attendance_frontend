import React, { useState,useEffect } from "react";
import axios from "axios";
import "../styles/userTable.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SecurityCompanyUsers = () => {
  // Sample User Data
  const [users, setUsers] = useState([]);

  // Search state
  const [search, setSearch] = useState("");

  // Handle Delete User
  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  // Filter users by search input
  const filteredUsers = users.filter((user) =>
    user.id.toString().includes(search)
  );

  function fetchSecurityCompanyUsers(){
    axios.get(`https://frdattendancemanagementsystemtestdiployment-production.up.railway.app/api/companyUser/getAll`).then((res)=>{
        console.log("user fetched : ",res.data);
        setUsers(res.data);
    }).catch((err)=>{
        console.log(err);
    })
  }

  useEffect(()=>{
    fetchSecurityCompanyUsers();
  },[]);

  return (
    <div className="user-table-container">
      <ToastContainer />
      <h2></h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search User ID..."
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* User Table */}
      <table className="user-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Designation</th>
            <th>Email</th>
            <th>Company Id</th>
            <th>Password</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.designation}</td>
                <td>{user.email}</td>
                <td>{user.company?.id || 'N/A'}</td>
                <td>{user.password}</td>
                <td>{user.address}</td>
                <td>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="no-results">No Users Found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SecurityCompanyUsers;
