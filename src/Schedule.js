import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaHistory, FaArrowLeft, FaTrash, FaPlus, FaTimes, FaExclamationTriangle, FaClock, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Schedule.css';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const Schedule = ({ user, hideHeader = false, onSuccess, onCancel, triggerToast, onShowLog, initialData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [activePartyType, setActivePartyType] = useState(null);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  const [editingId, setEditingId] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [requestingParties, setRequestingParties] = useState(['']);
  const [respondingParties, setRespondingParties] = useState(['']);

  const [formData, setFormData] = useState({
    activity: 'SEnA',
    selectedMonth: months[new Date().getMonth()],
    selectedDay: String(new Date().getDate()),
    laborViolation: 'Select',
    otherIssues: '',
    officer: ''
  });

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return "";
    const [time, modifier] = timeStr.split(' ');
    if (!time || !modifier) return "";
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const formatTimeToAmPm = (timeStr) => {
    if (!timeStr) return "";
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${suffix}`;
  };

  // Helper to fix corrupted month data
  const fixMonthValue = (monthValue, dateString) => {
    if (!monthValue || monthValue === '11:00 AM' || monthValue === '12:00 PM' || monthValue.includes(':')) {
      if (dateString) {
        const dateParts = dateString.split(' ');
        if (dateParts[0]) {
          const monthAbbr = dateParts[0].toUpperCase();
          const monthMap = {
            'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
            'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
            'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
          };
          return monthMap[monthAbbr] || months[new Date().getMonth()];
        }
      }
      return months[new Date().getMonth()];
    }
    return monthValue;
  };

  // Generate unique ID function
  const generateUniqueId = (existingIds = []) => {
    let newId;
    let isUnique = false;
    
    while (!isUnique) {
      newId = Date.now() + Math.floor(Math.random() * 10000);
      if (!existingIds.includes(newId)) {
        isUnique = true;
      }
    }
    return newId;
  };

  // Handle initialData prop (from MainSched - editing)
  useEffect(() => {
    if (initialData) {
      setEditingId(initialData.id);
      setFormData({
        activity: initialData.title || 'SEnA',
        selectedMonth: fixMonthValue(initialData.monthName, initialData.date),
        selectedDay: String(initialData.day),
        laborViolation: initialData.laborViolation || 'Select',
        otherIssues: initialData.otherIssues || '',
        officer: initialData.officer || ''
      });
      setRequestingParties(initialData.requestingParty ? initialData.requestingParty.split(', ') : ['']);
      setRespondingParties(initialData.respondingParty ? initialData.respondingParty.split(', ') : ['']);
      
      if (initialData.time?.includes(' to ')) {
        const [start, end] = initialData.time.split(' to ');
        setStartTime(convertTo24Hour(start));
        setEndTime(convertTo24Hour(end));
      }
    }
  }, [initialData]);

  // Handle navigation from Activity Log (via location.state)
  useEffect(() => {
    const locationData = location.state?.initialData;
    if (locationData && !initialData) {
      setEditingId(locationData.id);
      setFormData({
        activity: locationData.title || 'SEnA',
        selectedMonth: fixMonthValue(locationData.monthName, locationData.date),
        selectedDay: String(locationData.day || new Date().getDate()),
        laborViolation: locationData.laborViolation || 'Select',
        otherIssues: locationData.otherIssues || '',
        officer: locationData.officer || ''
      });
      setRequestingParties(locationData.requestingParty ? locationData.requestingParty.split(', ') : ['']);
      setRespondingParties(locationData.respondingParty ? locationData.respondingParty.split(', ') : ['']);
      
      if (locationData.time?.includes(' to ')) {
        const [start, end] = locationData.time.split(' to ');
        setStartTime(convertTo24Hour(start));
        setEndTime(convertTo24Hour(end));
      }
    }
  }, [location.state, initialData]);

  // Set officer name for new schedule
  useEffect(() => {
    if (!initialData && !location.state?.initialData) {
      const source = user || JSON.parse(localStorage.getItem('currentUser'));
      if (source) {
        const first = toTitleCase(source.firstName || "");
        const mi = source.middleInitial ? `${source.middleInitial.toUpperCase().replace('.', '')}. ` : "";
        const last = toTitleCase(source.lastName || "");
        const fullName = `${first} ${mi}${last}`.trim();
        setFormData(prev => ({ ...prev, officer: fullName }));
      }
    }
  }, [user, initialData, location.state]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddParty = (type) => {
    if (type === 'req') setRequestingParties([...requestingParties, '']);
    else setRespondingParties([...respondingParties, '']);
  };

  const handleRemoveParty = (type, index) => {
    if (type === 'req' && requestingParties.length > 1) setRequestingParties(requestingParties.filter((_, i) => i !== index));
    else if (type === 'res' && respondingParties.length > 1) setRespondingParties(respondingParties.filter((_, i) => i !== index));
  };

  const handlePartyNameChange = (type, index, value) => {
    const list = type === 'req' ? [...requestingParties] : [...respondingParties];
    list[index] = value;
    type === 'req' ? setRequestingParties(list) : setRespondingParties(list);
  };

  const handleCloseIconClick = () => {
    const listToCheck = activePartyType === 'req' ? requestingParties : respondingParties;
    const hasContent = listToCheck.some(n => n.trim() !== "");
    if (!hasContent) toast.error("Please ensure the party is named.");
    else setShowPartyModal(false);
  };

  const handleModalSave = () => {
    const listToCheck = activePartyType === 'req' ? requestingParties : respondingParties;
    const hasContent = listToCheck.some(n => n.trim() !== "");
    if (!hasContent) { toast.warn("Party name cannot be empty."); return; }
    setShowPartyModal(false);
  };

  const handleSubmit = () => {
    const validReq = requestingParties.filter(n => n.trim() !== "");
    const validRes = respondingParties.filter(n => n.trim() !== "");
    if (!formData.activity || validReq.length === 0 || validRes.length === 0) {
      toast.warn("Please complete the activity and ensure both parties are named.");
      return;
    }
    
    if (!startTime || !endTime) {
      toast.warn("Please select both start and end time.");
      return;
    }
    
    const combinedTime = `${formatTimeToAmPm(startTime)} to ${formatTimeToAmPm(endTime)}`;
    const selectedDateObj = new Date(currentDate.getFullYear(), months.indexOf(formData.selectedMonth), parseInt(formData.selectedDay));

    const saved = JSON.parse(localStorage.getItem('hearings')) || [];
    const existingIds = saved.map(h => h.id);
    
    let newId;
    if (editingId) {
      newId = editingId;
    } else {
      newId = generateUniqueId(existingIds);
    }
    
    const hearingData = {
      id: newId,
      title: formData.activity,
      time: combinedTime,
      day: formData.selectedDay,
      officer: formData.officer,
      requestingParty: validReq.join(', '),
      respondingParty: validRes.join(', '),
      laborViolation: formData.laborViolation,
      otherIssues: formData.otherIssues,
      status: initialData?.status || "Scheduled",
      date: `${formData.selectedMonth.substring(0, 3).toUpperCase()} ${formData.selectedDay}`,
      monthName: formData.selectedMonth,
      year: currentDate.getFullYear(),
      dow: selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' })
    };
    
    let updated;
    if (editingId) {
      updated = saved.map(h => h.id === editingId ? hearingData : h);
    } else {
      updated = [...saved, hearingData];
    }
      
    localStorage.setItem('hearings', JSON.stringify(updated));
    
    const msg = editingId ? "Schedule Updated!" : "Schedule Created!";
    if (triggerToast) triggerToast("success", msg); else toast.success(msg);
    if (onSuccess) onSuccess(hearingData); 
  };

  const month = currentDate.getMonth();
  const monthName = months[month];
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  const handleGoBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  // Number Spinner Component for Minutes
  const NumberSpinner = ({ value, onChange, min, max, label }) => {
    const handleIncrement = () => {
      if (value + 1 <= max) {
        onChange(value + 1);
      }
    };

    const handleDecrement = () => {
      if (value - 1 >= min) {
        onChange(value - 1);
      }
    };

    const handleInputChange = (e) => {
      let newValue = parseInt(e.target.value);
      if (isNaN(newValue)) newValue = 0;
      if (newValue < min) newValue = min;
      if (newValue > max) newValue = max;
      onChange(newValue);
    };

    return (
      <div className="number-spinner">
        <div className="spinner-label">{label}</div>
        <div className="spinner-controls">
          <button type="button" className="spinner-btn" onClick={handleIncrement}>
            <FaChevronUp />
          </button>
          <input 
            type="text" 
            className="spinner-value-input"
            value={String(value).padStart(2, '0')}
            onChange={handleInputChange}
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <button type="button" className="spinner-btn" onClick={handleDecrement}>
            <FaChevronDown />
          </button>
        </div>
      </div>
    );
  };

  // Custom Time Picker Component
  const TimePicker = ({ value, onChange, onClose }) => {
    const [selectedHour, setSelectedHour] = useState(() => {
      if (value) {
        const [hours] = value.split(':');
        const hour24 = parseInt(hours);
        let hour12 = hour24 % 12;
        if (hour12 === 0) hour12 = 12;
        return hour12;
      }
      return 9;
    });
    const [selectedMinute, setSelectedMinute] = useState(() => {
      if (value) {
        const [, minutes] = value.split(':');
        return parseInt(minutes);
      }
      return 0;
    });
    const [selectedPeriod, setSelectedPeriod] = useState(() => {
      if (value) {
        const [hours] = value.split(':');
        return parseInt(hours) >= 12 ? 'PM' : 'AM';
      }
      return 'AM';
    });

    const hours = [];
    for (let i = 1; i <= 12; i++) {
      hours.push(i);
    }

    const handleConfirm = () => {
      let hour24 = selectedHour;
      if (selectedPeriod === 'PM' && selectedHour !== 12) hour24 = selectedHour + 12;
      if (selectedPeriod === 'AM' && selectedHour === 12) hour24 = 0;
      const timeValue = `${String(hour24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
      onChange(timeValue);
      onClose();
    };

    return (
      <div className="custom-time-picker">
        <div className="time-picker-content">
          <div className="time-picker-header">
            <FaClock />
            <span>Select Time</span>
            <button className="time-picker-close" onClick={onClose}>×</button>
          </div>
          <div className="time-picker-body">
            <div className="time-column">
              <div className="time-column-label">Hour</div>
              <div className="time-options hour-options">
                {hours.map(h => (
                  <button
                    key={h}
                    className={`time-option ${selectedHour === h ? 'active' : ''}`}
                    onClick={() => setSelectedHour(h)}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
            <div className="time-column minute-column">
              <div className="time-column-label">Minute</div>
              <NumberSpinner
                value={selectedMinute}
                onChange={setSelectedMinute}
                min={0}
                max={59}
                label="Minute"
              />
            </div>
            <div className="time-column">
              <div className="time-column-label">Period</div>
              <div className="time-options period-options">
                <button
                  className={`time-option ${selectedPeriod === 'AM' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('AM')}
                >
                  AM
                </button>
                <button
                  className={`time-option ${selectedPeriod === 'PM' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('PM')}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
          <div className="time-picker-footer">
            <button className="time-picker-cancel" onClick={onClose}>Cancel</button>
            <button className="time-picker-confirm" onClick={handleConfirm}>OK</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="schedule-page-wrapper">
      {/* Only show header when hideHeader is false */}
      {!hideHeader && (
        <div className="page-header-container">
          <button onClick={handleGoBack} className="back-nav-btn" type="button"><FaArrowLeft /></button>
          <h1 className="header-title">Schedule a Meeting</h1>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />

      {showPartyModal && (
        <div className="modal-overlay">
          <div className="party-modal">
            <div className="modal-header">
              <h3>{showConfirmExit ? "Confirm Exit" : `Manage ${activePartyType === 'req' ? 'Requesting' : 'Responding'} Party`}</h3>
              {!showConfirmExit && <FaTimes className="close-icon" onClick={handleCloseIconClick} />}
            </div>
            <div className="modal-body">
              {showConfirmExit ? (
                <div className="confirm-exit-view">
                  <FaExclamationTriangle className="warning-icon-large" />
                  <h3>Unsaved Changes</h3>
                  <p>Are you sure you want to cancel? Any names entered will be lost.</p>
                  <div className="modal-footer-dual">
                    <button className="modal-save-btn-small" onClick={() => setShowConfirmExit(false)} type="button">Go Back</button>
                    <button className="modal-cancel-btn" onClick={() => { setShowPartyModal(false); setShowConfirmExit(false); }} type="button">Yes, Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="party-section-box">
                    <h4 className="party-section-title">{activePartyType === 'req' ? 'Requesting Party' : 'Responding Party'}</h4>
                    <div className="party-list-scroll-container">
                      {(activePartyType === 'req' ? requestingParties : respondingParties).map((name, index) => (
                        <div key={index} className="party-input-row">
                          <input type="text" placeholder="Insert name" value={name} onChange={(e) => handlePartyNameChange(activePartyType, index, e.target.value)} />
                          <button className="party-delete-btn" onClick={() => handleRemoveParty(activePartyType, index)} type="button"><FaTrash /></button>
                        </div>
                      ))}
                    </div>
                    <button className="add-another-btn" onClick={() => handleAddParty(activePartyType)} type="button"><FaPlus /> Add Another</button>
                  </div>
                  <div className="modal-footer-dual">
                    <button className="modal-cancel-btn" onClick={() => setShowConfirmExit(true)} type="button">Cancel</button>
                    <button className="modal-save-btn-small" onClick={handleModalSave} type="button">Save</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="schedule-container">
        <div className="create-card">
          <h2 className="section-title">{editingId ? "Update Schedule" : "Create New Schedule"}</h2>
          
          <div className="input-group">
            <label>Activity:</label>
            <select 
              value={formData.activity} 
              onChange={(e) => setFormData({...formData, activity: e.target.value})} 
              className="sched-input"
            >
              <option value="SEnA">SEnA</option>
              <option value="Advice">Advice</option>
            </select>
          </div>

          <div className="row-group">
            <div className="input-group">
              <label>Requesting Party:</label>
              <button className="manage-party-trigger" onClick={() => { setActivePartyType('req'); setShowPartyModal(true); }} type="button">Manage Party</button>
            </div>
            <div className="input-group">
              <label>Responding Party:</label>
              <button className="manage-party-trigger" onClick={() => { setActivePartyType('res'); setShowPartyModal(true); }} type="button">Manage Party</button>
            </div>
          </div>

          <div className="availability-horizontal-section">
            <label className="group-label">Availability:</label>
            <div className="availability-row">
              <div className="input-field">
                <span className="inline-label">Day</span>
                <select value={formData.selectedDay} onChange={(e) => setFormData({...formData, selectedDay: e.target.value})} className="sched-input compact">
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="input-field">
                <span className="inline-label">Month</span>
                <select value={formData.selectedMonth} onChange={(e) => setFormData({...formData, selectedMonth: e.target.value})} className="sched-input compact">
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="input-field time-field">
                <span className="inline-label">Start Time</span>
                <div className="time-input-wrapper" onClick={() => setShowStartTimePicker(!showStartTimePicker)}>
                  <FaClock className="time-icon" />
                  <input 
                    type="text" 
                    value={startTime ? formatTimeToAmPm(startTime) : ""} 
                    readOnly
                    placeholder="Select time"
                    className="sched-input time-input-readonly"
                  />
                </div>
                {showStartTimePicker && (
                  <TimePicker 
                    value={startTime}
                    onChange={setStartTime}
                    onClose={() => setShowStartTimePicker(false)}
                  />
                )}
              </div>
              <div className="input-field time-field">
                <span className="inline-label">End Time</span>
                <div className="time-input-wrapper" onClick={() => setShowEndTimePicker(!showEndTimePicker)}>
                  <FaClock className="time-icon" />
                  <input 
                    type="text" 
                    value={endTime ? formatTimeToAmPm(endTime) : ""} 
                    readOnly
                    placeholder="Select time"
                    className="sched-input time-input-readonly"
                  />
                </div>
                {showEndTimePicker && (
                  <TimePicker 
                    value={endTime}
                    onChange={setEndTime}
                    onClose={() => setShowEndTimePicker(false)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="row-group">
            <div className="input-group">
              <label>Labor Violation / Claims:</label>
              <select className="sched-input" value={formData.laborViolation} onChange={(e) => setFormData({...formData, laborViolation: e.target.value})}>
                <option value="Select">Select</option>
                <option>Minimum Wage</option><option>COLA</option>
                <option>Night Shift Differential</option><option>Overtime Pay</option>
                <option>Holiday Pay</option><option>13th Month Pay</option>
                <option>Service Charge</option><option>Premium Pay for Rest Day</option>
                <option>Premium Pay for Special Day</option><option>Service Incentive Leave</option>
                <option>Maternity Leave</option><option>Paternity Leave</option>
                <option>Parental Leave for Solo Parent</option><option>Leave for Victims of VAWC</option>
                <option>Special Leave for Women</option>
              </select>
            </div>
            <div className="input-group">
              <label>Other Issues:</label>
              <input type="text" className="sched-input" value={formData.otherIssues} onChange={(e) => setFormData({...formData, otherIssues: e.target.value})} placeholder="Enter other issues" />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '15px' }}>
            <label>Available Hearing Officer</label>
            <input type="text" value={formData.officer} readOnly className="sched-input read-only-input" />
          </div>

          <div className="sched-button-group">
            <button className="create-btn" onClick={handleSubmit} type="button">
              {editingId ? "Update" : "Create"}
            </button>
            <button
              className="view-log-btn"
              onClick={() => { if(onShowLog) onShowLog(); }}
              type="button"
            >
              <FaHistory /> Activity Log
            </button>
          </div>
        </div>

        <div className="calendar-card fixed-calendar-card">
          <div className="calendar-header">
            <FaChevronLeft onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{cursor: 'pointer'}} />
            <h3>{monthName} {year}</h3>
            <FaChevronRight onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{cursor: 'pointer'}} />
          </div>
          <div className="calendar-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="dow-label">{d}</div>)}
            {Array.from({ length: startingOffset }).map((_, i) => <div key={i}></div>)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <div key={day} className={`day-num ${currentTime.getDate() === day && currentTime.getMonth() === month ? 'today-highlight' : ''}`}>{day}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;