import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import '../styles/AttendanceApproval.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdDownload } from "react-icons/md";
import logo from "../assets/logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL;

const AttendanceRecords = () => {
  const { userId, userRole } = useUser();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceNumberFilter, setServiceNumberFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [hasFilters, setHasFilters] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState('');

  const isCompanyUser = userRole === 'CompanyUser';
  const approvalLevel = userRole.includes('ApprovalOfficer') 
    ? parseInt(userRole.replace('ApprovalOfficer', '')) 
    : null;

  useEffect(() => {
    if (isCompanyUser) {
      fetchCompanyDetails();
    } else {
      fetchAttendanceRecords();
    }
  }, []);

  useEffect(() => {
    const hasActiveFilters = searchTerm || serviceNumberFilter || dateFilter;
    setHasFilters(hasActiveFilters);
    applyFilters();
  }, [attendanceRecords, searchTerm, serviceNumberFilter, dateFilter]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      // Fetch company details for the logged-in company user
      const response = await axios.get(`${API_URL}/api/companyUser/getCompanyUser/${userId}`);
      const companyId = response.data.company.id;
      console.log(response.data)
      console.log(companyId)
      setCompanyId(companyId);
      
      // Fetch company name
      const companyResponse = await axios.get(`${API_URL}/api/securityCompany/getCompany/${companyId}`);
      setCompanyName(companyResponse.data.companyName);
      console.log(companyResponse.data.companyName)
      console.log(companyResponse.data)
      
      // Now fetch attendance records for this company
      await fetchAttendanceRecords(companyId);
    } catch (error) {
      console.error('Error fetching company details:', error);
      toast.error('Failed to load company information');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (specificCompanyId = null) => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/attendance/getAll`;
      
      // If we're fetching for a specific company, use a different endpoint
      if (specificCompanyId) {
        url = `${API_URL}/api/attendance/getSpecificAttendanceByCompanyId/${specificCompanyId}`;
      }
      
      const response = await axios.get(url);
      setAttendanceRecords(response.data);
      console.log('Attendance records fetched:', response.data);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const downloadAttendancePDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape'
      });

      if (logo) {
        const response = await fetch(logo);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = function() {
          const base64data = reader.result;
          doc.addImage(base64data, "PNG", 10, 10, 40, 20);
          addContentToPDF(doc);
        };
        
        reader.readAsDataURL(blob);
      } else {
        addContentToPDF(doc);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const addContentToPDF = (doc) => {
    doc.setFontSize(14);
    doc.text("Attendance Records Report", logo ? 55 : 15, 16);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, logo ? 55 : 15, 22);
    doc.text(`Company: ${isCompanyUser ? companyName : 'All Companies'}`, logo ? 55 : 15, 28);
    
    const headers = [
      'Patrol Leader',
      'Officer ID',
      'Date',
      'Arrival',
      'Departure',
      'Duration',
      'Shift',
      'Penalty',
      'Status',
      'Notice'
    ];
    
    const body = filteredRecords.map(record => [
      record.supervisorNo || '-',
      record.empId || '-',
      formatDate(record.arrivalDate) || '-',
      formatTime(record.arrivalTime) || '-',
      formatTime(record.departureTime) || '-',
      `${record.duration || '0'} hrs`,
      record.shiftType || '-',
      record.penalty || '-',
      record.approvalOfficer01Approval || 'Pending',
      record.rejectionNotice || '-'
    ]);

    autoTable(doc, {
      head: [headers],
      body: body,
      startY: logo ? 50 : 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' },
        7: { cellWidth: 'auto' },
        8: { cellWidth: 'auto' },
        9: { cellWidth: 'wrap' }
      },
      didDrawCell: (data) => {
        if (data.column.index === 8 && data.cell.raw) {
          const status = data.cell.raw.toLowerCase();
          const colors = {
            approved: [34, 139, 34],
            rejected: [220, 53, 69],
            pending: [253, 126, 20]
          };
          
          if (colors[status]) {
            doc.setTextColor(...colors[status]);
          }
        }
      }
    });

    doc.save(`attendance_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.employeeName || 
        record.empId
      );
    }

    if (serviceNumberFilter) {
      filtered = filtered.filter(record => 
        record.empId
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(record => 
        record.arrivalDate === dateFilter
      );
    }

    setFilteredRecords(filtered);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.slice(0, 5);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const getApprovalStatus = (record) => {
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

  const canApprove = (record) => {
    if (!approvalLevel) return false;
    
    if (approvalLevel === 1) {
      return record.approvalOfficer01Approval === 'Pending';
    }
    if (approvalLevel === 2) {
      return record.approvalOfficer01Approval === 'Approved' && 
             record.approvalOfficer02Approval === 'Pending';
    }
    if (approvalLevel === 3) {
      return record.approvalOfficer02Approval === 'Approved' && 
             record.approvalOfficer03Approval === 'Pending';
    }
    
    return false;
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="attendance-approval-container">
      <div className="approval-header">
        <h2>{isCompanyUser ? `${companyName} Attendance Records` : 'Attendance Records Overview'}</h2>
        <div className="controls">
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="searchTerm">Search:</label>
              <input
                id="searchTerm"
                type="text"
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="dateFilter">Arrival Date:</label>
              <input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setServiceNumberFilter('');
                setDateFilter('');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </button>

            {!isCompanyUser && (
              <button onClick={downloadAttendancePDF} className="clear-filters-btn">
                <MdDownload /> Download Attendance Report
              </button>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
      
      {isCompanyUser && !hasFilters && (
        <div className="no-filters-message">
          <div className="no-filters-content">
            <i className="search-icon-large">👨‍💼</i>
            <h3>View Your Security Staff Attendance</h3>
            <p>Filter by date or employee ID to view attendance records for your security staff</p>
          </div>
        </div>
      )}

      {!isCompanyUser && !hasFilters && (
        <div className="no-filters-message">
          <div className="no-filters-content">
            <i className="search-icon-large">🔍</i>
            <h3>No filters applied</h3>
            <p>Please enter a service number or select a date to view attendance records</p>
          </div>
        </div>
      )}

      {hasFilters && (
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
                <th>Penalty</th>
                <th>Approval Status</th>
                <th>Rejection Notice</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const status = getApprovalStatus(record);
                  const notice = getRejectionNotice(record);
                  const showActions = canApprove(record);
                  
                  return (
                    <tr key={record.id} className={getStatusBadgeClass(status.split(' ')[0])}>
                      <td>{record.supervisorNo}</td>
                      <td>{record.empId}</td>
                      <td>{formatDate(record.arrivalDate)}</td>
                      <td>{formatTime(record.arrivalTime)}</td>
                      <td>{formatTime(record.departureTime)}</td>
                      <td>{record.duration} hrs</td>
                      <td>{record.shiftType}</td>
                      <td>{record.penalty}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(status.split(' ')[0])}`}>
                          {status}
                        </span>
                      </td>
                      <td className="rejection-notice-cell">
                        {notice && (
                          <div className="rejection-notice">
                            {notice}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="no-records">
                    No records found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="summary-footer">
            <div className="summary-section">
              <h3 className="summary-title">Attendance Summary</h3>
              <div className="summary-stats-grid">
                <div className="summary-card">
                  <div className="summary-value">{filteredRecords.length}</div>
                  <div className="summary-label">Total Records</div>
                </div>
                <div className="summary-card approved">
                  <div className="summary-value">
                    {filteredRecords.filter(r => getApprovalStatus(r).includes('Approved')).length}
                  </div>
                  <div className="summary-label">Approved</div>
                </div>
                <div className="summary-card pending">
                  <div className="summary-value">
                    {filteredRecords.filter(r => getApprovalStatus(r) === 'Pending').length}
                  </div>
                  <div className="summary-label">Pending</div>
                </div>
                <div className="summary-card rejected">
                  <div className="summary-value">
                    {filteredRecords.filter(r => getApprovalStatus(r).includes('Rejected')).length}
                  </div>
                  <div className="summary-label">Rejected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRecords;