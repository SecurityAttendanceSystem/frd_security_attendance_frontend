import React, { useState } from "react";
import { FaMinusCircle } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import "../styles/TimeCrad.css"; // Import the CSS file

const TimeCard = () => {
  const [employees] = useState([
    { id: 1, name: "ABC" },
    { id: 2, name: "FDS" },
    { id: 3, name: "AWE" },
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [timeCards, setTimeCards] = useState([]);
  const [showForm, setShowForm] = useState(false); // State to control form visibility

  const handleAddTimeCard = () => {
    if (!selectedEmployee || !inTime || !outTime) {
      alert("Please fill all fields");
      return;
    }

    const newTimeCard = {
      employee: selectedEmployee,
      inTime,
      outTime,
    };

    setTimeCards([...timeCards, newTimeCard]);
    setSelectedEmployee("");
    setInTime("");
    setOutTime("");
    setShowForm(false); // Hide the form after adding a time card
  };

  const toggleFormVisibility = () => {
    setShowForm(!showForm); // Toggle form visibility
  };

  return (
    <div className="time-card-container">
      {/* Button to toggle form visibility */}
      <button onClick={toggleFormVisibility} className="toggle-form-button">
        {showForm ? <FaMinusCircle /> : <IoAddCircle />} Add Time Card
      </button>

      {/* Form container */}
      {showForm && (
        <div className="form-container">
          <label>
            Select Employee:
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            In Time:
            <input
              type="time"
              value={inTime}
              onChange={(e) => setInTime(e.target.value)}
            />
          </label>
          <label>
            Out Time:
            <input
              type="time"
              value={outTime}
              onChange={(e) => setOutTime(e.target.value)}
            />
          </label>
          <button onClick={handleAddTimeCard}>Add Time Card</button>
        </div>
      )}

      {/* Time card list */}
      <div className="time-card-list">
        <h2 className="time-card-title">Time Cards</h2>
        {timeCards.length === 0 ? (
          <p>No time cards added yet.</p>
        ) : (
          <ul>
            {timeCards.map((card, index) => (
              <li className="time-card-li" key={index}>
                <strong>Employee:</strong> {card.employee} |{" "}
                <strong>In Time:</strong> {card.inTime} |{" "}
                <strong>Out Time:</strong> {card.outTime}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TimeCard;