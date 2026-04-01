import React, { useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const officers = [
  { name: "APARECIO, Harold D.", position: "SR. LEO", status: "Available", rfa: 5, image: "/assets/unknown2.jpg" },
  { name: "CALING, Mhardy Mae V.", position: "SR. LEO", status: "Available", rfa: 4, image: "/assets/unknown.jpg" },
  { name: "CANO, Paolo Miguel P.", position: "SR. LEO", status: "Available", rfa: 3, image: "/assets/unknown2.jpg" },
  { name: "BUSANGILAN, Rommy C.", position: "LEO III", status: "Unavailable", rfa: 7, image: "/assets/unknown2.jpg" },
  { name: "CASIÑO, Roy S.", position: "LEO III", status: "Unavailable", rfa: 6, image: "/assets/unknown2.jpg" },
  { name: "TALON, Sittie Nashiba D.", position: "SR. LEO", status: "Unavailable", rfa: 5, image: "/assets/unknown.jpg" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const handleRowClick = (time, topic, hearingType = "1st Hearing") => {
    if (topic.includes("Hearing") || topic.includes("Session")) {
      setSelectedData({
        time: time,
        hearingTitle: hearingType,
        requestingParty: "Lisa Manoban",
        respondingParty: "Jungkook Jung",
        claims: "Sexual Harassment / Labor Standards Violation"
      });
      setShowModal(true);
    }
  };

  const onSelectingHearing = (e) => {
    const value = e.target.value;
    if (value !== "Select") {
      navigate("/minutes", {
        state: {
          hearingNumber: value,
          party: selectedData.requestingParty,
          case: selectedData.claims
        }
      });
    }
  };

  return (
    <div className="main-content">
     
      {showModal && selectedData && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">More Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="hearing-header-row">
              <h2 className="hearing-count-title">{selectedData.hearingTitle}</h2>
              
              {(selectedData.hearingTitle.includes("2nd") || selectedData.hearingTitle.includes("3rd")) && (
                <div className="recent-filter">
                  <span>Recent: </span>
                  
                  <select className="modal-mini-select" onChange={onSelectingHearing}>
                    <option value="Select">Select</option>
                    <option value="1st Hearing">1st Hearing</option>
                    {selectedData.hearingTitle.includes("3rd") && (
                       <option value="2nd Hearing">2nd Hearing</option>
                    )}
                  </select>
                </div>
              )}
            </div>
            
            <div className="modal-body-content">
              <div className="detail-item">
                <label className="detail-label">Time</label>
                <div className="modal-field">{selectedData.time}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">Requesting Party</label>
                <div className="modal-field">{selectedData.requestingParty}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">Responding Party</label>
                <div className="modal-field">{selectedData.respondingParty}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">Claims/Issues</label>
                <div className="modal-field">{selectedData.claims}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="header-row">
        <h1 className="main-title">
          <span className="red-text">Availability</span>{" "}
          <span className="blue-text">of Officers</span>
        </h1>
        <div className="header-actions">
          <div className="filter-group">
            <label>Filter By:</label>
            <select><option>Select</option><option>Available</option></select>
          </div>
          <button className="manage-btn" onClick={() => navigate("/user-management")}>
            Manage Officers
          </button>
        </div>
      </div>

      <div className="blue-grid-container">
        <div className="officer-grid">
          {officers.map((officer, index) => {
            const isAvailable = officer.status === "Available";
            const statusColor = isAvailable ? "#28a745" : "#cc0000";

            return (
              <div key={index} className="officer-card">
                <div className="card-top">
                  <div className="avatar-wrapper" style={{ borderColor: statusColor }}>
                    <img src={officer.image} alt={officer.name} />
                  </div>

                  <div className="name-details">
                    <h4>{officer.name}</h4>
                    <p>{officer.position}</p>
                    <div className="status-text">
                      <span className="status-dot" style={{ backgroundColor: statusColor }}></span>
                      <span style={{ color: statusColor, fontWeight: "bold" }}>
                        {officer.status}
                      </span>
                    </div>
                  </div>
                  <div className="rfa-count">RFA: {officer.rfa}</div>
                </div>

                <div className="status-selector-row">
                  <span>Status: </span>
                  <select className="mini-select">
                    <option value="">Select</option>
                    <option value="vacant">Vacant</option>
                    <option value="wait">Waiting for client</option>
                  </select>
                </div>

                <div className="inner-table-wrapper">
                  <table className="inner-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Topic</th>
                        <th>Client Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="clickable-row" onClick={() => handleRowClick("8:00 AM - 9:00 AM", "Hearing in Session", "3rd Hearing")}>
                        <td>8:00 AM - 9:00 AM</td>
                        <td className="topic-col red-t">Hearing in Session</td>
                        <td>Hearing</td>
                      </tr>
                      <tr className="clickable-row" onClick={() => handleRowClick("9:00 AM - 9:30 AM", "Pending Hearing", "2nd Hearing")}>
                        <td>9:00 AM - 9:30 AM</td>
                        <td className="topic-col red-t">Pending Hearing</td>
                        <td>Waiting</td>
                      </tr>
                      <tr className="clickable-row" onClick={() => handleRowClick("9:30 AM - 10:30 AM", "Hearing", "1st Hearing")}>
                        <td>9:30 AM - 10:30 AM</td>
                        <td className="topic-col red-t">Hearing</td>
                        <td>None</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="pagination-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
