import React, { useState } from 'react';
import './Schedule.css';
import ActivityLog from './ActivityLog'; // Import the log component we created
import { FaChevronLeft, FaChevronRight, FaClock, FaChevronDown } from 'react-icons/fa';

const Schedule = () => {
  // --- NEW STATE FOR NAVIGATION ---
  const [showLog, setShowLog] = useState(false);

  // Setup state to track the currently viewed month/year
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));

  // Calendar Logic Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startingOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Handlers for navigation arrows
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDayStatus = (day) => {
    if ([5, 15, 17, 18, 23, 24].includes(day)) return "available";
    if ([1, 12, 25].includes(day)) return "limited";
    if ([2, 3, 10, 16, 19, 26].includes(day)) return "booked";
    return "";
  };

  // --- CONDITIONAL RENDERING ---
  // If showLog is true, render the ActivityLog component instead
  if (showLog) {
    return <ActivityLog onBack={() => setShowLog(false)} />;
  }

  return (
    <div className="schedule-page-wrapper">
      <div className="red-bg-accent"></div>

      <div className="schedule-container">
        {/* LEFT COLUMN: CREATE SCHEDULE */}
        <div className="create-card">
          <h2 className="section-title">Create New Schedule</h2>
          
          <div className="input-group">
            <label>Purpose:</label>
            <input type="text" className="sched-input" placeholder="Reason" />
          </div>

           <div className="row-group">
            <div className="input-group">
              <label>Requesting Party:</label>
            <input type="text" className="sched-input-output" placeholder="Name" />
            </div>
            <div className="input-group">
              <label>Responding Party:</label>
            <input type="text" className="sched-input-output" placeholder="Name" />
            </div>
          </div>

          <div className="row-group">
            <div className="input-group">
              <label>Available day:</label>
            <input type="text" className="sched-input-output" placeholder="Month|Day|Year" />
            </div>
            <div className="input-group">
              <label>Available time:</label>
              <div className="select-wrapper">
                <select className="sched-input">
                  <option>Select</option>
                  <option>8:30 am to 9:00 am</option>
                  <option>9:00 am to 9:30 am</option>
                  <option>9:30 am to 10:00 am</option>
                  <option>10:00 am to 10:30 am</option>
                  <option>10:30 am to 11:00 am</option>
                  <option>11:00 am to 11:30 am</option>
                  <option>11:30 am to 12:00 pm</option>
                  <option>1:00 pm to 1:30 pm</option>
                  <option>1:30 pm to 2:00 pm</option>
                  <option>2:00 pm to 2:30 pm</option>
                  <option>2:30 pm to 3:00 pm</option>
                  <option>3:00 pm to 3:30 pm</option>
                  <option>3:30 pm to 4:00 pm</option>
                  <option>4:00 pm to 4:30 pm</option>
                  <option>4:30 pm to 5:00 pm</option>
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
                <select className="sched-input">
                  <option>Select</option>
                  <option>Minimum Wage</option>
                  <option>COLA</option>
                  <option>Night Shift Differential</option>
                  <option>Overtime Pay</option>
                  <option>Holiday Pay</option>
                  <option>13th Month Pay</option>
                  <option>Service Charge</option>
                  <option>Premium Pay for Rest Day</option>
                  <option>Premium Pay for Special Day</option>
                  <option>Service Incentive Leave</option>
                  <option>Maternity Leave</option>
                  <option>Paternity Leave</option>
                  <option>Parental Leave for Solo Parent</option>
                  <option>Leave for Victims of VAWC</option>
                  <option>Special Leave for Women</option>
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>
            <div className="input-group">
              <label className="sub-label">Other Issues:</label>
            <input type="text" className="sched-input-output" placeholder="Type here" />
            </div>
          </div>

          <div className="input-group">
              <label className="sub-label">Available Hearing Officer</label>
              <div className="select-wrapper">
                <select className="sched-input">
                  <option>Select Officer Name</option>
                  <option>APARECIO, Harold D.</option>
                  <option>CALING, Mhardy Mae V.</option>
                  <option>CANO, Paolo Miguel P.</option>
                  <option>BUSANGILAN, Rommyl Rey C.</option>
                  <option>CASIÑO, Roy S.</option>
                  <option>TALON, Sittie Nashiba D.</option>
                </select>
                <FaChevronDown className="select-icon" />
              </div>
            </div>

          <p className="event-summary">
            Hearing Event: <strong>{monthName} 13, {year} from 9:30 am - 10:30 am</strong>
          </p>

          <button className="create-btn">Create Schedule</button>
        </div>

        {/* RIGHT COLUMN: CALENDAR */}
        <div className="calendar-card">
          <div className="legend-bar">
            <span><span className="dot available-dot"></span> Available</span>
            <span><span className="dot limited-dot"></span> Limited Slots</span>
            <span><span className="dot booked-dot"></span> Fully Booked</span>
          </div>

          <div className="calendar-main-section">
            <div className="calendar-header">
              <FaChevronLeft className="nav-arrow" onClick={handlePrevMonth} style={{cursor: 'pointer'}} />
              <h3>{monthName} {year}</h3>
              <FaChevronRight className="nav-arrow" onClick={handleNextMonth} style={{cursor: 'pointer'}} />
            </div>

            <div className="calendar-grid">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <div key={d} className="day-name">{d.substring(0, 3)}</div>
              ))}
              
              {Array.from({ length: startingOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="day-num empty"></div>
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayOfWeek = (startingOffset + day - 1) % 7;
                const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

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
                {/* --- CLICK HANDLER ADDED HERE --- */}
                <button 
                  className="view-btn" 
                  onClick={() => setShowLog(true)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
