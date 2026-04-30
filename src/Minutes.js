import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import "./Minutes.css";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  FaSearch, FaFileAlt, FaEllipsisV, FaChevronLeft, 
  FaChevronRight, FaTrashAlt, FaArchive, FaCalendarCheck, 
  FaUserTie, FaInbox, FaArrowLeft 
} from "react-icons/fa";

const Minutes = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem("allMinutesFiles");
    return saved ? JSON.parse(saved) : [];
  });

  // Load ALL hearings (not filtered) so we can look up full schedule data
  const [hearings] = useState(() => {
    const saved = localStorage.getItem("hearings");
    if (!saved) return [];
    return JSON.parse(saved);
  });

  // Filtered hearings for the "Link to Hearing" modal (exclude cancelled/pending)
  const availableHearings = hearings.filter(h => {
    const status = h.status?.toLowerCase();
    return status !== "cancelled" && status !== "pending";
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [showModal, setShowModal] = useState(false);
  const [selectedHearingId, setSelectedHearingId] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [isSelectionMode, setIsSelectionMode] = useState(false); 
  const [highlightId, setHighlightId] = useState(null);
  const [showBackToSchedule, setShowBackToSchedule] = useState(false);
  
  const itemsPerPage = 12;

  useEffect(() => {
    const returnData = localStorage.getItem('returnToViewSched');
    if (returnData) setShowBackToSchedule(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idToHighlight = params.get('highlight');
    if (idToHighlight && documents.length > 0) {
      const itemIndex = documents.findIndex(d => String(d.id) === String(idToHighlight));
      if (itemIndex !== -1) {
        const targetPage = Math.ceil((itemIndex + 1) / itemsPerPage);
        setCurrentPage(targetPage);
        setHighlightId(idToHighlight);
        const timer = setTimeout(() => {
          setHighlightId(null); 
          navigate('/minutes', { replace: true }); 
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [location.search, documents, navigate]);

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const now = new Date();
    const uploadedAt = new Date(timestamp);
    const diffInSeconds = Math.floor((now - uploadedAt) / 1000);
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    return uploadedAt.toLocaleDateString();
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    const interval = setInterval(forceUpdate, 60000);
    return () => clearInterval(interval);
  }, [forceUpdate]);

  useEffect(() => {
    localStorage.setItem("allMinutesFiles", JSON.stringify(documents));
  }, [documents]);

  const handleBackToSchedule = () => {
    const returnData = localStorage.getItem('returnToViewSched');
    if (returnData) {
      localStorage.removeItem('returnToViewSched');
      navigate(-1);
    } else {
      navigate('/minutes');
    }
  };

  const getPartyNamesFromConferences = (doc) => {
    const partyNames = [];
    if (doc.conferences && doc.conferences.length > 0) {
      const conf = doc.conferences[0];
      if (conf.requestingParties && Array.isArray(conf.requestingParties)) {
        conf.requestingParties.forEach(party => {
          if (party && party.trim()) partyNames.push(party.trim().toLowerCase());
        });
      }
      if (conf.respondingParties && Array.isArray(conf.respondingParties)) {
        conf.respondingParties.forEach(party => {
          if (party && party.trim()) partyNames.push(party.trim().toLowerCase());
        });
      }
    }
    if (doc.requestingParty) {
      partyNames.push(...doc.requestingParty.split(',').map(p => p.trim().toLowerCase()));
    }
    if (doc.respondingParty) {
      partyNames.push(...doc.respondingParty.split(',').map(p => p.trim().toLowerCase()));
    }
    return partyNames;
  };

  const filteredDocs = documents.filter(doc => {
    const searchStr = searchTerm.toLowerCase().trim();
    if (!searchStr) return true;
    const matchesDocketNo = doc.docketNo && doc.docketNo.toLowerCase().includes(searchStr);
    const matchesHearingTitle = doc.hearingTitle && doc.hearingTitle.toLowerCase().includes(searchStr);
    const partyNames = getPartyNamesFromConferences(doc);
    const matchesPartyName = partyNames.some(n => n.includes(searchStr));
    const matchesOfficer = doc.officer && doc.officer.toLowerCase().includes(searchStr);
    const matchesSearch = matchesDocketNo || matchesHearingTitle || matchesPartyName || matchesOfficer;
    const currentStatus = doc.status?.toLowerCase() || "pending";
    const matchesFilter = filterStatus === "all" || currentStatus === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleSelectToggle = () => {
    const allVisibleSelected = filteredDocs.length > 0 && filteredDocs.every(d => d.selected);
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    } else if (!allVisibleSelected) {
      setDocuments(prev => prev.map(doc => {
        const isVisible = filteredDocs.some(v => v.id === doc.id);
        return isVisible ? { ...doc, selected: true } : doc;
      }));
    } else {
      setIsSelectionMode(false);
      setDocuments(prev => prev.map(doc => ({ ...doc, selected: false })));
    }
  };

  // FIXED: Pull full schedule/hearing data from hearings localStorage
  // and pre-populate the minute with requestingParty, respondingParty,
  // time, date, officer, laborViolation from the linked hearing
  const handleCreateFromHearing = () => {
    if (!selectedHearingId) return;
    const linkedHearing = hearings.find(h => h.id.toString() === selectedHearingId.toString());
    if (!linkedHearing) return;

    const alreadyExists = documents.some(
      doc => doc.hearingTitle === linkedHearing.title || doc.linkedScheduleId === linkedHearing.id
    );
    if (alreadyExists) {
      toast.warning(`A minute for "${linkedHearing.title}" already exists.`);
      return; 
    }

    const nextNumber = documents.length > 0 
      ? Math.max(...documents.map(d => parseInt(String(d.id).replace(/\D/g, '')) || 0)) + 1 
      : 1;

    // Build date string from hearing's year/monthName/day
    let scheduleDate = "";
    if (linkedHearing.year && linkedHearing.monthName && linkedHearing.day) {
      const monthIndex = new Date(Date.parse(linkedHearing.monthName + " 1, 2000")).getMonth();
      const dateObj = new Date(linkedHearing.year, monthIndex, parseInt(linkedHearing.day));
      scheduleDate = dateObj.toISOString().split('T')[0];
    } else {
      scheduleDate = new Date().toISOString().split('T')[0];
    }

    // Parse start time from "HH:MM AM to HH:MM PM" format
    const formatTo24Hour = (timeStr) => {
      if (!timeStr) return "";
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return "";
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const modifier = match[3].toUpperCase();
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    };
    const startTime = linkedHearing.time?.split(' to ')[0] || "";

    // Parse requesting/responding parties from comma-separated strings
    const parseParties = (partyStr) => {
      if (!partyStr) return ["", "", ""];
      const names = partyStr.split(',').map(n => n.trim()).filter(n => n !== "");
      return names.length >= 3 ? names : [...names, "", "", ""].slice(0, 3);
    };

    const newFile = {
      id: nextNumber,
      docketNo: "",
      matter: linkedHearing.title,
      hearingTitle: linkedHearing.title,
      officer: linkedHearing.officer || "N/A",
      timestamp: new Date().toISOString(),
      status: "Pending",
      selected: false,
      linkedScheduleId: linkedHearing.id,   // store link for back-navigation
      // Store schedule fields at top level for easy access
      scheduleData: linkedHearing,
      conferences: [{
        date: scheduleDate,
        time: formatTo24Hour(startTime),
        requestingParties: parseParties(linkedHearing.requestingParty),
        respondingParties: parseParties(linkedHearing.respondingParty),
        concerns: "",
        status: "Pending",
        paymentType: "",
        amountPaid: "0",
        totalAmount: ""
      }]
    };

    setDocuments([newFile, ...documents]);
    setShowModal(false);
    setSelectedHearingId("");
    toast.success("Minute created!");
  };

  const handleDeleteSelected = () => {
    const selectedCount = documents.filter(d => d.selected).length;
    if (selectedCount === 0) return;
    setDocuments(documents.filter(doc => !doc.selected));
    setIsSelectionMode(false);
    toast.info(`Deleted ${selectedCount} items.`);
  };

  // FIXED: Navigate to /minutesinfo (matches index.js route) passing
  // fileId via location.state so MinutesInfo can load the correct record
  const handleCardClick = (doc) => {
    if (isSelectionMode) {
      setDocuments(prev =>
        prev.map(d => d.id === doc.id ? { ...d, selected: !d.selected } : d)
      );
      return;
    }
    navigate('/minutesinfo', {
      state: {
        fileId: doc.id,
        returnToMinutes: true
      }
    });
  };

  const currentItems = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / itemsPerPage));

  return (
    <div className="minutes-page">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="upload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-box">
              <FaCalendarCheck className="modal-upload-icon" />
              <span>Link Minute to Hearing</span>
            </div>
            <div className="modal-body">
              <select
                className="modal-select-dropdown"
                value={selectedHearingId}
                onChange={(e) => setSelectedHearingId(e.target.value)}
              >
                <option value="">-- Choose Hearing --</option>
                {availableHearings.map(h => (
                  <option key={h.id} value={h.id}>{h.title}</option>
                ))}
              </select>
              <div className="modal-actions">
                <button className="modal-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="modal-btn-create" onClick={handleCreateFromHearing} disabled={!selectedHearingId}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="minutes-header">
        <div className="header-with-back">
          {showBackToSchedule && (
            <button className="back-to-schedule-btn" onClick={handleBackToSchedule}>
              <FaArrowLeft /> Back to Schedule
            </button>
          )}
          <div className="header-text-section">
            <h1>Minutes of Case Proceedings</h1>
            <p>View, manage, and track all client session minutes.</p>
          </div>
        </div>
      </header>

      <div className="horizontal-action-bar">
        <div className="search-box-wrapper">
          <FaSearch className="search-icon-fixed" />
          <input 
            type="text" 
            placeholder="Search by Docket #, Party Name, or Case Title..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="filter-inline-container">
          <span className="filter-label-text">Filter By:</span>
          <select
            className="filter-select-box"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Status</option>
            <option value="Settled">Settled</option>
            <option value="Partial">Partial</option>
            <option value="Lack of Interest">Lack of Interest</option>
            <option value="Approval for Endorsement">Approval</option>
          </select>
        </div>

        <div className="button-actions-group">
          <button className="btn-add-fixed" onClick={() => setShowModal(true)}>ADD MINUTE</button>
          <button
            className={`btn-select-fixed ${isSelectionMode ? "active-mode" : ""}`}
            onClick={handleSelectToggle}
          >
            {!isSelectionMode
              ? "SELECT"
              : filteredDocs.every(d => d.selected) && filteredDocs.length > 0
                ? "UNSELECT ALL"
                : "SELECT ALL"}
          </button>
          <button
            className="btn-delete-fixed"
            onClick={handleDeleteSelected}
            disabled={!documents.some(d => d.selected)}
          >
            DELETE
          </button>
        </div>
      </div>

      <div className="grid-container-fixed">
        <div className="doc-grid-scroll-area">
          {currentItems.length > 0 ? (
            <div className="doc-grid">
              {currentItems.map((doc) => (
                <div 
                  key={doc.id} 
                  className={`document-card ${doc.selected ? "is-selected" : ""} ${String(doc.id) === String(highlightId) ? "glow-highlight" : ""}`} 
                  onClick={() => handleCardClick(doc)}
                >
                  <div className="card-left">
                    <FaFileAlt className={`doc-icon ${doc.status?.replace(/\s+/g, '-').toLowerCase()}`} />
                    <div className="doc-details">
                      <span className="doc-id">{doc.docketNo || `Minute ${doc.id}`}</span>
                      <div className="doc-meta-info">
                        <span className="hearing-subtext">{doc.hearingTitle}</span>
                        <div className="meta-row">
                          <span><FaUserTie /> {doc.officer}</span>
                          <span className="time-stamp">{getRelativeTime(doc.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="options-menu" onClick={(e) => e.stopPropagation()}>
                    <FaEllipsisV className="doc-options" />
                    <div className="dropdown-menu">
                      <button onClick={() => toast.info("Archive functionality requested.")}>
                        <FaArchive /> Archive
                      </button>
                      <button className="delete-opt" onClick={() => {
                        setDocuments(documents.filter(d => d.id !== doc.id));
                        toast.info("Minute deleted.");
                      }}>
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-container">
              <FaInbox className="empty-icon" />
              <h3>No Minutes Recorded</h3>
            </div>
          )}
        </div>
        
        <footer className="grid-footer">
          <div className="pagination-controls">
            <FaChevronLeft
              className={`arrow ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            />
            {[...Array(totalPages)].map((_, i) => (
              <span
                key={i}
                className={`page-num ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </span>
            ))}
            <FaChevronRight
              className={`arrow ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Minutes;