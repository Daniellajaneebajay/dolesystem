import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-wrapper">
      <div className="shape-blue"></div>
      <div className="shape-red"></div>

      <div className="auth-content">
        <div className="forgot-container">
          <h2 className="forgot-title">Forgot Password</h2>
          <p className="forgot-subtitle">Enter the email address registered to you</p>

          <div className="auth-input-group">
            <input type="email" />
          </div>

          <div className="btn-row-right">
            <button className="submit-btn small-btn" type="button">
              Send Verification Code
            </button>
          </div>

          <p className="forgot-subtitle">Enter Verification Code</p>
          <div className="auth-input-group">
            <input type="text" />
          </div>

          <div className="btn-row-right">
            <button 
              className="submit-btn small-btn" 
              type="button" 
              onClick={() => navigate('/reset-password')}
            >
              Reset Password
            </button>

            <button 
              className="cancel-btn" 
              type="button" 
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;