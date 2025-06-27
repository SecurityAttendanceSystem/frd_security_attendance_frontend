import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import axios from "axios";
import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { 
  MdDashboard, MdSecurity, MdPeople, MdAssignment, MdAccessTime, 
  MdHowToReg, MdListAlt, MdVerifiedUser, MdHome, MdOfflineBolt, 
  MdOpenInBrowser, MdLogout, MdNotifications, MdSettings 
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import SystemUsers from "./SystemUsers";
import CompanyTable from "./CompanyTable";
import UserTable from "./internalUsersView";
import CompanyDetails from "./CompanyDetails";
import CompanyUser from "./CompanyUsers";
import "../styles/AdminDashboard.css";
import SecurityCompanyUsers from "./SecurityCompanyUsers";
import TimeCard from "./TimeCard";
import RegisterInternalUser from "./RegisterInternalUser";
import AttendanceMark from "./AttendanceMarker";
import SecurityStaffForm from "./SecurityStaffForm";
import ViewSecurityEmployee from "./ViewSecurityEmployee";
import AttendanceApprovalSection from "./AttendanceApprovalSection";
import AssignPatrolLeaders from "./AssignPatrolLeaders";
import AttendanceApprovalSection02 from "./AttendanceApprovalSection02";
import AttendanceApprovalSection03 from "./AttendanceApprovalSection03";
import PatronLeaderAttendanceRecord from "./PetronLeaderAttendanceRecord";
import AttendanceRecords from "./AttendanceRecords";
import DefaultComponent from "./DefaultComponent";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const UserRole = {
  Super_Admin: "SuperAdmin",
  patrol_leader: "PatrolLeader",
  company_user: "CompanyUser",
  approval: "Approval",
  approvalOfficer01: "ApprovalOfficer01",
  approvalOfficer02: "ApprovalOfficer02",
  approvalOfficer03: "ApprovalOfficer03",
};

const AdminDashboard = () => {
  const { roleName } = useParams();
  const userRole = roleName || "registered";
  const navigate = useNavigate();
  const { userId, setUser } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [activeSection, setActiveSection] = useState("default");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const [expandedMenuItems, setExpandedMenuItems] = useState({});
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const fetchUsersDetails = () => {
    axios
      .get(`${API_URL}/api/internalUser/getUser/${userId}`)
      .then((response) => {
        setName(response.data.name);
        setEmail(response.data.email);
        setUser(userId, roleName, response.data.name);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

    if (!activeSection) {
      setActiveSection("default");
    }
  };

  useEffect(() => {
    fetchUsersDetails();
  }, []);

  const hasPermission = (allowedRoles) => allowedRoles.includes(userRole);

  const handleLogout = () => {
    toast(
      ({ closeToast }) => (
        <div className="logout-confirmation">
          <p>Are you sure you want to logout?</p>
          <div className="logout-buttons">
            <button
              className="confirm-button"
              onClick={() => {
                localStorage.removeItem("authToken");
                navigate("/");
                closeToast();
              }}
            >
              Yes, Logout
            </button>
            <button className="cancel-button" onClick={closeToast}>
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        className: 'logout-toast'
      }
    );
  };

  const toggleProfileCard = () => {
    setShowProfileCard(!showProfileCard);
  };

  const toggleMenuItem = (itemId) => {
    setExpandedMenuItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const menuGroups = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <MdDashboard />,
      roles: [UserRole.Super_Admin, UserRole.approval, UserRole.company_user, UserRole.patrol_leader, UserRole.approvalOfficer01, UserRole.approvalOfficer02, UserRole.approvalOfficer03],
      items: [
        { id: "default", title: "Home", icon: <MdHome /> }
      ]
    },
    {
      id: "security",
      title: "Security Management",
      icon: <MdSecurity />,
      roles: [UserRole.Super_Admin],
      items: [
        { id: "service-management", title: "Security Companies", icon: <MdPeople /> },
        { id: "security-company-user-management", title: "Security Company Users", icon: <MdPeople /> },
        { id: "security-company-management", title: "Register Security Company", icon: <MdHowToReg /> }
      ]
    },
    {
      id: "user-management",
      title: "User Management",
      icon: <MdPeople />,
      roles: [UserRole.Super_Admin],
      items: [
        { id: "user-management", title: "System Users", icon: <MdPeople /> },
        { id: "internal-users-view", title: "Internal Users", icon: <MdListAlt /> },
        { id: "company-user-management", title: "Assign Company User", icon: <MdAssignment /> },
        { id: "internal-user-registration", title: "Register Internal User", icon: <MdHowToReg /> },
        { id: "security-officer-registration", title: "Register Security Officer", icon: <MdHowToReg /> },
        { id: "security-officer-view", title: "View Security Officer", icon: <MdPeople /> }
      ]
    },
    {
      id: "attendance",
      title: "Attendance",
      icon: <MdAccessTime />,
      roles: [UserRole.Super_Admin, UserRole.patrol_leader, UserRole.approvalOfficer01, UserRole.approvalOfficer02, UserRole.approvalOfficer03],
      items: [
        { id: "Time-card-management", title: "Add Time Card", icon: <MdAccessTime /> },
        { id: "mark-attendance", title: "Mark Attendance", icon: <MdAccessTime /> },
        { id: "attendance-overview", title: "Attendance Overview", icon: <MdListAlt /> },
        { id: "attendance-record", title: "Patrol Leader Records", icon: <MdListAlt /> }
      ]
    },
    {
      id: "approvals",
      title: "Approvals",
      icon: <MdVerifiedUser />,
      roles: [UserRole.Super_Admin, UserRole.approvalOfficer01, UserRole.approvalOfficer02, UserRole.approvalOfficer03],
      items: [
        { id: "attendance-approval-officer01", title: "Officer 01 Approval", icon: <MdVerifiedUser /> },
        { id: "attendance-approval-officer02", title: "Officer 02 Approval", icon: <MdVerifiedUser /> },
        { id: "attendance-approval-officer03", title: "Officer 03 Approval", icon: <MdVerifiedUser /> }
      ]
    },
    {
      id: "account",
      title: "Account",
      icon: <MdSettings />,
      roles: [UserRole.Super_Admin, UserRole.approval, UserRole.company_user, UserRole.patrol_leader, UserRole.approvalOfficer01, UserRole.approvalOfficer02, UserRole.approvalOfficer03],
      items: [
        { id: "logout", title: "Logout", icon: <MdLogout /> }
      ]
    }
  ];

  return (
    <div className={`dashboard-container`}>
      <ToastContainer />
      
      {/* Mobile Menu Toggle */}
      <motion.div 
        className="mobile-menu-toggle"
        whileTap={{ scale: 0.9 }}
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </motion.div>

      {/* Sidebar */}
      <motion.aside 
        className={`sidebar ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}
        initial={{ x: 0 }}
        animate={{ x: mobileMenuOpen }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="sidebar-header">
          <motion.img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/SLTMobitel_Logo.svg/1200px-SLTMobitel_Logo.svg.png"
            alt="SLT Mobitel Logo"
            className="sidebar-logo"
            whileHover={{ scale: 1.05 }}
          />
          <div className="sidebar-header-info">
            <p className="app-name">Security Attendance</p>
            <p className="app-version">v2.0</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuGroups.map((group) => (
            hasPermission(group.roles) && (
              <div key={group.id} className="menu-group">
                <div 
                  className="group-header" 
                  onClick={() => toggleMenuItem(group.id)}
                >
                  <span className="group-icon">{group.icon}</span>
                  <span className="group-title">{group.title}</span>
                  {expandedMenuItems[group.id] ? <FaChevronDown /> : <FaChevronRight />}
                </div>
                <AnimatePresence>
                  {expandedMenuItems[group.id] && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {group.items.map((item) => (
                        <motion.li 
                          key={item.id}
                          whileHover={{ x: 5 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <button
                            onClick={() => {
                              if (item.id === "logout") {
                                handleLogout();
                              } else {
                                setActiveSection(item.id);
                                setMobileMenuOpen(false);
                              }
                            }}
                            className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                          >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.title}</span>
                          </button>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-mini-profile">
            <FaUserCircle className="mini-profile-icon" />
            <div>
              <p className="mini-profile-name">{name}</p>
              <p className="mini-profile-role">{roleName}</p>
            </div>
          </div>
          <p className="copyright">© {new Date().getFullYear()} SLT Mobitel</p>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="breadcrumbs">
              <span className="active-section">
                {menuGroups.flatMap(group => 
                  group.items.find(item => item.id === activeSection)?.title
                )}
              </span>
            </div>
            
            <div className="header-right">
              <div className="header-date">
                <span className="current-date">{currentDate}</span>
                <span className="current-time">{currentTime}</span>
              </div>
              
              <div className="user-profile" onClick={toggleProfileCard}>
                <div className="profile-avatar">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <span className="profile-name">{name}</span>
                  <span className="profile-role">{roleName}</span>
                </div>
                <FaChevronDown className={`profile-chevron ${showProfileCard ? 'open' : ''}`} />
              </div>
            </div>
          </div>
        </header>

        {/* Profile Card Dropdown */}
        <AnimatePresence>
          {showProfileCard && (
            <motion.div 
              className="profile-card"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="profile-card-header">
                <div className="card-user-info">
                  <h4>{name}</h4>
                  <p>{email}</p>
                  <p className="user-role">{roleName}</p>
                </div>
              </div>
              <div className="profile-card-footer">
                <button className="logout-button" onClick={handleLogout}>
                  <MdLogout className="logout-icon" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Content */}
        <div className="content-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === "default" && <DefaultComponent />} 
              {activeSection === "service-management" && <CompanyTable />}
              {activeSection === "security-company-user-management" && <SecurityCompanyUsers />}
              {activeSection === "user-management" && <SystemUsers />}
              {activeSection === "internal-users-view" && <UserTable />}
              {activeSection === "security-company-management" && <CompanyDetails />}
              {activeSection === "company-user-management" && <CompanyUser />}
              {activeSection === "internal-user-registration" && <RegisterInternalUser />}
              {activeSection === "Time-card-management" && <TimeCard />}
              {activeSection === "mark-attendance" && <AttendanceMark />}
              {activeSection === "security-officer-registration" && <SecurityStaffForm />}
              {activeSection === "security-officer-view" && <ViewSecurityEmployee />}
              {activeSection === "attendance-record" && <PatronLeaderAttendanceRecord />}
              {activeSection === "attendance-approval-officer01" && <AttendanceApprovalSection />}
              {activeSection === "attendance-approval-officer02" && <AttendanceApprovalSection02 />}
              {activeSection === "attendance-approval-officer03" && <AttendanceApprovalSection03 />}
              {activeSection === "attendance-overview" && <AttendanceRecords />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;