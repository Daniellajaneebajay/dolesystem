import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import "./Minutes.css";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  FaSearch, FaFileAlt, FaEllipsisV, FaChevronLeft, 
  FaChevronRight, FaTrashAlt, FaArchive, FaCalendarCheck, 
  FaUserTie, FaInbox, FaArrowLeft, FaClock 
} from "react-icons/fa";

const Minutes = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem("allMinutesFiles");
    return saved ? JSON.parse(saved) : [];
  });

  const [hearings] = useState(() => {
    const saved = localStorage.getItem("hearings");
    if (!saved) return [];
    const allHearings = JSON.parse(saved);
    return allHearings.filter(h => {
      const status = h.status?.toLowerCase();
      return status !== "cancelled" && status !== "pending";
    });
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

  // Helper function to format party names for display
  const formatCaseTitle = (requestingParties, respondingParties) => {
    // Format requesting parties
    let requestingText = "";
    let respondingText = "";
    
    // Process requesting parties
    if (requestingParties && requestingParties.length > 0) {
      const validRequesting = requestingParties.filter(p => p && p.trim());
      if (validRequesting.length === 1) {
        requestingText = validRequesting[0];
      } else if (validRequesting.length > 1) {
        requestingText = `${validRequesting[0]}, et al.`;
      }
    }
    
    // Process responding parties  
    if (respondingParties && respondingParties.length > 0) {
      const validResponding = respondingParties.filter(p => p && p.trim());
      if (validResponding.length === 1) {
        respondingText = validResponding[0];
      } else if (validResponding.length > 1) {
        respondingText = `${validResponding[0]}, et al.`;
      }
    }
    
    // Format as "Requesting Party v. Responding Party"
    if (requestingText && respondingText) {
      return `${requestingText} v. ${respondingText}`;
    } else if (requestingText) {
      return requestingText;
    } else if (respondingText) {
      return respondingText;
    }
    
    return "Untitled Case";
  };

  // Helper function to render case title with styled "v."
  const renderCaseTitle = (caseTitle) => {
    if (!caseTitle) return "Untitled Case";
    
    // Split by " v. " to get requesting and responding parts
    const parts = caseTitle.split(' v. ');
    
    if (parts.length === 2) {
      // Has both requesting and responding parties
      return (
        <span className="case-title">
          {parts[0]}
          <span className="vs-separator"> v. </span>
          {parts[1]}
        </span>
      );
    }
    
    // No "v." found, return as is
    return <span className="case-title">{caseTitle}</span>;
  };

  // Helper function to get activity type (SEnA or Advice)
  const getActivityType = (doc) => {
    // Check from conferences first
    if (doc.conferences && doc.conferences.length > 0 && doc.conferences[0].activityType) {
      return doc.conferences[0].activityType;
    }
    
    // Check from matter field
    if (doc.matter) {
      const matterLower = doc.matter.toLowerCase();
      if (matterLower.includes('advice')) return 'Advice';
      if (matterLower.includes('sena')) return 'SEnA';
    }
    
    // Check from hearingTitle
    if (doc.hearingTitle) {
      const titleLower = doc.hearingTitle.toLowerCase();
      if (titleLower.includes('advice')) return 'Advice';
      if (titleLower.includes('sena')) return 'SEnA';
    }
    
    // Default to SEnA
    return 'SEnA';
  };

  // Helper function to get case title from a minute document
  const getCaseTitle = (doc) => {
    // FIRST: Check if there's a stored hearingTitle (from creation)
    if (doc.hearingTitle && doc.hearingTitle !== "" && !doc.hearingTitle.startsWith("Minute ")) {
      return doc.hearingTitle;
    }
    
    // SECOND: Try to get from conferences
    if (doc.conferences && doc.conferences.length > 0) {
      const conf = doc.conferences[0];
      if (conf.requestingParties || conf.respondingParties) {
        const title = formatCaseTitle(conf.requestingParties, conf.respondingParties);
        if (title !== "Untitled Case") {
          return title;
        }
      }
    }
    
    // THIRD: Try legacy fields
    if (doc.requestingParty || doc.respondingParty) {
      const requesting = doc.requestingParty ? doc.requestingParty.split(',').map(p => p.trim()) : [];
      const responding = doc.respondingParty ? doc.respondingParty.split(',').map(p => p.trim()) : [];
      const title = formatCaseTitle(requesting, responding);
      if (title !== "Untitled Case") {
        return title;
      }
    }
    
    // LAST RESORT: Return a generic title
    return `Case ${doc.id}`;
  };

  // Helper function to get display title for the hearing dropdown
  const getHearingDisplayTitle = (hearing) => {
    const requesting = hearing.requestingParty ? hearing.requestingParty.split(',').map(p => p.trim()) : [];
    const responding = hearing.respondingParty ? hearing.respondingParty.split(',').map(p => p.trim()) : [];
    const title = formatCaseTitle(requesting, responding);
    
    // If no parties, use the hearing title
    if (title === "Untitled Case") {
      return hearing.title || "Untitled Hearing";
    }
    return title;
  };

  // Check if we need to show the back button
  useEffect(() => {
    const returnData = localStorage.getItem('returnToViewSched');
    if (returnData) {
      setShowBackToSchedule(true);
    }
  }, []);

  // Handle highlighting when coming from search or schedule
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
    // Dispatch event to notify Dashboard that data has changed
    window.dispatchEvent(new Event('minutesUpdated'));
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

  // Helper function to extract party names from conference
  const getPartyNamesFromConferences = (doc) => {
    const partyNames = [];
    
    if (doc.conferences && doc.conferences.length > 0) {
      const conf = doc.conferences[0];
      
      // Add requesting parties
      if (conf.requestingParties && Array.isArray(conf.requestingParties)) {
        conf.requestingParties.forEach(party => {
          if (party && party.trim()) {
            partyNames.push(party.trim().toLowerCase());
          }
        });
      }
      
      // Add responding parties
      if (conf.respondingParties && Array.isArray(conf.respondingParties)) {
        conf.respondingParties.forEach(party => {
          if (party && party.trim()) {
            partyNames.push(party.trim().toLowerCase());
          }
        });
      }
    }
    
    // Also check for legacy data in requestingParty/respondingParty fields
    if (doc.requestingParty) {
      const parties = doc.requestingParty.split(',').map(p => p.trim().toLowerCase());
      partyNames.push(...parties);
    }
    
    if (doc.respondingParty) {
      const parties = doc.respondingParty.split(',').map(p => p.trim().toLowerCase());
      partyNames.push(...parties);
    }
    
    return partyNames;
  };

  // Updated search functionality - searches by docket number and party names
  const filteredDocs = documents.filter(doc => {
    const searchStr = searchTerm.toLowerCase().trim();
    
    if (!searchStr) return true;
    
    // Search by docket number
    const matchesDocketNo = doc.docketNo && doc.docketNo.toLowerCase().includes(searchStr);
    
    // Search by case title (formatted)
    const caseTitle = getCaseTitle(doc);
    const matchesCaseTitle = caseTitle.toLowerCase().includes(searchStr);
    
    // Search by party names
    const partyNames = getPartyNamesFromConferences(doc);
    const matchesPartyName = partyNames.some(partyName => partyName.includes(searchStr));
    
    // Also search by officer name
    const matchesOfficer = doc.officer && doc.officer.toLowerCase().includes(searchStr);
    
    const matchesSearch = matchesDocketNo || matchesCaseTitle || matchesPartyName || matchesOfficer;
    
    // Apply status filter
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

  const handleCreateFromHearing = () => {
    if (!selectedHearingId) return;
    const linkedHearing = hearings.find(h => h.id.toString() === selectedHearingId.toString());
    
    // Get party names from the hearing
    const requestingParties = linkedHearing.requestingParty ? 
      linkedHearing.requestingParty.split(',').map(p => p.trim()).filter(p => p !== "") : [];
    const respondingParties = linkedHearing.respondingParty ? 
      linkedHearing.respondingParty.split(',').map(p => p.trim()).filter(p => p !== "") : [];
    
    // Create case title from parties
    const caseTitle = formatCaseTitle(requestingParties, respondingParties);
    
    // Determine activity type from hearing title
    const activityType = linkedHearing.title && linkedHearing.title.toLowerCase().includes('advice') ? 'Advice' : 'SEnA';
    
    const alreadyExists = documents.some(doc => getCaseTitle(doc) === caseTitle);
    
    if (alreadyExists) {
      toast.warning(`Alert: A minute for "${caseTitle}" already exists.`);
      return; 
    }

    const nextNumber = documents.length > 0 
      ? Math.max(...documents.map(d => parseInt(String(d.id).replace(/\D/g, '')) || 0)) + 1 
      : 1;
    
    const newFile = {
      id: nextNumber,
      docketNo: "", 
      matter: caseTitle,
      hearingTitle: caseTitle,
      activityType: activityType,
      officer: linkedHearing.officer || "N/A",
      timestamp: new Date().toISOString(),
      status: "Pending", 
      selected: false,
      conferences: [{
        date: new Date().toISOString().split('T')[0],
        time: "",
        requestingParties: requestingParties.slice(0, 3),
        respondingParties: respondingParties.slice(0, 3),
        concerns: "",
        status: "Pending",
        paymentType: "",
        amountPaid: "0",
        totalAmount: "",
        activityType: activityType
      }]
    };

    setDocuments([newFile, ...documents]);
    setShowModal(false);
    setSelectedHearingId("");
    toast.success(`Minute created for "${caseTitle}"!`);
  };

  const handleDeleteSelected = () => {
    const selectedCount = documents.filter(d => d.selected).length;
    if (selectedCount === 0) return;
    setDocuments(documents.filter(doc => !doc.selected));
    setIsSelectionMode(false);
    toast.info(`Deleted ${selectedCount} items.`);
  };

  // FIXED: Updated to match the logic from Minutes.js (FIRST).
  // Uses navigate('/minutesinfo') with state instead of URL parameters.
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
              <select className="modal-select-dropdown" value={selectedHearingId} onChange={(e) => setSelectedHearingId(e.target.value)}>
                <option value="">-- Choose Hearing --</option>
                {hearings.map(h => {
                  const displayTitle = getHearingDisplayTitle(h);
                  return <option key={h.id} value={h.id}>{displayTitle}</option>;
                })}
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
          <select className="filter-select-box" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="all">All Status</option>
            <option value="Settled">Settled</option>
            <option value="Partial">Partial</option>
            <option value="Lack of Interest">Lack of Interest</option>
            <option value="Approval for Endorsement">Approval</option>
          </select>
        </div>

        <div className="button-actions-group">
          <button className="btn-add-fixed" onClick={() => setShowModal(true)}>ADD MINUTE</button>
          <button className={`btn-select-fixed ${isSelectionMode ? "active-mode" : ""}`} onClick={handleSelectToggle}>
            {!isSelectionMode ? "SELECT" : (filteredDocs.every(d => d.selected) && filteredDocs.length > 0 ? "UNSELECT ALL" : "SELECT ALL")}
          </button>
          <button className="btn-delete-fixed" onClick={handleDeleteSelected} disabled={!documents.some(d => d.selected)}>DELETE</button>
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
                  // UPDATED: Using the handleCardClick function
                  onClick={() => handleCardClick(doc)}
                >
                  <div className="card-left">
                    <FaFileAlt className={`doc-icon ${doc.status?.replace(/\s+/g, '-').toLowerCase()}`} />
                    <div className="doc-details">
                      {/* Case Title with styled "v." */}
                      <div className="doc-id">
                        {renderCaseTitle(getCaseTitle(doc))}
                      </div>
                      
                      {/* Activity Type - Small badge */}
                      <div className="doc-activity-type">
                        <span className={`activity-badge-small ${getActivityType(doc).toLowerCase()}`}>
                          {getActivityType(doc)}
                        </span>
                      </div>
                      
                      {/* Officer and Time */}
                      <div className="doc-meta-info">
                        <div className="meta-row">
                          <span><FaUserTie /> {doc.officer}</span>
                          <span className="time-stamp"><FaClock /> {getRelativeTime(doc.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="options-menu" onClick={(e) => e.stopPropagation()}>
                    <FaEllipsisV className="doc-options" />
                    <div className="dropdown-menu">
                      <button onClick={() => toast.info("Archive functionality requested.")}><FaArchive /> Archive</button>
                      <button className="delete-opt" onClick={() => {
                          const updated = documents.filter(d => d.id !== doc.id);
                          setDocuments(updated);
                          window.dispatchEvent(new Event('minutesUpdated'));
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
            <FaChevronLeft className={`arrow ${currentPage === 1 ? 'disabled' : ''}`} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
            {[...Array(totalPages)].map((_, i) => (
              <span key={i} className={`page-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</span>
            ))}
            <FaChevronRight className={`arrow ${currentPage === totalPages ? 'disabled' : ''}`} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Minutes;