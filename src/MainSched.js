import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MainSched.css';
import ActivityLog from './ActivityLog'; 
import DetailedScheduleForm from './Schedule'; 
import ViewSched from './ViewSched';
import { 
  FaClock, 
  FaArrowLeft, 
  FaPlus,
  FaHistory,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const computeLiveStatus = (hearing, now) => {
  if (hearing.status === 'Cancelled' || hearing.status === 'Done') return hearing.status;
  try {
    const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const year       = hearing.year || now.getFullYear();
    const monthIndex = MONTHS.indexOf(hearing.monthName);
    const day        = parseInt(hearing.day);
    const parts      = hearing.time.split(' to ');
    if (parts.length < 2) return hearing.status || 'Pending';
    const parseTime = (timeStr) => {
      const trimmed              = timeStr.trim();
      const [timePart, modifier] = trimmed.split(' ');
      let [h, m]                 = timePart.split(':');
      h = parseInt(h, 10);
      if (modifier === 'PM' && h !== 12) h += 12;
      if (modifier === 'AM' && h === 12) h = 0;
      return new Date(year, monthIndex, day, h, parseInt(m, 10), 0);
    };
    const start = parseTime(parts[0]);
    const end   = parseTime(parts[1]);
    if (now >= start && now <= end) return 'In Session';
    if (now < start)               return 'Pending';
    return 'Finished';
  } catch { return hearing.status || 'Pending'; }
};

const promoteFinishedHearings = (now) => {
  const saved = JSON.parse(localStorage.getItem('hearings')) || [];
  let changed = false;
  const updated = saved.map(h => {
    if (h.status === 'Cancelled' || h.status === 'Done') return h;
    if (computeLiveStatus(h, now) === 'Finished') { changed = true; return { ...h, status: 'Done' }; }
    return h;
  });
  if (changed) { localStorage.setItem('hearings', JSON.stringify(updated)); window.dispatchEvent(new Event('storage')); }
};

const MainSched = ({ triggerToast, sidebarOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showLog, setShowLog] = useState(false);
  const [logInitialTab, setLogInitialTab] = useState('active'); // FIX: which tab to open ActivityLog on
  const [isCreating, setIsCreating] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState(null);
  const [returnToLog, setReturnToLog] = useState(false);
  const [now, setNow] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDay, setSelectedDay] = useState(new Date().getDate()); 
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    promoteFinishedHearings(new Date());
    const timer = setInterval(() => { const tick = new Date(); setNow(tick); promoteFinishedHearings(tick); }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!location.state) return;

    if (location.state.returnToSchedule) {
      setViewingSchedule(location.state.returnToSchedule);
      setIsCreating(false); setShowLog(false); setReturnToLog(false);
      navigate('/schedule', { replace: true, state: {} });
      return;
    }
    if (location.state.editFromLog) {
      setViewingSchedule(location.state.editFromLog);
      setIsCreating(true); setShowLog(false); setReturnToLog(true);
      navigate('/schedule', { replace: true, state: {} });
      return;
    }
    // FIX: back from MinutesInfo opened from Active tab → reopen ActivityLog on Active tab
    if (location.state.openLog) {
      setLogInitialTab('active');
      setShowLog(true); setIsCreating(false); setViewingSchedule(null);
      navigate('/schedule', { replace: true, state: {} });
      return;
    }
    // FIX: back from MinutesInfo opened from Archives tab → reopen ActivityLog on Archives tab
    if (location.state.openLogInArchives) {
      setLogInitialTab('archived');
      setShowLog(true); setIsCreating(false); setViewingSchedule(null);
      navigate('/schedule', { replace: true, state: {} });
      return;
    }
  }, [location.state, navigate]);

  const loadMeetings = useCallback(() => {
    const saved = localStorage.getItem('hearings');
    if (!saved) { setMeetings([]); return; }
    const allHearings = JSON.parse(saved);
    const currentNow  = new Date();
    const visible = allHearings.filter(h => {
      if (h.status === 'Cancelled' || h.status === 'Done') return false;
      const live = computeLiveStatus(h, currentNow);
      return live === 'Pending' || live === 'In Session';
    });
    setMeetings(visible);
  }, []);

  useEffect(() => {
    loadMeetings();
    window.addEventListener('focus', loadMeetings);
    window.addEventListener('storage', loadMeetings);
    return () => { window.removeEventListener('focus', loadMeetings); window.removeEventListener('storage', loadMeetings); };
  }, [isCreating, loadMeetings, showLog, now]);

  const formatPartyName = (partyData) => {
    if (!partyData) return "N/A";
    if (typeof partyData === 'string') {
      const names = partyData.split(',').map(n => n.trim()).filter(n => n !== "");
      if (names.length > 1) return `${names[0]}, et al.`;
      return partyData;
    }
    if (Array.isArray(partyData)) {
      if (partyData.length > 1) return `${partyData[0]}, et al.`;
      return partyData[0] || "N/A";
    }
    return partyData;
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = months[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startingOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const groupedMeetings = useMemo(() => {
    const filtered = meetings.filter(m => {
      const meetingDay  = parseInt(m.day);
      const isSameDay   = meetingDay === selectedDay;
      const savedDate   = m.date || "";
      const isSameMonth = savedDate.toLowerCase().includes(monthName.toLowerCase()) || savedDate.toLowerCase().includes(monthName.substring(0, 3).toLowerCase());
      const savedYear   = parseInt(m.year);
      const isSameYear  = savedYear ? savedYear === currentDate.getFullYear() : true;
      return isSameDay && isSameMonth && isSameYear;
    });
    const getTimeVal = (timeStr) => {
      if (!timeStr) return { total: 0 };
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return { total: 0 };
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const modifier = match[3].toUpperCase();
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return { hours, minutes, total: hours * 60 + minutes };
    };
    const sorted = [...filtered].sort((a, b) => getTimeVal(a.time).total - getTimeVal(b.time).total);
    const groups = {};
    sorted.forEach(m => {
      const { hours = 0 } = getTimeVal(m.time);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      const hourLabel = `${displayHour}:00 ${ampm}`;
      if (!groups[hourLabel]) groups[hourLabel] = [];
      groups[hourLabel].push(m);
    });
    return groups;
  }, [meetings, selectedDay, monthName, currentDate]);

  if (viewingSchedule && !isCreating) {
    return <ViewSched scheduleData={viewingSchedule} onBack={() => setViewingSchedule(null)} onEdit={() => setIsCreating(true)} />;
  }

  // FIX: Pass initialViewMode so ActivityLog opens on the correct tab (active or archived)
  if (showLog) {
    return (
      <ActivityLog
        initialViewMode={logInitialTab}
        onBack={() => { setShowLog(false); setLogInitialTab('active'); loadMeetings(); }}
      />
    );
  }

  return (
    <div className={`schedule-outer-container ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
      <div className="schedule-header">
        <div className="header-left">
          {isCreating && (
            <button className="back-circle-btn" onClick={() => {
              setIsCreating(false); setViewingSchedule(null);
              if (returnToLog) { setReturnToLog(false); setShowLog(true); }
            }}>
              <FaArrowLeft />
            </button>
          )}
          <div className="header-text">
            <h1>{isCreating ? (viewingSchedule ? "Update Schedule" : "New Schedule") : "Schedule a Meeting"}</h1>
            {!isCreating && <p>Your daily agenda</p>}
          </div>
        </div>
        {!isCreating && (
          <button className="create-sched-btn" onClick={() => { setViewingSchedule(null); setIsCreating(true); }}>
            <FaPlus /> Create Schedule
          </button>
        )}
      </div>

      <div className={isCreating ? "schedule-create-mode" : "schedule-content-grid"}>
        {isCreating ? (
          <DetailedScheduleForm 
            hideHeader={true} 
            initialData={viewingSchedule}
            returnToActivityLog={returnToLog}
            onSuccess={(updatedData) => {
              loadMeetings(); setIsCreating(false); setViewingSchedule(null);
              if (returnToLog) { setReturnToLog(false); setShowLog(true); }
              else if (viewingSchedule) { setViewingSchedule(updatedData); }
            }}
            onCancel={() => {
              setIsCreating(false); setViewingSchedule(null);
              if (returnToLog) { setReturnToLog(false); setShowLog(true); }
            }}
            onShowLog={() => setShowLog(true)} 
            triggerToast={triggerToast} 
          />
        ) : (
          <>
            <div className="left-column-wrapper">
              <div className="white-card meetings-card">
                <h2 className="card-title">Upcoming Meetings</h2>
                <div className="meetings-list scrollable-agenda">
                  {Object.keys(groupedMeetings).length > 0 ? (
                    Object.entries(groupedMeetings).map(([hour, items]) => (
                      <div key={hour} className="hour-group">
                        <div className="timeline-header">
                          <span className="timeline-hour">{hour}</span>
                          <div className="timeline-line"></div>
                        </div>
                        <div className="cards-stack">
                          {items.map((item) => (
                            <div key={item.id} className="meeting-card-professional">
                              <div className="card-body">
                                <div className="party-section">
                                  <span className="party-label">Requesting Party</span>
                                  <h3 className="party-name">{formatPartyName(item.requestingParty || item.title)}</h3>
                                  {item.laborViolation && <span className="violation-badge">Claims: {item.laborViolation}</span>}
                                </div>
                                <div className="divider-vertical"></div>
                                <div className="party-section">
                                  <span className="party-label">Responding Party</span>
                                  <h3 className="party-name">{formatPartyName(item.respondingParty)}</h3>
                                </div>
                                <div className="card-actions">
                                  <button className="view-btn-styled" onClick={() => setViewingSchedule(item)}>View</button>
                                  <span className="time-sub-label"><FaClock /> {item.time}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-meetings-placeholder"><p>No meetings scheduled for this day.</p></div>
                  )}
                </div>
              </div>
            </div>

            <div className="right-column-wrapper">
              <div className="white-card calendar-mini-card">
                <div className="cal-nav">
                  <FaChevronLeft className="nav-icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} />
                  <h3>{monthName} {year}</h3>
                  <FaChevronRight className="nav-icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} />
                </div>
                <div className="cal-grid-mini">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="cal-day-label">{d}</div>)}
                  {Array.from({ length: startingOffset }).map((_, i) => <div key={`off-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <div key={day}
                      className={`cal-date ${selectedDay === day ? 'selected-highlight' : ''} ${now.getDate() === day && now.getMonth() === month && now.getFullYear() === year ? 'today-indicator' : ''}`}
                      onClick={() => setSelectedDay(day)}
                    >{day}</div>
                  ))}
                </div>
              </div>
              <div className="activity-log-trigger-card" onClick={() => { setLogInitialTab('active'); setShowLog(true); }}>
                <div className="trigger-content">
                  <div className="icon-wrapper"><FaHistory /></div>
                  <div className="text-wrapper">
                    <span className="label">System Records</span>
                    <h3>Activity Log</h3>
                  </div>
                </div>
                <div className="arrow-badge"><FaChevronRight /></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MainSched;
