import React, { useState } from "react";
import "./Minutes.css";
import { 
  FaSearch, 
  FaFileAlt, 
  FaEllipsisV, 
  FaChevronLeft, 
  FaChevronRight, 
  FaFileUpload 
} from "react-icons/fa";

const Minutes = () => {
  // Main state for the document list
  const [documents, setDocuments] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      id: `RFA 1.1 - ${String(i + 1).padStart(4, '0')}`,
      time: "Uploaded 1 min ago",
      selected: false
    }))
  );

  const [showModal, setShowModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // --- Logic Functions ---

  const toggleSelect = (index) => {
    const updatedDocs = [...documents];
    updatedDocs[index].selected = !updatedDocs[index].selected;
    setDocuments(updatedDocs);
  };

  const handleSelectAll = () => {
    const allSelected = documents.every(doc => doc.selected);
    setDocuments(documents.map(doc => ({ ...doc, selected: !allSelected })));
  };

  const handleDeleteSelected = () => {
    const selectedCount = documents.filter(d => d.selected).length;
    if (selectedCount === 0) return alert("Please select items to delete first.");
    if (window.confirm(`Are you sure you want to delete ${selectedCount} items?`)) {
      setDocuments(documents.filter(doc => !doc.selected));
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return alert("Please enter a file name.");
    const newFile = {
      id: newFileName,
      time: "Uploaded now",
      selected: false
    };
    setDocuments([newFile, ...documents]); 
    setNewFileName("");
    setShowModal(false);
  };

  const deleteSingleFile = (id) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  return (
    <div className="minutes-page">
      {/* File Upload Modal Overlay */}
      {showModal && (
        <div className="minutes-modal-overlay">
          <div className="upload-modal">
            <div className="minutes-modal-header">
              <FaFileUpload className="minutes-modal-upload-icon" />
              <span>File Upload</span>
            </div>
            <input 
              type="text" 
              className="minutes-modal-input" 
              placeholder="Untitled File"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              autoFocus
            />
            <div className="minutes-modal-actions">
              <button className="minutes-modal-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="minutes-modal-btn-create" onClick={handleCreateFile}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <header className="minutes-header">
        <h1>Minutes of Case Proceedings</h1>
        <p>View, manage, and track all client session minutes.</p>
      </header>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="minutes-search-container">
          <FaSearch className="minutes-search-icon" />
          <input type="text" placeholder="Search" />
        </div>
        <div className="button-group">
          <button className="btn-add" onClick={() => setShowModal(true)}>ADD FILE</button>
          <button className="btn-select" onClick={handleSelectAll}>
            {documents.length > 0 && documents.every(d => d.selected) ? "DESELECT ALL" : "SELECT ALL"}
          </button>
          <button className="btn-delete" onClick={handleDeleteSelected}>DELETE</button>
        </div>
      </div>

      {/* Filter Dropdown */}
      <div className="filter-container">
        <span className="filter-label">Filter By:</span>
        <select className="filter-dropdown">
          <option value="select">Select</option>
          <option value="settled">Settled</option>
          <option value="lack_of_interest">Lack of Interest</option>
          <option value="approval">Approval for Indorsement</option>
        </select>
      </div>

      {/* Grid Container */}
      <div className="grid-container">
        <div className="doc-grid">
          {documents.map((doc, index) => (
            <div 
              key={doc.id} 
              className={`document-card ${doc.selected ? "is-selected" : ""}`}
              onClick={() => toggleSelect(index)}
            >
              <div className="card-left">
                <FaFileAlt className="doc-icon" />
                <div className="doc-details">
                  <span className="doc-id">{doc.id}</span>
                  <span className="doc-timestamp">{doc.time}</span>
                </div>
              </div>

              {/* Three-dots individual actions */}
              <div className="options-menu" onClick={(e) => e.stopPropagation()}>
                <FaEllipsisV className="doc-options" />
                <div className="dropdown-menu">
                  <button onClick={() => alert("Editing " + doc.id)}>Edit</button>
                  <button onClick={() => alert("Archiving " + doc.id)}>Archive</button>
                  {/* Using the function here to clear the ESLint warning */}
                  <button 
                    className="menu-delete-btn" 
                    onClick={() => deleteSingleFile(doc.id)}
                    style={{ color: '#ff4d4d' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <footer className="grid-footer">
          <div className="pagination-controls">
            <FaChevronLeft className="arrow" />
            <span className="page-num">1</span>
            <span className="page-num">2</span>
            <span className="page-num active">3</span>
            <span className="page-dots">...</span>
            <span className="page-num">5</span>
            <FaChevronRight className="arrow" />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Minutes;
