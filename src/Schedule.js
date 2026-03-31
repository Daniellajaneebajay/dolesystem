import React, { useState } from 'react';
import './Schedule.css';
import ActivityLog from './ActivityLog'; 
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaClock, 
  FaArrowLeft, 
  FaPlus, 
  FaHistory, 
  FaChevronDown, 
  FaTimes, 
  FaTrashAlt 
} from 'react-icons/fa';

const Schedule = () => {
  const [showLog, setShowLog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showManageParty, setShowManageParty] = useState(false); 
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));
  
  // --- FORM STATES ---
  const [purpose, setPurpose] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [laborViolation, setLaborViolation] = useState('');
  const [otherIssue, setOtherIssue] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');

  const [requestingParties, setRequestingParties] = useState([{ id: Date.now(), name: '' }]);
  const [respondingParties, setRespondingParties] = useState([{ id: Date.now() + 1, name: '' }]);

  // --- MEETINGS DATA ---
  const [meetings, setMeetings] = useState([
    { 
      id: 1, 
      purpose: "Hearing Review", 
      time: "9:00 AM to 10:30 AM", 
      dateLabel: "MAR 2",
      fullDate: "Tuesday, March 2"
    }
  ]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = months[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startingOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // --- FUNCTIONS ---
  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);
    const dayOfWeek = clickedDate.getDay(); 
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      alert("Weekends (Saturday/Sunday) are not available for scheduling.");
      return;
    }
    
    setSelectedDay(day.toString());
    setSelectedMonth(monthName.toUpperCase());
  };

  const handleCreateSchedule = () => {
    // Basic Validation
    if (!purpose || !selectedDay || !selectedMonth || !startTime || !endTime) {
      alert("Please fill in the Purpose, Date, and Time.");
      return;
    }

    const newMeeting = {
      id: Date.now(),
      purpose: purpose,
      time: `${startTime} to ${endTime}`,
      dateLabel: `${selectedMonth.substring(0, 3)} ${selectedDay}`,
      requesting: requestingParties.map(p => p.name).filter(n => n !== ""),
      responding: respondingParties.map(p => p.name).filter(n => n !== ""),
    };

    setMeetings([newMeeting, ...meetings]);
    
    // Reset Form and Go Back
    setPurpose('');
    setStartTime('');
    setEndTime('');
    setLaborViolation('');
    setOtherIssue('');
    setIsCreating(false);
    alert("Schedule created successfully!");
  };

  const addParty = (type) => {
    const newParty = { id: Date.now(), name: '' };
    if (type === 'req') setRequestingParties([...requestingParties, newParty]);
    else setRespondingParties([...respondingParties, newParty]);
  };

  const deleteParty = (type, id) => {
    const list = type === 'req' ? requestingParties : respondingParties;
    if (list.length > 1) {
      if (type === 'req') setRequestingParties(list.filter(p => p.id !== id));
      else setRespondingParties(list.filter(p => p.id !== id));
    }
  };

  const handleInputChange = (type, id, value) => {
    const update = (list) => list.map(p => p.id === id ? { ...p, name: value } : p);
    if (type === 'req') setRequestingParties(update(requestingParties));
    else setRespondingParties(update(respondingParties));
  };

  if (showLog) return <ActivityLog onBack={() => setShowLog(false)} />;

  return (
    <div className="schedule-outer-container">
      
      {/* MANAGE PARTIES MODAL */}
      {showManageParty && (
        <div className="party-modal-overlay">
          <div className="party-modal-card">
            <div className="party-modal-header">
              <h2>Manage Parties</h2>
              <button className="close-x-btn" onClick={() => setShowManageParty(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="party-modal-body">
              <div className="party-section">
                <label className="section-label">Requesting Party</label>
                <div className="party-scroll-area">
                  {requestingParties.map((party) => (
                    <div key={party.id} className="party-input-row">
                      <input 
                        type="text" 
                        placeholder="Insert name here" 
                        className="dark-party-input"
                        value={party.name}
                        onChange={(e) => handleInputChange('req', party.id, e.target.value)}
                      />
                      <button className="party-delete-btn" onClick={() => deleteParty('req', party.id)}>
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="add-another-btn" onClick={() => addParty('req')}>
                  <FaPlus size={10} /> Add Another
                </button>
              </div>

              <div className="party-section">
                <label className="section-label">Responding Party</label>
                <div className="party-scroll-area">
                  {respondingParties.map((party) => (
                    <div key={party.id} className="party-input-row">
                      <input 
                        type="text" 
                        placeholder="Insert name here" 
                        className="dark-party-input"
                        value={party.name}
                        onChange={(e) => handleInputChange('res', party.id, e.target.value)}
                      />
                      <button className="party-delete-btn" onClick={() => deleteParty('res', party.id)}>
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="add-another-btn" onClick={() => addParty('res')}>
                  <FaPlus size={10} /> Add Another
                </button>
              </div>
            </div>
            <div className="party-modal-footer">
              <button className="party-save-btn" onClick={() => setShowManageParty(false)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="schedule-header">
        <div className="header-left">
          <button className="back-circle-btn" onClick={() => setIsCreating(false)}>
            <FaArrowLeft />
          </button>
          <div className="header-text">
            <h1>Schedule a Meeting</h1>
            {!isCreating && <p>Your daily agenda</p>}
          </div>
        </div>
        {!isCreating && (
          <button className="create-sched-btn" onClick={() => setIsCreating(true)}>
            <FaPlus /> Create Schedule
          </button>
        )}
      </div>

      <div className="schedule-content-grid">
        <div className="left-column-wrapper">
          {!isCreating ? (
            <div className="white-card meetings-card">
              <h2 className="card-title">Upcoming Meetings</h2>
              <div className="meetings-list">
                {meetings.map((item) => (
                  <div key={item.id} className="meeting-row">
                    <span className="time-label">{item.time.split(' ')[0]} {item.time.split(' ')[1]}</span>
                    <div className="meeting-blue-pill">
                      <div className="date-tag">{item.dateLabel}</div>
                      <div className="meeting-info">
                        <h3>{item.purpose}</h3>
                        <p><FaClock /> {item.time}</p>
                      </div>
                      <button className="view-pill-btn" onClick={() => setShowLog(true)}>View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="white-card create-form-container">
              <h2 className="form-main-title">Create New Schedule</h2>
              <div className="form-group">
                <label>Purpose</label>
                <input 
                  type="text" 
                  placeholder="Type here" 
                  className="form-input-field" 
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Requesting Party</label>
                  <button className="manage-party-btn" onClick={() => setShowManageParty(true)}>Manage Party</button>
                </div>
                <div className="form-group">
                  <label>Responding Party</label>
                  <button className="manage-party-btn" onClick={() => setShowManageParty(true)}>Manage Party</button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Availability:</label>
                  <div className="availability-pickers">
                    <div className="custom-select-wrapper">
                      <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                        <option value="">DAY</option>
                        {daysArray.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <FaChevronDown className="select-arrow" />
                    </div>
                    <div className="custom-select-wrapper">
                      <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                        <option value="">MONTH</option>
                        {months.map(m => <option key={m} value={m.toUpperCase()}>{m}</option>)}
                      </select>
                      <FaChevronDown className="select-arrow" />
                    </div>
                  </div>
                </div>
                <div className="form-group flex-1">
                  <label>TIME</label>
                  <div className="time-range-picker">
                    <div className="time-box">
                        <FaClock /> 
                        <input type="text" placeholder="00:00" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <span>—</span>
                    <div className="time-box">
                        <FaClock /> 
                        <input type="text" placeholder="00:00" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="section-subtitle">Claims/Issues</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="faded-label">Labor Standards Violations</label>
                  <input 
                    type="text" 
                    placeholder="Type here" 
                    className="form-input-field" 
                    value={laborViolation}
                    onChange={(e) => setLaborViolation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="faded-label">Other Issues</label>
                  <input 
                    type="text" 
                    placeholder="Type here" 
                    className="form-input-field" 
                    value={otherIssue}
                    onChange={(e) => setOtherIssue(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Available Hearing Officer</label>
                <div className="custom-select-wrapper full-width">
                  <select value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)}>
                    <option value="">Select Officer Name</option>
                    <option value="Officer A">Officer A</option>
                    <option value="Officer B">Officer B</option>
                  </select>
                  <FaChevronDown className="select-arrow" />
                </div>
              </div>

              <div className="form-actions">
                <button className="submit-create-btn" onClick={handleCreateSchedule}>Create</button>
                <button className="alt-activity-log-btn" onClick={() => setShowLog(true)}>
                  <FaHistory /> Activity Log
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="right-column">
          <div className="white-card calendar-mini-card">
            <div className="cal-nav">
              <FaChevronLeft onClick={() => setCurrentDate(new Date(year, month - 1, 1))} />
              <h3>{monthName} {year}</h3>
              <FaChevronRight onClick={() => setCurrentDate(new Date(year, month + 1, 1))} />
            </div>
            <div className="cal-days-header">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="cal-grid-mini">
              {Array.from({ length: startingOffset }).map((_, i) => <div key={i} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const isSelected = selectedDay === day.toString() && selectedMonth === monthName.toUpperCase();
                return (
                  <div 
                    key={day} 
                    className={`cal-date ${isSelected ? 'active' : ''}`}
                    onClick={() => handleDateClick(day)}
                    style={{ cursor: 'pointer' }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
          
          {isCreating && (
            <div className="recent-hearings-section">
              <h3 className="recent-title">Recent Hearings</h3>
              {meetings.slice(0, 2).map((item) => (
                <div key={item.id} className="white-card mini-hearing-pill">
                  <div className="pill-date">Tuesday<br/><b>{item.dateLabel.split(' ')[1]}</b></div>
                  <div className="pill-info">
                    <h4>{item.purpose}</h4>
                    <p><FaClock /> {item.time} <span className="green-text">Active</span></p>
                  </div>
                  <button className="view-btn-sm" onClick={() => setShowLog(true)}>View</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
