import React from 'react';
import './Schedule.css';
import { FaChevronLeft, FaChevronRight, FaClock, FaChevronDown } from 'react-icons/fa';

const Schedule = () => {
  const getDayStatus = (day) => {
    if ([5, 15, 17, 18, 23, 24].includes(day)) return "available";
    if ([1, 12, 25].includes(day)) return "limited";
    if ([2, 3, 10, 16, 19, 26].includes(day)) return "booked";
    return "";
  };

  return (
    <div className="schedule-page-wrapper">
      {/* This is the red shape in the background on the right */}
      <div className="red-bg-accent"></div>

      <div className="schedule-container">
        {/* LEFT COLUMN: CREATE SCHEDULE */}
        <div className="create-card">
          <h2 className="section-title">Create New Schedule</h2>
          
          <div className="input-group">
            <label>Purpose</label>
            <input type="text" className="input-field" placeholder="Type here" />
          </div>

          <div className="row-group">
            <div className="input-group">
              <label>Available day</label>
              <div className="select-wrapper">
                <select className="input-field">
                  <option>Tuesday 13 Feb, 2026</option>
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>
            <div className="input-group">
              <label>Available time</label>
              <div className="select-wrapper">
                <select className="input-field">
                  <option>09:30 AM - 10:30 AM</option>
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>
          </div>

          <label className="group-label">Claims/Issues</label>
          <div className="row-group">
            <div className="input-group">
              <label className="sub-label">Labor Standards Violations</label>
              <div className="select-wrapper">
                <select className="input-field">
                  <option>Select</option>
                  <option>Minimum Wage</option>
                  <option>Overtime Pay</option>
                  <option>13th Month Pay</option>
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>
            <div className="input-group">
              <label className="sub-label">Other Issues</label>
              <div className="select-wrapper">
                <select className="input-field">
                  <option>Select</option>
                  <option>Illegal Dismissal</option>
                  <option>Constructive Dismissal</option>
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Available Hearing Officer</label>
            <div className="select-wrapper">
              <select className="input-field">
                <option>Select Officer Name</option>
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>

          <p className="event-summary">
            Hearing Event: <strong>February 13, from 9:30 am - 10:30 am</strong>
          </p>

          <button className="create-btn">Create Schedule</button>
        </div>

        {/* RIGHT COLUMN: CALENDAR */}
        <div className="calendar-card">
          {/* Availability Legend as requested */}
          <div className="legend-bar">
            <span><span className="dot available-dot"></span> Available</span>
            <span><span className="dot limited-dot"></span> Limited Slots</span>
            <span><span className="dot booked-dot"></span> Fully Booked</span>
          </div>

          <div className="calendar-main-section">
            <div className="calendar-header">
              <FaChevronLeft className="nav-arrow" />
              <h3>February 2026</h3>
              <FaChevronRight className="nav-arrow" />
            </div>

            <div className="calendar-grid">
              {['Monday', 'Tuesday', 'Wedsnesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <div key={d} className="day-name">{d}</div>
              ))}
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => {
                const isWeekend = (day % 7 === 6 || day % 7 === 0);
                return (
                  <div key={day} className={`day-num ${isWeekend ? 'weekend' : getDayStatus(day)}`}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="recent-section">
            <h4>Recent Hearings</h4>
            {[1, 2, 3].map((i) => (
              <div key={i} className="hearing-item">
                <div className="hearing-date-box">Tuesday<br/><span>10</span></div>
                <div className="hearing-info">
                  <div className="hearing-title">Hearing Review</div>
                  <div className="hearing-time"><FaClock /> 09:00 to 10:00 am <span><FaClock /> 30 min</span></div>
                </div>
                <button className="view-btn">View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;