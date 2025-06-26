import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import '../styles/AttendanceApproval.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PatronLeaderAttendanceRecord = () => {
  const { userRole } = useUser();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const isApprovalOfficer = userRole.startsWith('ApprovalOfficer');

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/attendance/getAll`);
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (filter !== 'All') {
      // Check if any approval level matches the filter
      const level1Status = record.approvalOfficer01Approval || 'Pending';
      const level2Status = record.approvalOfficer02Approval || 'Pending';
      const level3Status = record.approvalOfficer03Approval || 'Pending';
      
      if (filter === 'Approved') {
        return level1Status === 'Approved' || 
               level2Status === 'Approved' || 
               level3Status === 'Approved';
      } else if (filter === 'Rejected') {
        return level1Status === 'Rejected' || 
               level2Status === 'Rejected' || 
               level3Status === 'Rejected';
      } else if (filter === 'Pending') {
        return level1Status === 'Pending' || 
               level2Status === 'Pending' || 
               level3Status === 'Pending';
      }
    }
    
    if (searchTerm && 
        !record.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !record.empId?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getOverallStatus = (record) => {
    if (record.approvalOfficer03Approval === 'Rejected') return 'Rejected (Level 3)';
    if (record.approvalOfficer02Approval === 'Rejected') return 'Rejected (Level 2)';
    if (record.approvalOfficer01Approval === 'Rejected') return 'Rejected (Level 1)';
    
    if (record.approvalOfficer03Approval === 'Approved') return 'Approved (Level 3)';
    if (record.approvalOfficer02Approval === 'Approved') return 'Approved (Level 2)';
    if (record.approvalOfficer01Approval === 'Approved') return 'Approved (Level 1)';
    
    return 'Pending';
  };

  const getRejectionNotice = (record) => {
    if (record.approvalOfficer03RejectedNotice) return record.approvalOfficer03RejectedNotice;
    if (record.approvalOfficer02RejectedNotice) return record.approvalOfficer02RejectedNotice;
    if (record.approvalOfficer01RejectedNotice) return record.approvalOfficer01RejectedNotice;
    return '';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading attendance records...</p>
      </div>
    );
  }

  return (
    <div className="attendance-approval-container">
      <ToastContainer />
      <div className="approval-header">
        <h2>Attendance Approval Dashboard</h2>
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="search-icon">🔍</i>
          </div>
          
          <div className="filter-dropdown">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="records-table-container">
        <table className="records-table">
          <thead>
            <tr>
              <th>Patrol Leader</th>
              <th>Officer ID</th>
              <th>Date</th>
              <th>Arrival</th>
              <th>Departure</th>
              <th>Duration</th>
              <th>Shift</th>
              <th>Penalty</th>
              <th>Approval Status</th>
              <th>Rejection Notice</th>
              <th>Level 1</th>
              <th>Level 2</th>
              <th>Level 3</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const overallStatus = getOverallStatus(record);
                const notice = getRejectionNotice(record);
                
                return (
                  <tr key={record.id} className={`status-${overallStatus.split(' ')[0]}`}>
                    <td>{record.supervisorNo}</td>
                    <td>{record.empId}</td>
                    <td>{formatDate(record.arrivalDate)}</td>
                    <td>{formatTime(record.arrivalTime)}</td>
                    <td>{formatTime(record.departureTime)}</td>
                    <td>{record.duration} hrs</td>
                    <td>{record.shiftType}</td>
                    <td>{record.penalty}</td>
                    <td>
                      <span className={`status-badge ${overallStatus.split(' ')[0]}`}>
                        {overallStatus}
                      </span>
                    </td>
                    <td>
                      {notice && (
                        <div className="rejection-notice">
                          {notice}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${record.approvalOfficer01Approval || 'Pending'}`}>
                        {record.approvalOfficer01Approval || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${record.approvalOfficer02Approval || 'Pending'}`}>
                        {record.approvalOfficer02Approval || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${record.approvalOfficer03Approval || 'Pending'}`}>
                        {record.approvalOfficer03Approval || 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="no-records">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rejected Records Section */}
      {filteredRecords.filter(r => getOverallStatus(r).includes('Rejected')).length > 0 && (
        <div className="rejected-section">
          <h3>Rejected Attendance Records</h3>
          <div className="records-table-container">
            <table className="records-table rejected-table">
              <thead>
                <tr>
                  <th>Patrol Leader</th>
                  <th>Officer ID</th>
                  <th>Date</th>
                  <th>Rejection Level</th>
                  <th>Rejection Notice</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords
                  .filter(r => getOverallStatus(r).includes('Rejected'))
                  .map((record) => (
                    <tr key={`rejected-${record.id}`} className="status-Rejected">
                      <td>{record.supervisorNo}</td>
                      <td>{record.empId}</td>
                      <td>{formatDate(record.arrivalDate)}</td>
                      <td>{getOverallStatus(record).match(/Level (\d)/)?.[1] || 'Unknown'}</td>
                      <td className="rejection-notice-cell">
                        {getRejectionNotice(record) || 'No reason provided'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatronLeaderAttendanceRecord;