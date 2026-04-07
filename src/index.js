import React, { useState } from "react"; 
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword"; 
import ResetPassword from "./ResetPassword"; 
import App from "./App";
import Schedule from "./Schedule";
import UserManagement from "./UserManagement";
import Sidebar from "./Sidebar";
import Report from "./Report"; 
import ReportSettle from "./ReportSettle";
import ReportUnsettle from "./ReportUnsettle";
import Settings from "./Settings";
import EditProfile from "./EditProfile";
import Minutes from "./Minutes";

const RootComponent = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  
  // User profile state
  const [userData, setUserData] = useState({
    name: "Nancy Wheeler",
    email: "nancy.wheeler@gmail.com",
    image: "/assets/unknown.jpg"
  });

  /**
   * Logic: Only allows "Admin" to enter the dashboard.
   * This function is passed to Login.js as a prop.
   */
  const handleLogin = (role) => {
    if (role === "Admin") {
      setIsAuthenticated(true);
    } else if (role === "Officer") {
      // Prevents Officers from entering the Admin Dashboard
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
        /* --- AUTHENTICATED VIEW (Admin Dashboard) --- */
        <div style={{ display: "flex" }}>
          <Sidebar user={userData} onLogout={handleLogout} /> 
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/report" element={<Report />} />
              <Route path="/reportsettle" element={<ReportSettle />} />
              <Route path="/reportunsettle" element={<ReportUnsettle />} />
              <Route path="/minutes" element={<Minutes />} />
              <Route path="/settings" element={<Settings />} />
              <Route 
                path="/edit-profile" 
                element={<EditProfile user={userData} setUser={setUserData} />} 
              />
              {/* If logged in and route doesn't exist, go to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      ) : (
        /* --- UNAUTHENTICATED VIEW (Public Access) --- */
        <Routes>
          {/* Passing the handleLogin logic to the Login component */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* If not logged in, always redirect to login screen */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RootComponent />);
