import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Auth.css';

const Login = () => {
  // State to store form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // State for error messages and loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navigate = useNavigate();
  const { email, password } = formData;

  // Handle input changes
  const onChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle admin toggle
  const handleAdminToggle = () => {
    setIsAdmin(!isAdmin);
    setFormData({ email: '', password: '' });
    setError('');
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // Call our auth service to login
      const result = await authService.login(formData);
      
      setSuccess(`${isAdmin ? 'Admin' : 'User'} login successful! Redirecting...`);
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Revolutionary Background Elements */}
      <div className="revolutionary-bg">
        <div className="bg-pattern"></div>
        <div className="floating-elements">
          <div className="floating-star">★</div>
          <div className="floating-star">★</div>
          <div className="floating-star">★</div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <div className="revolution-logo">⚔️</div>
            <h1>July Archive</h1>
          </div>
          <h2>Memorial of Revolution</h2>
          <p>Honoring the Spirit of Freedom</p>
        </div>

        {/* Omar Mukhtar Quote */}
        <div className="quote-container">
          <blockquote className="revolutionary-quote">
            "We are a nation that loves death as our enemies love life."
          </blockquote>
          <cite className="quote-author">— Omar Mukhtar</cite>
        </div>

        {/* Admin/User Toggle */}
        <div className="login-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={handleAdminToggle}
              className="toggle-checkbox"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">Login as Admin</span>
          </label>
        </div>

        {isAdmin && (
          <div className="admin-info">
            <div className="admin-icon">👑</div>
            <p><strong>Admin Access</strong></p>
            <p>Manage the archive with full privileges</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <span className="input-icon">📧</span>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder={isAdmin ? "admin@julyarchive.com" : "Enter your email"}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="input-icon">🔒</span>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder={isAdmin ? "admin123" : "Enter your password"}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner">⚔️</span>
            ) : (
              `Sign In as ${isAdmin ? 'Admin' : 'User'}`
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Join the Revolution
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;