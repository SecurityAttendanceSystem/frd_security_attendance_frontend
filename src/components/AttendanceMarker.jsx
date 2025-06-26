import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AttendanceMarker.css";
import { format, parseISO, isAfter, isBefore, addHours, subHours, differenceInHours, differenceInMinutes } from "date-fns";
import { useUser } from "./UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AttendanceMark = () => {
  const currentDate = new Date();
  const [serviceNumbers, setServiceNumbers] = useState([]);
  const { userId } = useUser();
  
  // Initialize all fields with default values (empty strings instead of null/undefined)
  const createNewEntry = (date, lastEntry = null) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return {
      location: lastEntry?.location || "",
      arrivalDate: formattedDate,
      arrivalTime: lastEntry?.arrivalTime || "",
      departureDate: formattedDate,
      departureTime: lastEntry?.departureTime || "",
      shiftType: lastEntry?.shiftType || "",
      duration: lastEntry?.duration || "0.00",
      penalty: "",
      remarks: "",
    };
  };

  const [entries, setEntries] = useState([createNewEntry(currentDate)]);
  const [sharedFields, setSharedFields] = useState({
    date: format(currentDate, "yyyy-MM-dd"),
    sId: "",
    supervisorNo: userId,
    companyName: "",
  });
  const [shiftHistory, setShiftHistory] = useState([]);

  useEffect(() => {
    fetchServiceNumbers();
  }, []);

  useEffect(() => {
    if (sharedFields.sId) {
      fetchShiftHistory(sharedFields.sId);
    }
  }, [sharedFields.sId]);

  function fetchServiceNumbers() {
    axios
      .get(`http://localhost:8080/api/security-staff/getSecurityStaff/${userId}`)
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setServiceNumbers(data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setServiceNumbers([]);
      });
  }

  function fetchShiftHistory(empId) {
    axios
      .get(`http://localhost:8080/api/attendance/getAttendanceByEmpId/${empId}`)
      .then((response) => {
        setShiftHistory(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching shift history:", error);
        setShiftHistory([]);
      });
  }

  const check24HourShift = (empId, newShiftStart, newShiftEnd) => {
    const relevantShifts = shiftHistory.filter(shift => {
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
          message: `This officer completed a 24-hour shift and must rest for 12 hours until ${format(requiredRestEnd, "MMM dd, yyyy HH:mm")}. Earliest available start time is ${format(availableStartTime, "MMM dd, yyyy HH:mm")}.`
        };
      }

      const newShiftDuration = differenceInHours(newShiftEnd, newShiftStart);
      if (newShiftDuration > 12) {
        return {
          valid: false,
          message: "After a 24-hour shift, this officer can only work a maximum of 12 hours."
        };
      }
    }

    return { valid: true };
  };

  const handleServiceNumberChange = (value) => {
    const selectedEmployee = serviceNumbers.find((emp) => emp.empId === value);
    setSharedFields((prev) => ({
      ...prev,
      sId: value,
      supervisorNo: selectedEmployee?.supervisorNo || userId,
      companyName: selectedEmployee?.companyName || ""
    }));
  };

  const handleSharedFieldChange = (field, value) => {
    setSharedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value || "";
    
    if (['arrivalDate', 'arrivalTime', 'departureDate', 'departureTime'].includes(field)) {
      calculateDuration(updatedEntries, index);
    }

    setEntries(updatedEntries);
  };

  const calculateDuration = (entriesArray, index) => {
    try {
      const arrival = parseISO(
        `${entriesArray[index].arrivalDate}T${entriesArray[index].arrivalTime || '00:00'}`
      );
      const departure = parseISO(
        `${entriesArray[index].departureDate}T${entriesArray[index].departureTime || '00:00'}`
      );

      if (departure <= arrival) {
        entriesArray[index].duration = "0.00";
        return;
      }

      const totalHours = differenceInHours(departure, arrival);
      const minutes = differenceInMinutes(departure, arrival) % 60;
      
      entriesArray[index].duration = `${totalHours}.${minutes.toString().padStart(2, "0")}`;
      
    } catch (error) {
      console.error("Error calculating duration:", error);
      entriesArray[index].duration = "0.00";
    }
  };

  const addNewEntry = () => {
    setEntries([
      ...entries,
      createNewEntry(currentDate, entries[entries.length - 1]),
    ]);
  };

  const removeEntry = (index) => {
    if (entries.length <= 1) return;
    const updatedEntries = [...entries];
    updatedEntries.splice(index, 1);
    setEntries(updatedEntries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sharedFields.sId || !sharedFields.companyName) {
      toast.error("Please fill all required fields", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const hasInvalidDates = entries.some((entry) => {
      const arrival = new Date(`${entry.arrivalDate}T${entry.arrivalTime || "00:00"}`);
      const departure = new Date(`${entry.departureDate}T${entry.departureTime || "00:00"}`);
      return departure < arrival;
    });

    if (hasInvalidDates) {
      toast.error("Departure date/time cannot be before arrival date/time", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    for (const entry of entries) {
      const newShiftStart = new Date(`${entry.arrivalDate}T${entry.arrivalTime || "00:00"}`);
      const newShiftEnd = new Date(`${entry.departureDate}T${entry.departureTime || "00:00"}`);
      
      const shiftCheck = check24HourShift(sharedFields.sId, newShiftStart, newShiftEnd);
      if (!shiftCheck.valid) {
        toast.error(shiftCheck.message, {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }
    }

    try {
      const attendanceData = entries.map((entry) => ({
        location: entry.location,
        date: sharedFields.date,
        empId: sharedFields.sId,
        supervisorNo: sharedFields.supervisorNo,
        companyId: sharedFields.companyName,
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
        `http://localhost:8080/api/attendance/saveAttendance`,
        attendanceData,
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success("Attendance submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setEntries([createNewEntry(currentDate)]);
      setSharedFields({
        date: format(currentDate, "yyyy-MM-dd"),
        sId: "",
        supervisorNo: userId,
        companyName: ""
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

  return (
    <div className="attendance-form-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <h2>Capture Attendance Daily Records</h2>
      <p className="instructions">Fill in the attendance details below.</p>

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

        {entries.map((entry, index) => (
          <div key={index} className="entry-card">
            <div className="entry-header">
              <h3>Employee {index + 1}</h3>
              {entries.length > 1 && (
                <button
                  type="button"
                  className="remove-entry-btn"
                  onClick={() => removeEntry(index)}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Service No*</label>
                <select
                  value={sharedFields.sId}
                  onChange={(e) => handleServiceNumberChange(e.target.value)}
                  required
                >
                  <option value="">Select Service No</option>
                  {serviceNumbers.map((employee) => (
                    <option key={employee.empId} value={employee.empId}>
                      {employee.empId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Company ID</label>
                <input
                  type="text"
                  value={sharedFields.companyName}
                  readOnly
                  className="read-only-field"
                />
              </div>
            
              <div className="form-group">
                <label>Location*</label>
                <select
                  value={entry.location}
                  onChange={(e) => handleChange(index, "location", e.target.value)}
                  required
                >
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
                  onChange={(e) => handleChange(index, "arrivalDate", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Arrival Time</label>
                <input
                  type="time"
                  value={entry.arrivalTime}
                  onChange={(e) => handleChange(index, "arrivalTime", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Departure Date*</label>
                <input
                  type="date"
                  value={entry.departureDate}
                  onChange={(e) => handleChange(index, "departureDate", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="time"
                  value={entry.departureTime}
                  onChange={(e) => handleChange(index, "departureTime", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Shift Type</label>
                <select
                  value={entry.shiftType}
                  onChange={(e) => handleChange(index, "shiftType", e.target.value)}
                >
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
                  onChange={(e) => handleChange(index, "penalty", e.target.value)}
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
                  onChange={(e) => handleChange(index, "remarks", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button type="button" className="add-entry-btn" onClick={addNewEntry}>
            + Add Employee
          </button>
          <button type="submit" className="submit-btn">
            Submit Attendance
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceMark;