import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./Report.css";

const reportData = [
  { name: "APARECIO", value: 15, color: "#ff4d4d", img: "/assets/unknown2.jpg" },
  { name: "BUSANGILAN", value: 5, color: "#ff8533", img: "/assets/unknown.jpg" },
  { name: "CALING", value: 10, color: "#ffad33", img: "assets/unknown2.jpg" },
  { name: "CANO", value: 8, color: "#ffdb4d", img: "assets/unknown2.jpg" },
  { name: "TALON", value: 12, color: "#d9ff66", img: "/assets/unknown2.jpg" },
  { name: "CASIÑO", value: 14, color: "#a3ff66", img: "/assets/unknown2.jpg" },
  { name: "DALAGAN", value: 13, color: "#66ff66", img: "/assets/unknown2.jpg" },
  { name: "TANGARA", value: 9, color: "#4dff88", img: "/assets/unknown.jpg" },
  { name: "UMBAL", value: 11, color: "#33ffad", img: "/assets/unknown.jpg" },
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const reports = ["All", "Settle", "Unsettle"];

const ReportSettle = () => {
  const navigate = useNavigate(); 

  const handleReportChange = (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "Settle") {
      navigate("/reportsettle"); 
    } else if (selectedValue === "Unsettle") {
      navigate("/reportunsettle");
    } else if (selectedValue === "All") {
      navigate("/report");
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h1 className="report-title">Settle Office Report</h1>

        <div className="header-right-controls">
          <button className="download-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21H19.439a2 2 0 001.94-1.515L22 17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download All Reports
          </button>

          <div className="selectors-row">
          <div className="month-selector">
            <label>Select Month: </label>
            <select className="month-dropdown">
              <option>Select</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="report-selector">
            <label>Select Report: </label>
            <select 
              className="report-dropdown" 
              onChange={handleReportChange} 
              defaultValue="Settle"
            >
              {reports.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <div className="chart-area">
          {reportData.map((officer, index) => (
            <div key={index} className="bar-group">
              <div className="bar-value">{officer.value}</div>
              <div
                className="bar"
                style={{
                  height: `${officer.value * 20}px`,
                  backgroundColor: officer.color
                }}
              ></div>
              <div className="officer-avatar-wrapper">
                <img src={officer.img} alt={officer.name} className="report-avatar" />
              </div>
              <p className="officer-label">{officer.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportSettle;