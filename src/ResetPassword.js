import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const ResetPassword = () => {
  const navigate = useNavigate();

  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Input values
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  // Validation state
  const [isInvalid, setIsInvalid] = useState(false);

  const handleUpdatePassword = () => {
    if (newPass === '' || newPass !== confirmPass) {
      setIsInvalid(true);
      setNewPass('');     
      setConfirmPass(''); 
    } else {
      setIsInvalid(false);
      navigate('/');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="shape-blue"></div>
      <div className="shape-red"></div>

      <div className="auth-content">
        <div className="forgot-container">
          <h2 className="forgot-title">Reset Password</h2>
          
          <p className="forgot-subtitle">Current Password</p>
          <div className="auth-input-group">
            <input 
              type={showCurrent ? "text" : "password"} 
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
            />
            <div className="eye-icon" onClick={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          <p className="forgot-subtitle">New Password</p>
          <div className="auth-input-group">
            <input 
              className={isInvalid ? "input-error" : ""}
              type={showNew ? "text" : "password"} 
              value={newPass}
              onChange={(e) => {
                setNewPass(e.target.value);
                if(isInvalid) setIsInvalid(false);
              }}
              placeholder={isInvalid ? "Invalid Password" : "New Password"} 
            />
            <div className="eye-icon" onClick={() => setShowNew(!showNew)}>
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          <p className="forgot-subtitle">Re-type New Password</p>
          <div className="auth-input-group">
            <input 
              className={isInvalid ? "input-error" : ""}
              type={showConfirm ? "text" : "password"} 
              value={confirmPass}
              onChange={(e) => {
                setConfirmPass(e.target.value);
                if(isInvalid) setIsInvalid(false);
              }}
              placeholder={isInvalid ? "Invalid Password" : "Re-type New Password"}
            />
            <div className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          <div className="btn-row-right">
            <button className="submit-btn small-btn" type="button" onClick={handleUpdatePassword}>
              Save Changes
            </button>
            <button className="cancel-btn" type="button" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;