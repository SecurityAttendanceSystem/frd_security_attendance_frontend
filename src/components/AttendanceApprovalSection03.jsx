import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import '../styles/AttendanceApproval.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const AttendanceApprovalSection03 = () => {
  const { userRole } = useUser();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectingRecord, setRejectingRecord] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');

  const isApprovalOfficer = userRole === 'ApprovalOfficer03' || 'SuperAdmin';

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/attendance/getAll`);
      setAttendanceRecords(response.data);
      
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };


  //approval officer 01 
  const handleApprovalChange = async (recordId, isApproved) => {
    try {
      if (isApproved) {
        await axios.put(
          `${API_URL}/api/attendance/updateApprovalOfficer03/${recordId}`,
          'Approved',
          { headers: { 'Content-Type': 'text/plain' } }
        );

        setAttendanceRecords(prevRecords => 
          prevRecords.map(record => 
            record.id === recordId 
              ? { ...record, approvalOfficer03Approval: 'Approved' } 
              : record
          )
        );
      } else {
        // Set the record being rejected to show the popup
        const recordToReject = attendanceRecords.find(r => r.id === recordId);
        setRejectingRecord(recordToReject);
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
    }
  };

  const handleRejectWithComment = async () => {
    if (!rejectingRecord) return;
    
    try {
      // First send the rejection with comment
      const rejectionResponse = await axios.put(
        `${API_URL}/api/attendance/approvalOfficer03Rejected/${rejectingRecord.id}`,
        { comment: rejectionComment }
      );

      // Then update the approval status
      await axios.put(
        `${API_URL}/api/attendance/updateApprovalOfficer03/${rejectingRecord.id}`,
        'Rejected',
        { headers: { 'Content-Type': 'text/plain' } }
      );

      // Update UI with both status and comment
      setAttendanceRecords(prevRecords => 
        prevRecords.map(record => 
          record.id === rejectingRecord.id 
            ? { 
                ...record, 
                approvalOfficer03Approval: 'Rejected',
                rejectionNotice: rejectionComment 
              } 
            : record
        )
      );

      // Reset rejection state
      setRejectingRecord(null);
      setRejectionComment('');
    } catch (error) {
      console.error('Error rejecting attendance record:', error);
    }
  };

  const cancelRejection = () => {
    setRejectingRecord(null);
    setRejectionComment('');
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (filter !== 'All' && record.approvalOfficer03Approval !== filter) {
      return false;
    }
    
    if (searchTerm && 
        !record.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !record.empId?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

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
    <div className={`attendance-approval-container ${rejectingRecord ? 'blur-background' : ''}`}>
      <ToastContainer/>
      {/* Rejection Comment Modal - Centered with blur background */}
      {rejectingRecord && (
        <div className="modal-overlay">
          <div className="rejection-modal centered-modal">
            <h3>Add Rejection Comment for {rejectingRecord.empId}</h3>
            <textarea
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={4}
              required
            />
            <div className="modal-actions">
              <button onClick={cancelRejection} className="cancel-btn">
                Cancel
              </button>
              <button 
                onClick={handleRejectWithComment} 
                className="confirm-reject-btn"
                disabled={!rejectionComment.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

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
              <th>Security Officer ID</th>
              <th>Date</th>
              <th>Arrival</th>
              <th>Departure</th>
              <th>Duration</th>
              <th>Shift</th>
              <th>Panelty</th>
              <th>Approval Officer 03 Status</th>
              <th>Rejection Notice</th>
              {isApprovalOfficer && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.filter((record)=>record.approvalOfficer02Approval==="Approved").map((record) => (
                <tr key={record.id} className={`status-${record.approvalOfficer03Approval}`}>
                  <td>{record.supervisorNo}</td>
                  <td>{record.empId}</td>
                  <td>{formatDate(record.arrivalDate)}</td>
                  <td>{formatTime(record.arrivalTime)}</td>
                  <td>{formatTime(record.departureTime)}</td>
                  <td>{record.duration} hrs</td>
                  <td>{record.shiftType}</td>
                  <td>{record.penalty}</td>
                  <td>
                    <span className={`status-badge ${record.approvalOfficer03Approval || 'Pending'}`}>
                      {record.approvalOfficer03Approval || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {record.rejectionNotice && (
                      <div className="rejection-notice">
                        {record.rejectionNotice}
                      </div>
                    )}
                  </td>
                  {isApprovalOfficer && (
                    <td>
                      <div className="approval-actions">
                        <label className="approval-checkbox">
                          <input
                            type="checkbox"
                            checked={record.approvalOfficer03Approval === 'Approved'}
                            onChange={(e) => handleApprovalChange(record.id, e.target.checked)}
                            disabled={record.approvalOfficer03Approval === 'Rejected'}
                          />
                          <span className="checkmark"></span>
                          Approve
                        </label>
                        <button
                          className="reject-btn"
                          onClick={() => handleApprovalChange(record.id, false)}
                          disabled={record.approvalOfficer03Approval === 'Approved'}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isApprovalOfficer ? 11 : 10} className="no-records">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceApprovalSection03;