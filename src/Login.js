import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Eye, EyeOff } from 'lucide-react'; 
import './Login.css';

const Login = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // State to track selected role
  const navigate = useNavigate(); 

  const handleSignIn = (e) => {
    e.preventDefault();
    
    // 1. Basic validation
    if (!email || !password || !role) {
      alert("Please fill in all fields and select a role.");
      return;
    }

    // 2. Pass the selected role to the handleLogin function in index.js
    if (onLogin) {
      onLogin(role); 
    }

    // Note: index.js handles the navigation now based on the role check
  };

  return (
    <div className="auth-wrapper">
      <div className="shape-blue"></div>
      <div className="shape-red"></div>

      <div className="auth-content">
        <div className="brand-section">
          {/* Ensure the logo path is correct */}
          <img src="/assets/logo.svg" alt="DOLE Logo" className="logo-img" />
          <h1 className="dept-name">Department of Labor and Employment</h1>
          <h2 className="welcome-heading">Welcome!</h2>
          <p className="sub-heading">Please enter your details</p>
        </div>

        <div className="form-container">
          <form className="glass-card" onSubmit={handleSignIn}>
            
            {/* Email Input */}
            <div className="auth-input-group">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            {/* Password Input */}
            <div className="auth-input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div 
                className="eye-icon" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            {/* Role Selector - Crucial for Admin Logic */}
            <div className="role-selector">
              <label>Sign In As</label>
              <select 
                className="custom-select" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                required
              >
                <option value="">Select</option>
                <option value="Admin">Admin</option>
                <option value="Officer">Officer</option>
              </select>
            </div>

            <button 
              className="forgot-lnk" 
              type="button"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password
            </button>

            <button 
              className="submit-btn" 
              type="submit"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;