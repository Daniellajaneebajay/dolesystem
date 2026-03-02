import React, { useState } from "react";
import "./UserManagement.css";
import { 
  FaSearch, FaFilter, FaPlus, FaEdit, FaEllipsisV, 
  FaTrash, FaUserSlash, FaChevronLeft, FaChevronRight, 
  FaUsers, FaCheckCircle, FaTimesCircle, FaHistory,
  FaCaretDown, FaTimes 
} from "react-icons/fa";

const usersData = [
  { name: "Matthew Wilton", position: "SR. LEO", email: "email@dole.gov.ph", date: "06-03-2021", img: "/assets/unknown2.jpg" },
  { name: "Sarah Martinez", position: "SR. LEO", email: "email@dole.gov.ph", date: "06-03-2021", img: "/assets/unknown.jpg" },
  { name: "Christopher Brown", position: "SR. LEO", email: "email@dole.gov.ph", date: "20-03-2021", img: "/assets/unknown2.jpg" },
  { name: "Emily Thompson", position: "SR. LEO", email: "email@dole.gov.ph", date: "11-06-2021", img: "/assets/unknown.jpg" },
  { name: "David Smith", position: "SR. LEO", email: "email@dole.gov.ph", date: "28-06-2021", img: "assets/unknown2.jpg" }
];

function UserManagement() {
  const [menu, setMenu] = useState(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="um-main-layout">
      {/* TABLE CONTAINER */}
      <div className="um-table-container">
        <header className="um-blue-banner">
          <div className="banner-text">
            <h1>User Management</h1>
            <p>Manage users, roles, and access permissions</p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <FaPlus /> Add New
          </button>
        </header>

        <div className="um-card-body">
          <div className="um-search-row">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search by Name, Position or Status..." />
            </div>
            <div className="filter-row">
              <FaFilter />
              <span>Filters:</span>
              
              {/* UPDATED ROLES DROPDOWN */}
              <select>
                <option>All Roles</option>
                <option>SR. LEO</option>
                <option>LEO</option>
                <option>LEO I</option>
                <option>LEO II</option>
                <option>LEO III</option>
              </select>

              {/* UPDATED STATUS DROPDOWN */}
              <select>
                <option>All Status</option>
                <option>Active</option>
                <option>Unactive</option>
                <option>All Officers</option>
              </select>
            </div>
          </div>

          <div className="officers-list-header">
            <h3>Officers</h3>
            <FaCaretDown />
          </div>

          <table className="um-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div className="user-cell">
                      <img src={u.img} alt={u.name} className="user-profile-img" />
                      {u.name}
                    </div>
                  </td>
                  <td>{u.position}</td>
                  <td>{u.email}</td>
                  <td>{u.date}</td>
                  <td className="action-btns">
                    <FaEdit className="edit-icon-btn" />
                    <div className="three-dots-container">
                      <FaEllipsisV className="dots-icon" onClick={() => setMenu(menu === i ? null : i)} />
                      {menu === i && (
                        <div className="um-dropdown">
                          <button className="delete-opt"><FaTrash /> Delete</button>
                          <button className="disable-opt"><FaUserSlash /> Disable (Absent)</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="um-pagination">
            <div className="rows-selection">
              Rows per page: <select><option>10</option></select> of 140 rows
            </div>
            <div className="page-nav">
              <FaChevronLeft className="page-arrow" />
              <span className="page-num active">1</span>
              <span className="page-num">2</span>
              <span className="page-num">3</span>
              <FaChevronRight className="page-arrow next-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR STATS */}
      <aside className="um-stats-panel">
        <h3>Quick Stats</h3>
        <div className="um-stat-card">
          <div className="stat-text"><h2>10</h2><p>Total Officers</p></div>
          <FaUsers className="stat-icon" />
        </div>
        <div className="um-stat-card green-light">
          <div className="stat-text"><h2>8</h2><p>Available</p></div>
          <FaCheckCircle className="stat-icon green" />
        </div>
        <div className="um-stat-card red-light">
          <div className="stat-text"><h2>2</h2><p>Unavailable</p></div>
          <FaTimesCircle className="stat-icon red" />
        </div>
        <div className="um-stat-card orange-light">
          <div className="stat-text"><h2>10</h2><p>Recent Edits</p></div>
          <FaHistory className="stat-icon orange" />
        </div>
      </aside>

      {/* ADD NEW USER MODAL FORM - SYNTAX FIXED HERE */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New User</h3>
              <FaTimes className="close-icon" onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Name</label>
                <input type="text" placeholder="Enter Fullname" />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" placeholder="Enter email address" />
              </div>
              <div className="input-group">
                <label>Position</label>
                <select>
                  <option>Select Position</option>
                  <option>SR. LEO</option>
                  <option>LEO</option>
                  <option>LEO I</option>
                  <option>LEO II</option>
                  <option>LEO III</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="input-group">
                <label>Set Password</label>
                <input type="password" placeholder="Enter Password" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="confirm-btn" onClick={() => setShowModal(false)}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default UserManagement;