import React, { useState } from "react";
import "./EditProfile.css";
import { FaCloudUploadAlt, FaEye, FaEyeSlash } from "react-icons/fa";

const EditProfile = () => {
  // --- STATE FOR PROFILE ---
  const [user, setUser] = useState({
    name: "Nancy Wheeler",
    email: "nancy.wheeler@gmail.com",
    image: "/assets/unknown.jpg", 
  });

  // --- LOCAL FORM STATE ---
  // Splitting name into first and last for the inputs
  const [formData, setFormData] = useState({
    firstName: user.name.split(" ")[0] || "",
    lastName: user.name.split(" ")[1] || "",
    email: user.email,
    image: user.image
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePersonal = () => {
    // Combine first and last name back into one string for the user object
    const updatedUser = {
      ...user,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      image: formData.image
    };
    setUser(updatedUser);
    alert("Personal Information Updated!");
  };

  const handleSavePassword = () => {
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password Updated Successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Update your profile</p>
      </div>

      {/* --- Section 1: Profile Photo Upload --- */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Personal Information</h2>
          <p>This image will be displayed on your profile.</p>
        </div>

        <div className="inner-card photo-flex">
          <div className="avatar-large">
            <img src={formData.image} alt="Profile Large" />
          </div>
          <div className="upload-box">
            <FaCloudUploadAlt className="upload-icon-svg" />
            <p>Click or drag to upload a new photo</p>
            <span style={{ fontSize: "10px", color: "#9ca3af" }}>
              JPG, PNG or GIF (Max 800kb)
            </span>
          </div>
          <div className="card-actions-fixed">
            <button className="btn-text cancel">Cancel</button>
            <button className="btn-text save" onClick={handleSavePersonal}>Save</button>
          </div>
        </div>
      </div>

      {/* --- Section 2: Personal Details Form (Position Removed) --- */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Personal Information</h2>
          <p>Update your personal details here.</p>
        </div>

        <div className="inner-card">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Nancy"
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Wheeler"
              />
            </div>
          </div>

          <div className="form-group last-in-card">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="nancy.wheeler@gmail.com"
            />
          </div>

          <div className="card-actions">
            <button className="btn-text cancel">Cancel</button>
            <button className="btn-text save" onClick={handleSavePersonal}>
              Save
            </button>
          </div>
        </div>
      </div>

      {/* --- Section 3: Password Update Form --- */}
      <div className="outer-card">
        <div className="card-intro">
          <h2>Password</h2>
          <p>Enter current password to make update.</p>
        </div>

        <div className="inner-card">
          <div className="form-group">
            <label>Current Password</label>
            <div className="input-with-icon">
              <input
                type={showCurrent ? "text" : "password"}
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                placeholder="Current Password"
              />
              <div className="icon-trigger" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="input-with-icon">
              <input
                type={showNew ? "text" : "password"}
                name="new"
                value={passwords.new}
                onChange={handlePasswordChange}
                placeholder="*********************"
              />
              <div className="icon-trigger" onClick={() => setShowNew(!showNew)}>
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <div className="form-group last-in-card">
            <label>Re-type New Password</label>
            <div className="input-with-icon">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                placeholder="*********************"
              />
              <div className="icon-trigger" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <div className="card-actions">
            <button className="btn-text cancel">Cancel</button>
            <button className="btn-text save" onClick={handleSavePassword}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;