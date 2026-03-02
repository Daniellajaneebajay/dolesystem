import React, { useState } from "react";
import "./Settings.css";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="settings-page">
      {/* The Diagonal Split Background */}
      <div className="settings-bg-split"></div>
      
      <div className="settings-content-wrapper">
        <div className="settings-header">
          <h1>Settings</h1>
        </div>

        <div className="settings-main-layout">
          <div className="settings-left-column">
            {/* Notifications Card */}
            <div className="settings-card shadow-glow">
              <h3>Notifications</h3>
              <div className="notif-control">
                <span>Enable all notifications</span>
                <label className="settings-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications} 
                    onChange={() => setNotifications(!notifications)} 
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>
              <div className="notif-status-labels">
                <span className={notifications ? "text-blue" : "text-gray"}>On</span>
                <span className={!notifications ? "text-blue" : "text-gray"}>Off</span>
              </div>
            </div>

            {/* Account Management Card */}
            <div className="settings-card shadow-glow">
              <h3>Account Management</h3>
              <div className="settings-input-container">
                <input type="password" placeholder="Password" defaultValue="password123" />
              </div>
              <button className="btn-delete-account">Delete Account</button>
            </div>
          </div>

          <div className="settings-right-column">
            {/* Profile Card */}
            <div className="settings-card profile-card-center shadow-glow">
              <h3>Profile Picture</h3>
              <div className="profile-avatar-border">
                <img 
                  src="/assets/unknown.jpg" 
                  alt="User Profile" 
                  className="profile-avatar-img" 
                />
              </div>
              <h2 className="profile-display-name">Nancy Wheeler</h2>
              <button className="btn-logout-settings">Logout</button>
            </div>
          </div>
        </div>

        <div className="settings-action-footer">
          <button className="btn-save-changes">SAVE CHANGES</button>
          <button className="btn-discard-settings">DISCARD</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;