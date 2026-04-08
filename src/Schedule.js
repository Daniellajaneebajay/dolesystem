import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaTrash 
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Full list from your provided reference image
const laborStandardsOptions = [
  "Minimum Wage", "COLA", "Night Shift Differential", "Overtime Pay", 
  "Holiday Pay", "13th Month Pay", "Service Charge", "Premium Pay for Rest Day",
  "Premium Day for Special Day", "Service Incentive Leave", "Maternity Leave",
  "Paternity Leave", "Parental Leave for Solo Parent", "Leave for Victims of VAWC",
  "Special Leave for Women"
];

const Schedule = () => {
  const navigate = useNavigate();
  
  // UI Logic States
  const [showLog, setShowLog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [modalType, setModalType] = useState(''); 

  // --- CALENDAR NAVIGATION STATE ---
  const [viewDate, setViewDate] = useState(new Date(2026, 1, 1)); 

  const changeMonth = (offset) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // --- DATA STATES ---
  const [meetings, setMeetings] = useState([
    { id: 1, purpose: 'Hearing Review', month: 'MAR', day: 2, time: '9:00 AM to 10:30 AM' }
  ]);

  const [requestingParties, setRequestingParties] = useState(['']);
  const [respondingParties, setRespondingParties] = useState(['']);

  const [formData, setFormData] = useState({
    purpose: '',
    day: '2',
    month: 'FEBRUARY',
    startTime: '09:00',
    endTime: '10:30',
    claims: '',
    otherIssues: '',
    officer: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    if (!formData.purpose.trim()) {
      toast.error("Please enter a meeting purpose.");
      return;
    }
    const newEntry = {
      id: Date.now(),
      purpose: formData.purpose,
      month: formData.month.substring(0, 3).toUpperCase(),
      day: parseInt(formData.day),
      time: `${formData.startTime} to ${formData.endTime}`,
    };
    setMeetings([newEntry, ...meetings]);
    toast.success("Schedule Created!");
    setIsCreating(false);
  };

  if (showLog) return <ActivityLog onBack={() => setShowLog(false)} />;

  // Modal Component
  const ManagePartiesModal = () => (
    <div className="sched-modal-overlay">
      <div className="sched-modal-container">
        <div className="sched-modal-header">
          <h3>Manage Parties</h3>
          <FaTimes className="close-icon" onClick={() => setShowPartyModal(false)} />
        </div>
        <div className="sched-modal-body">
          <label className="sched-modal-label">{modalType === 'requesting' ? 'Requesting Party' : 'Responding Party'}</label>
          <div className="party-inputs-list">
            {(modalType === 'requesting' ? requestingParties : respondingParties).map((party, index) => (
              <div key={index} className="party-input-row">
                <input 
                  type="text" 
                  placeholder="Insert name here" 
                  value={party}
                  onChange={(e) => {
                    const newList = modalType === 'requesting' ? [...requestingParties] : [...respondingParties];
                    newList[index] = e.target.value;
                    modalType === 'requesting' ? setRequestingParties(newList) : setRespondingParties(newList);
                  }}
                />
                <button className="delete-party-btn" onClick={() => {
                  const newList = modalType === 'requesting' ? [...requestingParties] : [...respondingParties];
                  newList.splice(index, 1);
                  modalType === 'requesting' ? setRequestingParties(newList) : setRespondingParties(newList);
                }}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          <button className="add-another-btn" onClick={() => {
             modalType === 'requesting' ? setRequestingParties([...requestingParties, '']) : setRespondingParties([...respondingParties, '']);
          }}>
            <FaPlus /> Add Another
          </button>
        </div>
        <div className="sched-modal-footer">
          <button className="save-modal-btn" onClick={() => setShowPartyModal(false)}>Save</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="schedule-page-wrapper">
      <ToastContainer />
      {showPartyModal && <ManagePartiesModal />}

      <div className="header-container-flat">
        <div className="header-inner">
          <button className="back-btn-transparent" onClick={() => isCreating ? setIsCreating(false) : navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div>
            <span className="header-title">{isCreating ? "Schedule a Meeting" : "Schedule a Meeting"}</span>
            {!isCreating && <span className="header-subtitle">Your daily agenda</span>}
          </div>
        </div>
        {!isCreating && (
          <button className="red-create-btn" onClick={() => setIsCreating(true)}>
            <FaPlus /> Create Schedule
          </button>
        )}
      </div>

      <div className="schedule-content-grid">
        <div className="left-column-wrapper">
          {!isCreating ? (
            <div className="white-card-agenda">
              <h2 className="section-title">Upcoming Meetings</h2>
              {meetings.map((m) => (
                <div key={m.id} className="meeting-pill">
                  <div className="pill-date-box">
                    <span className="pill-month">{m.month}</span>
                    <span className="pill-day">{m.day}</span>
                  </div>
                  <div className="pill-content">
                    <h3>{m.purpose}</h3>
                    <p><FaClock /> {m.time}</p>
                  </div>
                  <button className="view-pill-btn" onClick={() => setShowLog(true)}>View</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="create-form-card">
              <h2 className="form-title">Create New Schedule</h2>
              <div className="form-field">
                <label>Purpose</label>
                <input type="text" name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="Type here" />
              </div>
              
              <div className="form-split">
                <div className="form-field">
                  <label>Requesting Party</label>
                  <button className="manage-btn-dark" onClick={() => { setModalType('requesting'); setShowPartyModal(true); }}>
                    Manage Party ({requestingParties.filter(p => p !== '').length})
                  </button>
                </div>
                <div className="form-field">
                  <label>Responding Party</label>
                  <button className="manage-btn-dark" onClick={() => { setModalType('responding'); setShowPartyModal(true); }}>
                    Manage Party ({respondingParties.filter(p => p !== '').length})
                  </button>
                </div>
              </div>

              <div className="form-split">
                <div className="form-field-group">
                  <label className="group-label">Availability:</label>
                  <div className="select-row">
                    <div className="sched-custom-select small-select">
                      <label className="inner-label">DAY</label>
                      <select name="day" value={formData.day} onChange={handleInputChange}>
                          {Array.from({length: 31}, (_, i) => i+1).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <FaChevronDown className="select-chevron" />
                    </div>
                    <div className="sched-custom-select month-select">
                      <label className="inner-label">MONTH</label>
                      <select name="month" value={formData.month} onChange={handleInputChange}>
                          {months.map(m => <option key={m} value={m.toUpperCase()}>{m.toUpperCase()}</option>)}
                      </select>
                      <FaChevronDown className="select-chevron" />
                    </div>
                  </div>
                </div>
                <div className="form-field-group">
                  <label className="group-label">TIME</label>
                  <div className="time-row-ui">
                    <div className="time-box">
                      <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} /><FaClock />
                    </div>
                    <span>—</span>
                    <div className="time-box">
                      <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} /><FaClock />
                    </div>
                  </div>
                </div>
              </div>

              {/* Claims/Issues with Dropdown Logic */}
              <div className="form-split">
                 <div className="form-field">
                  <label>Claims/Issues</label>
                  <p className="sub-label">Labor Standards Violations</p>
                  <div className="sched-custom-select full-width-dropdown">
                    <select name="claims" value={formData.claims} onChange={handleInputChange}>
                      <option value="" disabled>Select Violation</option>
                      {laborStandardsOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <FaChevronDown className="select-chevron" />
                  </div>
                </div>
                <div className="form-field">
                  <label>&nbsp;</label>
                  <p className="sub-label">Other Issues</p>
                  <input type="text" name="otherIssues" value={formData.otherIssues} onChange={handleInputChange} placeholder="Type here" />
                </div>
              </div>

              {/* Hearing Officer Expanded Dropdown */}
              <div className="form-field">
                <label>Available Hearing Officer</label>
                <div className="sched-custom-select full-width-dropdown expanded-officer">
                  <select name="officer" value={formData.officer} onChange={handleInputChange}>
                    <option value="">Select Officer Name</option>
                    <option value="Atty. Juan Dela Cruz">Atty. Juan Dela Cruz</option>
                    <option value="Atty. Maria Santos">Atty. Maria Santos</option>
                  </select>
                  <FaChevronDown className="select-chevron-large" />
                </div>
              </div>

              <div className="form-actions-row">
                <button className="final-create-btn" onClick={handleCreate}>Create</button>
                <button className="final-log-btn" onClick={() => setShowLog(true)}>
                    <FaHistory /> Activity Log
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="right-column">
          <div className="white-card-cal">
            <div className="cal-nav">
              <FaChevronLeft onClick={() => changeMonth(-1)} style={{cursor: 'pointer'}} />
              <h3>{months[viewDate.getMonth()]} {viewDate.getFullYear()}</h3>
              <FaChevronRight onClick={() => changeMonth(1)} style={{cursor: 'pointer'}} />
            </div>
            <div className="cal-days-header">
               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="cal-grid-mini">
              {daysArray.map(day => (
                <div key={day} className={`cal-date ${day === parseInt(formData.day) && months[viewDate.getMonth()].toUpperCase() === formData.month ? 'active' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
          </div>
          {!isCreating && (
            <button className="sidebar-log-btn" onClick={() => setShowLog(true)}>
               <FaHistory /> Activity Log
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
