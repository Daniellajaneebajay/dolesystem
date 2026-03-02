import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserEdit, FaBars, FaTimes } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Schedule", path: "/schedule" },
    { name: "Report", path: "/report" },
    { name: "Settings", path: "/settings" },
    { name: "Logout", path: "/logout" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* INLINE CSS: This fixes the "Module not found" error permanently */}
      <style>{`
        /* Hamburger Design from your Image */
        .menu-toggle {
          position: fixed;
          top: 10px;
          left: 20px;
          z-index: 1000;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #070583fa; /* Matching the gray/blue circle in your image */
          background: transparent;
          color: #070583fa;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.3s ease;
        }

        .menu-toggle:hover {
          border-color: #070583fa;
          color: #070583fa;
        }

        /* Adjust button style when sidebar is OPEN */
        .menu-toggle.is-open {
          color: white;
          border: none;        /* This removes the circle border */
          background: none;    /* Ensures there is no background color */
          position: absolute; 
          left: 190px;         /* Adjusted position since the circle is gone */
          top: 5px;           
          font-size: 18px;     /* Optional: makes the 'X' slightly larger */
        }
          
        /* Sidebar Container */
        .sidebar {
          width: 180px;
          background: #030a49;
          color: white;
          min-height: 100vh;
          padding: 20px;
          text-align: center;
          transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        /* Sliding Logic */
        .sidebar.closed {
          width: 0;
          padding: 20px 0;
          transform: translateX(-100%);
        }

        /* Logo/Header */
        .gov-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 5px;
          margin-bottom: 30px;
          min-width: 150px;
        }

        .gov-logo {
          width: 35px;
          height: 35px;
          object-fit: contain;
        }

        .gov-text {
          text-align: left;
          line-height: 1.2;
        }

        .gov-text h4 { font-size: 8px; margin: 0; font-weight: bold; }
        .gov-text p { font-size: 7px; margin: 1px 0; }

        /* Profile Section */
        .profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 12px;
          min-width: 150px;
        }

        .profile img {
          width: 75px;
          height: 75px;
          border-radius: 50%;
          margin-top: 30px;
          margin-bottom: 12px;
          object-fit: cover;
          border: 2px solid #d9dcdd;
        }

        .ad-name { font-size: 14px; font-weight: bold; margin: 0; color: white; }
        .admin-name p { font-size: 11px; margin: 4px 0; color: #cbd5e0; }

        .edit-profile {
          margin-top: 5px;
          font-size: 11px;
          color: #4ba2f3;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        /* Navigation Links */
        nav {
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          min-width: 150px;
        }

        .nav-link {
          display: block;
          color: white;
          text-decoration: none;
          padding: 10px;
          margin-top: 4px;
          width: 100%;
          font-size: 14px;
          transition: 0.2s;
        }

        .nav-link:hover, .nav-link.active {
          background: #041d47;
          border-radius: 5px;
          color: #00c6ff;
        }
      `}</style>

      {/* --- SIDEBAR HTML --- */}
      <button 
        className={`menu-toggle ${isOpen ? "is-open" : ""}`} 
        onClick={toggleSidebar}
        title={isOpen ? "Close Menu" : "Open Menu"}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="gov-header">
          <img src="/assets/logo.svg" alt="Logo" className="gov-logo" />
          <div className="gov-text">
            <h4>Republic of the Philippines</h4>
            <p>Department of Labor and Employment</p>
            <p>Regional Office No. X</p>
            <p>Cagayan de Oro - Field Office</p>
          </div>
        </div>

        <div className="profile">
          <img src="/assets/unknown.jpg" alt="profile" />
          <div className="admin-name">
            <h4 className="ad-name">Nancy Wheeler</h4>
            <p>nancy.wheeler@gmail.com</p>
          </div>
          <div className="edit-profile">
            <FaUserEdit />
            <span>Edit Profile</span>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <a
              key={item.name}
              href="#"
              className={location.pathname === item.path ? "nav-link active" : "nav-link"}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;