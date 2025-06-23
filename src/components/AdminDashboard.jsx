import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import axios from "axios";
import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { MdDashboard, MdSecurity, MdPeople, MdAssignment, MdAccessTime, MdHowToReg, MdListAlt, MdVerifiedUser, MdHome, MdOfflineBolt, MdOpenInBrowser, MdLogout } from "react-icons/md";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const now = new Date();
  const currentDate = now.toLocaleDateString();
  const currentTime = now.toLocaleTimeString();

  const fetchUsersDetails = () => {
    axios
      .get(`https://frdattendancemanagementsystemtestdiployment-production.up.railway.app/api/internalUser/getUser/${userId}`)
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

  // In your component
  const handleLogout = () => {
    toast(
      ({ closeToast }) => (
        <div>
          Are you sure you want to logout?
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={() => {
                localStorage.removeItem("authToken");
                navigate("/");
                closeToast(); // Close the toast
              }}
              style={{ marginRight: '10px' }}
            >
              Yes
            </button>
            <button onClick={closeToast}>No</button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };


  const toggleProfileCard = () => {
    setShowProfileCard(!showProfileCard);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    {
      id: "default",
      title: "Home",
      icon: <MdHome />,
      roles: [UserRole.Super_Admin, UserRole.approval, UserRole.company_user, UserRole.patrol_leader, UserRole.approvalOfficer01, UserRole.approvalOfficer02, UserRole.approvalOfficer03]
    },
    {
      id: "service-management",
      title: "Security Companies",
      icon: <MdSecurity />,
      roles: [UserRole.Super_Admin]
    },
    {
      id: "security-company-user-management",
      title: "Security Company Users",
      icon: <MdPeople />,
      roles: [UserRole.Super_Admin]
    },
    {
      id: "Time-card-management",
      title: "Add Time Card",
      icon: <MdAccessTime />,
      roles: [UserRole.Super_Admin]
    },
    {
      id: "user-management",
      title: "System Users",
      icon: <MdPeople />,
      roles: [UserRole.Super_Admin]
    },
    {
      id: "internal-users-view",
      title: "Internal users view",
      icon: <MdListAlt />,
      roles: [UserRole.Super_Admin]
    },
    {
      id: "security-company-management",
      title: "Register Security Company",
      icon: <MdHowToReg />,
      roles: [UserRole.Super_Admin]
    },
    {
      id: "company-user-management",
      title: "Assign Company User",
      icon: <MdAssignment />,
      roles: [UserRole.Super_Admin]
    },
    {
      id: "internal-user-registration",
      title: "Register Internal User",
      icon: <MdHowToReg />,
      roles: [UserRole.Super_Admin]
    },
    {
      id: "mark-attendance",
      title: "Mark Attendance",
      icon: <MdAccessTime />,
      roles: [UserRole.Super_Admin, UserRole.patrol_leader]
    },
    {
      id: "security-officer-registration",
      title: "Register Security Officer",
      icon: <MdHowToReg />,
      roles: [UserRole.Super_Admin]
    },
    {
      id: "security-officer-view",
      title: "View Security Officer",
      icon: <MdPeople />,
      roles: [UserRole.Super_Admin]
    },
    {
      id: "attendance-overview",
      title: "Attendance Overview",
      icon: <MdListAlt />,
      roles: [UserRole.Super_Admin, UserRole.patrol_leader, UserRole.approvalOfficer01, UserRole.approvalOfficer02, UserRole.approvalOfficer03,UserRole.company_user]
    },
    {
      id: "attendance-record",
      title: "Patrol Leader Attendance Record",
      icon: <MdListAlt />,
      roles: [UserRole.Super_Admin, UserRole.patrol_leader]
    },
    {
      id: "attendance-approval-officer01",
      title: "Approval - Officer 01",
      icon: <MdVerifiedUser />,
      roles: [UserRole.Super_Admin, UserRole.approvalOfficer01]
    },
    {
      id: "attendance-approval-officer02",
      title: "Approval - Officer 02",
      icon: <MdVerifiedUser />,
      roles: [UserRole.Super_Admin, UserRole.approvalOfficer02]
    },
    {
      id: "attendance-approval-officer03",
      title: "Approval - Officer 03",
      icon: <MdVerifiedUser />,
      roles: [UserRole.Super_Admin, UserRole.approvalOfficer03]
    },
    {
      id: "logout",
      title: "Logout",
      icon: <MdLogout/>,
      roles: [UserRole.Super_Admin, UserRole.approval, UserRole.company_user, UserRole.patrol_leader, UserRole.approvalOfficer01, UserRole.approvalOfficer02, UserRole.approvalOfficer03]
    },
  ];

  return (
    <div className={`dashboard-container ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <ToastContainer/>
      {/* Mobile Menu Toggle */}
      <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="sidebar-header">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/SLTMobitel_Logo.svg/1200px-SLTMobitel_Logo.svg.png"
            alt="SLT Mobitel Logo"
            className="sidebar-logo"
          />
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              hasPermission(item.roles) && (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (item.id === "logout") {
                        handleLogout(); // call logout function
                      } else {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  >
                    <span className="nav-icon logout">{item.icon}</span>
                    <span className="nav-text logout">{item.title}</span>
                  </button>
                </li>
              )
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <p className="copyright">© {new Date().getFullYear()} SLT Mobitel</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              <MdDashboard className="title-icon" />
              {menuItems.find(item => item.id === activeSection)?.title || "Security Attendance Dashboard"}
            </h1>
            
            <div className="header-actions">
              <div className="user-profile">
                <FaUserCircle className="profile-icon" />
                <span className="user-name">Hi, {name} | {userId} | {roleName} | {currentDate} | {currentTime}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="content-container">
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
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;