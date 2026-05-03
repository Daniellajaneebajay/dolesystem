import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './ActivityLog.css';
import { 
  FaArrowLeft, FaEdit, FaHistory, FaListUl, 
  FaEllipsisV, FaFileAlt, FaCommentDots, FaTrashAlt,
  FaArchive, FaTimesCircle
} from 'react-icons/fa';

const computeLiveStatus = (hearing, now) => {
  if (hearing.status === 'Cancelled' || hearing.status === 'Done') return hearing.status;

  try {
    const MONTHS = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
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
  } catch {
    return hearing.status || 'Pending';
  }
};

const ActivityLog = ({ onBack, initialViewMode }) => {
  // FIX: Accept initialViewMode prop so MainSched can reopen this in 'archived' mode
  const [logs, setLogs] = useState([]);
  const [viewMode, setViewMode] = useState(initialViewMode || 'active'); 
  const [activeMenuId, setActiveMenuId] = useState(null); 
  const [now, setNow] = useState(new Date()); 

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  const loadLogs = useCallback(() => {
    const savedHearings     = JSON.parse(localStorage.getItem('hearings')) || [];
    const savedMinutesFiles = JSON.parse(localStorage.getItem('allMinutesFiles')) || [];
    const currentNow        = new Date();

    const processedLogs = [...savedHearings]
      .sort((a, b) => b.id - a.id)
      .map(hearing => {
        const minuteFile = savedMinutesFiles.find(
          m => m.hearingTitle === hearing.title ||
               m.matter === hearing.title ||
               String(m.linkedScheduleId) === String(hearing.id)
        );
        const liveStatus = computeLiveStatus(hearing, currentNow);
        return { 
          ...hearing,
          _liveStatus: liveStatus,
          hasMinutes: !!minuteFile, 
          minuteId: minuteFile ? minuteFile.id : null 
        };
      });

    if (viewMode === 'active') {
      setLogs(processedLogs.filter(h =>
        h._liveStatus === 'Pending' || h._liveStatus === 'In Session'
      ));
    } else {
      setLogs(processedLogs.filter(h =>
        h._liveStatus === 'Done' ||
        h._liveStatus === 'Cancelled' ||
        h._liveStatus === 'Finished'
      ));
    }
  }, [viewMode]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  useEffect(() => {
    const onStorage = () => loadLogs();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadLogs]);

  useEffect(() => { loadLogs(); }, [now, loadLogs]);

  const getDisplayStatus = (row) => row._liveStatus || row.status || 'Pending';

  const handleToggleMenu = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(prevId => (prevId === id ? null : id));
  };

  const handleArchive = (id) => {
    const saved   = JSON.parse(localStorage.getItem('hearings')) || [];
    const updated = saved.map(h => h.id === id ? { ...h, status: 'Done' } : h);
    localStorage.setItem('hearings', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    loadLogs();
    setActiveMenuId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Permanently delete this record?")) {
      const saved   = JSON.parse(localStorage.getItem('hearings')) || [];
      const updated = saved.filter(h => h.id !== id);
      localStorage.setItem('hearings', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      loadLogs();
      setActiveMenuId(null);
    }
  };

  const openCancelModal = (hearing) => {
    setSelectedHearing(hearing);
    setShowCancelModal(true);
    setActiveMenuId(null);
  };

  const submitCancellation = () => {
    const finalReason = cancelReason === 'Other' ? otherReason : cancelReason;
    if (!finalReason) return alert("Please select a reason.");
    const saved   = JSON.parse(localStorage.getItem('hearings')) || [];
    const updated = saved.map(h =>
      h.id === selectedHearing.id
        ? { ...h, status: 'Cancelled', cancelReason: finalReason }
        : h
    );
    localStorage.setItem('hearings', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setShowCancelModal(false);
    setCancelReason('');
    setOtherReason('');
    loadLogs();
  };

  const handleEdit = (row) => {
    navigate('/schedule', {
      state: {
        editFromLog: row,
        returnToActivityLog: true
      }
    });
  };

  // FIX: Pass returnToArchives: true when opening minutes from the Archives tab
  // so MinutesInfo knows to come back here (in archived mode) on back press.
  const handleViewMinutes = (row) => {
    if (row.status === 'Cancelled') return;

    const fromArchives = viewMode === 'archived';

    if (row.minuteId) {
      navigate('/minutesinfo', { 
        state: { 
          fileId: row.minuteId,
          // Active tab goes back to ActivityLog in active mode
          // Archives tab goes back to ActivityLog in archived mode
          returnToActivityLog: !fromArchives,
          returnToArchives: fromArchives,
          scheduleId: row.id
        } 
      });
    } else {
      navigate('/minutesinfo', { 
        state: { 
          initialData: row,
          returnToActivityLog: !fromArchives,
          returnToArchives: fromArchives,
          scheduleId: row.id
        } 
      });
    }
  };

  return (
    <div className="activity-log-page">
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Hearing</h3>
            <p>Reason for: <strong>{selectedHearing?.title}</strong></p>
            <div className="reason-options">
              {['Health Problems', 'Personal Problems', 'Schedule Conflict', 'Officer Unavailable', 'Other'].map(r => (
                <label key={r} className="reason-label">
                  <input 
                    type="radio" 
                    name="reason" 
                    value={r} 
                    onChange={(e) => setCancelReason(e.target.value)} 
                  /> {r}
                </label>
              ))}
            </div>
            {cancelReason === 'Other' && (
              <input 
                type="text" 
                placeholder="Specify reason..." 
                className="other-reason-input" 
                onChange={(e) => setOtherReason(e.target.value)} 
              />
            )}
            <div className="modal-footer">
              <button className="modal-btn-secondary" onClick={() => setShowCancelModal(false)}>Back</button>
              <button className="modal-btn-primary" onClick={submitCancellation}>Submit</button>
            </div>
          </div>
        </div>
      )}

      <div className="log-header-section">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Activity Log
        </button>
        <div className="view-toggle-container">
          <button 
            className={`toggle-btn ${viewMode === 'active' ? 'active' : ''}`} 
            onClick={() => setViewMode('active')}
          >
            <FaListUl /> Active
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'archived' ? 'active' : ''}`} 
            onClick={() => setViewMode('archived')}
          >
            <FaHistory /> Archives
          </button>
        </div>
      </div>

      <div className="log-container-card">
        <div className="table-wrapper-inner">
          <table className="activity-table">
            <thead>
              <tr>
                <th className="col-no">No.</th>
                <th className="col-officer">Officer</th>
                <th className="col-date">Date</th>
                <th className="col-time">Time</th>
                <th className="col-purpose">Purpose</th>
                <th className="col-status">Status</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((row, index) => {
                  const displayStatus = getDisplayStatus(row);
                  return (
                    <tr key={row.id}>
                      <td className="col-no">{index + 1}</td>
                      <td className="col-officer"><strong>{row.officer}</strong></td>
                      <td className="col-date">{row.date}</td>
                      <td className="col-time">{row.time}</td>
                      <td className="col-purpose">{row.title}</td>
                      <td className="col-status">
                        <span className={`status-pill ${displayStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="col-action">
                        {viewMode === 'active' ? (
                          <div className="active-action-group">
                            <button 
                              className="arch-btn edit" 
                              title="Edit" 
                              onClick={() => handleEdit(row)}
                            >
                              <FaEdit />
                            </button>
                            <div className="dot-menu-container">
                              <button 
                                className="opt-btn-trigger" 
                                onClick={(e) => handleToggleMenu(e, row.id)}
                              >
                                <FaEllipsisV />
                              </button>
                              {activeMenuId === row.id && (
                                <div className="dropdown-menu show" ref={dropdownRef}>
                                  <button onClick={() => handleArchive(row.id)} className="drop-item archive">
                                    <FaArchive /> Archive
                                  </button>
                                  <button onClick={() => openCancelModal(row)} className="drop-item cancel">
                                    <FaTimesCircle /> Cancel
                                  </button>
                                  <button onClick={() => handleDelete(row.id)} className="drop-item delete">
                                    <FaTrashAlt /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="archive-actions-group">
                            <button 
                              className={`arch-btn minutes ${row.hasMinutes ? 'exists' : 'empty'} ${row.status === 'Cancelled' ? 'disabled' : ''}`} 
                              onClick={() => handleViewMinutes(row)} 
                              disabled={row.status === 'Cancelled'}
                              title={row.hasMinutes ? "View Minutes" : "Create Minutes"}
                            >
                              <FaFileAlt />
                            </button>
                            <button 
                              className="arch-btn delete" 
                              title="Delete" 
                              onClick={() => handleDelete(row.id)}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="empty-msg">No {viewMode} records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;