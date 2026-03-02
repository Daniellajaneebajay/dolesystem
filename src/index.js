import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import UserManagement from "./UserManagement";
import Sidebar from "./Sidebar";
import Schedule from "./Schedule";
import Report from "./Report"; // Added import
import Settings from "./Settings"; // Added import

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <div style={{ display: "flex" }}>
      <Sidebar /> 
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/report" element={<Report />} /> {/* Updated component */}
          <Route path="/settings" element={<Settings />} /> {/* Updated component */}
          <Route path="/logout" element={<div className="p-20">Logging Out...</div>} />
        </Routes>
      </div>
    </div>
  </BrowserRouter>
);