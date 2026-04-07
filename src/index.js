import React, { useState } from "react"; 
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import UserManagement from "./UserManagement";
import Sidebar from "./Sidebar";
import Schedule from "./Schedule";
import Minutes from "./Minutes"; 
import Report from "./Report"; 
import ReportSettle from "./ReportSettle"; 
import ReportUnsettle from "./ReportUnsettle"; 
import Settings from "./Settings";
import EditProfile from "./EditProfile";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword"; 
import ResetPassword from "./ResetPassword"; 

const RootComponent = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  
  // User profile state
  const [userData, setUserData] = useState({
    name: "Admin",
    email: "dolecdofo@gmail.com",
    image: "/assets/unknown.jpg"
  });

  const handleLogin = (role) => {
    if (role === "Admin") {
      setIsAuthenticated(true);
    } else if (role === "Officer") {
      alert("Access Denied: Officers must use the DOLE Mobile App.");
    } else {
      alert("Please select a role to continue.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <div style={{ display: "flex" }}>
          <Sidebar user={userData} onLogout={handleLogout} /> 
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/minutes" element={<Minutes />} /> 
              <Route path="/report" element={<Report />} />
              <Route path="/reportsettle" element={<ReportSettle />} />
              <Route path="/reportunsettle" element={<ReportUnsettle />} />
              <Route path="/settings" element={<Settings />} />
              <Route 
                path="/edit-profile" 
                element={<EditProfile user={userData} setUser={setUserData} />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RootComponent />);
