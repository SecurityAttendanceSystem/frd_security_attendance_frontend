import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AttendanceMarker.css";
import { format, parseISO, isAfter, isBefore, addHours, subHours, differenceInHours, differenceInMinutes } from "date-fns";
import { useUser } from "./UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const AttendanceMark = () => {
  const currentDate = new Date();
  const [employees, setEmployees] = useState([]);
  const { userId } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  
  const createEmployeeEntries = (employees, date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return employees.map(employee => ({
      empId: employee.empId,
      name: employee.name,
      companyName: employee.companyName,
      location: "",
      arrivalDate: formattedDate,
      arrivalTime: "",
      departureDate: formattedDate,
      departureTime: "",
      shiftType: "",
      duration: "0.00",
      penalty: "",
      remarks: "",
    }));
  };

  const [entries, setEntries] = useState([]);
  const [sharedFields, setSharedFields] = useState({
    date: format(currentDate, "yyyy-MM-dd"),
    supervisorNo: userId,
  });
  const [shiftHistory, setShiftHistory] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      const initialEntries = createEmployeeEntries(employees, currentDate);
      setEntries(initialEntries);
      
      const initialExpanded = {};
      employees.forEach(emp => {
        initialExpanded[emp.empId] = false;
      });
      setExpandedCards(initialExpanded);
      
      setIsLoading(false);
    }
  }, [employees]);

  useEffect(() => {
    entries.forEach(entry => {
      if (entry.empId && !shiftHistory[entry.empId]) {
        fetchShiftHistory(entry.empId);
      }
    });
  }, [entries]);

  function fetchEmployees() {
    axios
      .get(`${API_URL}/api/security-staff/getSecurityStaff/${userId}`)
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setEmployees(data);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
        setEmployees([]);
        setIsLoading(false);
      });
  }

  function fetchShiftHistory(empId) {
    axios
      .get(`${API_URL}/api/attendance/getAttendanceByEmpId/${empId}`)
      .then((response) => {
        setShiftHistory(prev => ({
          ...prev,
          [empId]: response.data || []
        }));
      })
      .catch((error) => {
        console.error("Error fetching shift history:", error);
        setShiftHistory(prev => ({
          ...prev,
          [empId]: []
        }));
      });
  }

  const check24HourShift = (empId, newShiftStart, newShiftEnd) => {
    const history = shiftHistory[empId] || [];
    const relevantShifts = history.filter(shift => {
      const shiftEnd = new Date(`${shift.departureDate}T${shift.departureTime}`);
      const hoursSinceLastShift = differenceInHours(newShiftStart, shiftEnd);
      
      return hoursSinceLastShift < 36 && shift.duration >= 24;
    });

    if (relevantShifts.length > 0) {
      const lastShiftEnd = new Date(`${relevantShifts[0].departureDate}T${relevantShifts[0].departureTime}`);
      const requiredRestEnd = addHours(lastShiftEnd, 12);
      
      if (isBefore(newShiftStart, requiredRestEnd)) {
        const availableStartTime = format(requiredRestEnd, "yyyy-MM-dd'T'HH:mm");
        return {
          valid: false,
          message: `Employee ${empId} completed a 24-hour shift and must rest for 12 hours until ${format(requiredRestEnd, "MMM dd, yyyy HH:mm")}. Earliest available start time is ${format(availableStartTime, "MMM dd, yyyy HH:mm")}.`
        };
      }

      const newShiftDuration = differenceInHours(newShiftEnd, newShiftStart);
      if (newShiftDuration > 12) {
        return {
          valid: false,
          message: `After a 24-hour shift, employee ${empId} can only work a maximum of 12 hours.`
        };
      }
    }

    return { valid: true };
  };

  const handleSharedFieldChange = (field, value) => {
    setSharedFields((prev) => ({ ...prev, [field]: value }));
    
    if (field === 'date') {
      setEntries(prevEntries => 
        prevEntries.map(entry => ({
          ...entry,
          arrivalDate: value,
          departureDate: value
        }))
      );
    }
  };

  const handleChange = (empId, field, value) => {
    setEntries(prevEntries => {
      return prevEntries.map(entry => {
        if (entry.empId === empId) {
          const updatedEntry = {
            ...entry,
            [field]: value || ""
          };
          
          if (['arrivalDate', 'arrivalTime', 'departureDate', 'departureTime'].includes(field)) {
            calculateDuration(updatedEntry);
          }
          
          return updatedEntry;
        }
        return entry;
      });
    });
  };

  const handleAbsentChange = (empId, isAbsent) => {
    setEntries(prevEntries => 
      prevEntries.map(entry => {
        if (entry.empId === empId) {
          return isAbsent 
            ? {
                ...entry,
                location: "",
                arrivalDate: sharedFields.date,
                arrivalTime: "",
                departureDate: sharedFields.date,
                departureTime: "",
                shiftType: "",
                duration: "0.00",
                penalty: "Absent",
                remarks: "Absent"
              }
            : {
                ...entry,
                penalty: "",
                remarks: ""
              };
        }
        return entry;
      })
    );
  };

  const calculateDuration = (entry) => {
    try {
      const arrival = parseISO(
        `${entry.arrivalDate}T${entry.arrivalTime || '00:00'}`
      );
      const departure = parseISO(
        `${entry.departureDate}T${entry.departureTime || '00:00'}`
      );

      if (departure <= arrival) {
        entry.duration = "0.00";
        return;
      }

      const totalHours = differenceInHours(departure, arrival);
      const minutes = differenceInMinutes(departure, arrival) % 60;
      
      entry.duration = `${totalHours}.${minutes.toString().padStart(2, "0")}`;
      
    } catch (error) {
      console.error("Error calculating duration:", error);
      entry.duration = "0.00";
    }
  };

  const toggleCard = (empId) => {
    setExpandedCards(prev => ({
      ...prev,
      [empId]: !prev[empId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const attendanceData = entries.map((entry) => ({
        location: entry.location,
        date: sharedFields.date,
        empId: entry.empId,
        supervisorNo: sharedFields.supervisorNo,
        companyId: entry.companyName,
        arrivalDate: entry.arrivalDate,
        arrivalTime: entry.arrivalTime || null,
        departureDate: entry.departureDate,
        departureTime: entry.departureTime || null,
        shiftType: entry.shiftType,
        duration: entry.duration,
        penalty: entry.penalty || null,
        remarks: entry.remarks || null,
        approvalOfficer02Approval: "Pending",
      }));

      const response = await axios.post(
        `${API_URL}/api/attendance/saveAttendance`,
        attendanceData,
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success("Attendance submitted successfully for all employees!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      setEntries(createEmployeeEntries(employees, currentDate));
      setSharedFields({
        date: format(currentDate, "yyyy-MM-dd"),
        supervisorNo: userId,
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const locations = ["Main Office", "Kurunegala branch"];
  const shiftTypes = ["6 hours", "12 hours", "24 hours", "36 hours"];
  const penalties = ["", "Late Arrival", "Early Departure", "Absent", "Overtime"];

  if (isLoading) {
    return <div className="loading">Loading employees...</div>;
  }

  if (employees.length === 0) {
    return <div className="no-employees">No employees found for this supervisor.</div>;
  }

  return (
    <div className="attendance-form-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <h2>Capture Attendance Daily Records</h2>
      <p className="instructions">Fill in the attendance details for all employees below.</p>

      <form onSubmit={handleSubmit}>
        <div className="shared-fields-card">
          <div className="form-row">
            <div className="form-group">
              <label>Date*</label>
              <input
                type="date"
                value={sharedFields.date}
                onChange={(e) => handleSharedFieldChange("date", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Supervisor No</label>
              <input
                type="text"
                value={sharedFields.supervisorNo}
                readOnly
                className="read-only-field"
              />
            </div>
          </div>
        </div>

        <div className="employees-list">
          {entries.map((entry) => (
            <div 
              key={entry.empId} 
              className="employee-card"
              data-absent={entry.penalty === "Absent"}
            >
              <div 
                className="employee-header"
                onClick={() => toggleCard(entry.empId)}
              >
                <div className="employee-header-left">
                  <h3>
                    {entry.name || "Unknown"} ({entry.empId}) - {entry.companyName}
                  </h3>
                  <div className="absent-checkbox">
                    <input
                      type="checkbox"
                      id={`absent-${entry.empId}`}
                      checked={entry.penalty === "Absent"}
                      onChange={(e) => handleAbsentChange(entry.empId, e.target.checked)}
                    />
                    <label htmlFor={`absent-${entry.empId}`}>Absent</label>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard(entry.empId);
                  }}
                  aria-label={expandedCards[entry.empId] ? "Collapse" : "Expand"}
                >
                  {expandedCards[entry.empId] ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>

              <div 
                className="employee-fields" 
                style={{ 
                  display: expandedCards[entry.empId] ? 'block' : 'none',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Location*</label>
                    <select
                      value={entry.location}
                      onChange={(e) => handleChange(entry.empId, "location", e.target.value)}
                      required
                      disabled={entry.penalty === "Absent"}
                    >
                      <option value="">Select Location</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Arrival Date*</label>
                    <input
                      type="date"
                      value={entry.arrivalDate}
                      onChange={(e) => handleChange(entry.empId, "arrivalDate", e.target.value)}
                      required
                      disabled={entry.penalty === "Absent"}
                    />
                  </div>

                  <div className="form-group">
                    <label>Arrival Time</label>
                    <input
                      type="time"
                      value={entry.arrivalTime}
                      onChange={(e) => handleChange(entry.empId, "arrivalTime", e.target.value)}
                      disabled={entry.penalty === "Absent"}
                    />
                  </div>

                  <div className="form-group">
                    <label>Departure Date*</label>
                    <input
                      type="date"
                      value={entry.departureDate}
                      onChange={(e) => handleChange(entry.empId, "departureDate", e.target.value)}
                      required
                      disabled={entry.penalty === "Absent"}
                    />
                  </div>

                  <div className="form-group">
                    <label>Departure Time</label>
                    <input
                      type="time"
                      value={entry.departureTime}
                      onChange={(e) => handleChange(entry.empId, "departureTime", e.target.value)}
                      disabled={entry.penalty === "Absent"}
                    />
                  </div>

                  <div className="form-group">
                    <label>Shift Type</label>
                    <select
                      value={entry.shiftType}
                      onChange={(e) => handleChange(entry.empId, "shiftType", e.target.value)}
                      disabled={entry.penalty === "Absent"}
                    >
                      <option value="">Select Shift</option>
                      {shiftTypes.map((shift) => (
                        <option key={shift} value={shift}>
                          {shift}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Duration (hrs)</label>
                    <input
                      type="text"
                      value={entry.duration}
                      readOnly
                      className="duration-field"
                    />
                  </div>

                  <div className="form-group penalty-field">
                    <label>Penalty</label>
                    <select
                      value={entry.penalty}
                      onChange={(e) => handleChange(entry.empId, "penalty", e.target.value)}
                      disabled={entry.penalty === "Absent"}
                    >
                      {penalties.map((pen) => (
                        <option key={pen} value={pen}>
                          {pen || "None"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group remarks-field">
                    <label>Remarks</label>
                    <input
                      type="text"
                      placeholder="Optional remarks"
                      value={entry.remarks}
                      onChange={(e) => handleChange(entry.empId, "remarks", e.target.value)}
                      disabled={entry.penalty === "Absent"}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Attendance for All Employees"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceMark;