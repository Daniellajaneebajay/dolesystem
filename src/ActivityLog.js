import React from 'react';
import './ActivityLog.css';
import { FaArrowLeft, FaTrashAlt, FaChevronDown } from 'react-icons/fa';

const ActivityLog = ({ onBack }) => {
  const logData = Array(8).fill({
    no: 1,
    type: "Physical",
    from: "10 Feb 2026 - 9:30 AM",
    to: "10 Feb 2026 - 10:00 AM",
    duration: "30 min",
    purpose: "Livelihood Conciliation for Hanapbuhay",
    status: "Done"
  });

  return (
    <div className="activity-log-page">
      <div className="log-header-section">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Activity Log
        </button>
      </div>

      <div className="log-container-card">
        <div className="log-filter-bar">
          <div className="select-wrapper date-filter">
            <select className="log-dropdown">
              <option value="">Select</option>
              <option value="2026-02-10">February 10, 2026</option>
            </select>
            <FaChevronDown className="dropdown-icon" />
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="activity-table">
            <thead>
              <tr>
                <th>No. Hearing</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Duration</th>
                <th>Purpose/Reason</th>
                <th>
                  {/* STATUS DROPDOWN HEADER */}
                  <div className="status-filter-wrapper">
                    <span>Status</span>
                    <div className="icon-dropdown-trigger">
                      <FaChevronDown size={10} />
                      <select className="hidden-status-select">
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logData.map((row, index) => (
                <tr key={index}>
                  <td>{row.no}</td>
                  <td>{row.type}</td>
                  <td>{row.from}</td>
                  <td>{row.to}</td>
                  <td>{row.duration}</td>
                  <td className="purpose-cell">{row.purpose}</td>
                  <td><span className="status-label-text">{row.status}</span></td>
                  <td>
                    <button className="delete-btn"><FaTrashAlt /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;