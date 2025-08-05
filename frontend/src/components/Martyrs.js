import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import martyrService from '../services/martyrService';
import './Martyrs.css';

const Martyrs = () => {
  const user = authService.getCurrentUser();
  const [martyrs, setMartyrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminMartyrs, setAdminMartyrs] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);

  useEffect(() => {
    loadMartyrs();
    if (user?.user?.role === 'admin') {
      loadAdminMartyrs();
    }
    if (user) {
      loadUserSubmissions();
    }
  }, [user]);

  const loadMartyrs = async () => {
    try {
      setLoading(true);
      console.log('Loading martyrs...');
      const response = await martyrService.getApprovedMartyrs();
      console.log('Martyrs response:', response);
      
      // Always set martyrs to the response data, even if empty
      setMartyrs(response.data || []);
    } catch (error) {
      console.error('Error loading martyrs:', error);
      // Set empty array when API fails
      setMartyrs([]);
    } finally {
      // Always set loading to false
      setTimeout(() => {
        setLoading(false);
        console.log('Loading complete');
      }, 500); // Add a small delay to ensure state updates properly
    }
  };

  const loadAdminMartyrs = async () => {
    try {
      const response = await martyrService.getAllMartyrs();
      if (response.success) {
        setAdminMartyrs(response.data);
      }
    } catch (error) {
      console.error('Error loading admin martyrs:', error);
    }
  };

  const loadUserSubmissions = async () => {
    try {
      const response = await martyrService.getUserSubmissions();
      if (response.success) {
        setUserSubmissions(response.data);
      }
    } catch (error) {
      console.error('Error loading user submissions:', error);
    }
  };

  const handleApprove = async (martyrId) => {
    try {
      const response = await martyrService.approveMartyr(martyrId, 'approve');
      if (response.success) {
        loadAdminMartyrs();
        loadMartyrs();
      }
    } catch (error) {
      console.error('Error approving martyr:', error);
    }
  };

  const handleReject = async (martyrId, reason) => {
    try {
      const response = await martyrService.approveMartyr(martyrId, 'reject', reason);
      if (response.success) {
        loadAdminMartyrs();
      }
    } catch (error) {
      console.error('Error rejecting martyr:', error);
    }
  };

  const handleDelete = async (martyrId) => {
    if (window.confirm('Are you sure you want to delete this martyr?')) {
      try {
        const response = await martyrService.deleteMartyr(martyrId);
        if (response.success) {
          loadAdminMartyrs();
          loadMartyrs();
        }
      } catch (error) {
        console.error('Error deleting martyr:', error);
      }
    }
  };

  return (
    <div className="martyrs-container">
      {/* Revolutionary Background */}
      <div className="revolutionary-bg">
        <div className="bg-pattern"></div>
        <div className="floating-elements">
          <div className="floating-star">🕊️</div>
          <div className="floating-star">🕊️</div>
          <div className="floating-star">🕊️</div>
        </div>
      </div>

      {/* Header */}
      <header className="martyrs-header">
        <div className="header-content">
          <Link to="/dashboard" className="back-btn">← Back to Dashboard</Link>
          <h1>শহীদদের জীবনী</h1>
          <h2>Life of Martyrs</h2>
          
          <div className="header-actions">
            <button 
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="submit-btn"
            >
              Submit Martyr Story
            </button>
            {user?.user?.role === 'admin' && (
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="admin-btn"
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with New Quote */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>"বুকের ভেতর আনাসের লেখা চিঠি, রাস্তায় পড়ে ছিলো ইয়ামিনের লাশ"</h2>
          <p>"Anas's letter in the chest, Yamin's body lay on the street"</p>
        </div>
      </section>

      {/* Submit Form */}
      {showSubmitForm && (
        <section className="submit-section">
          <MartyrSubmitForm 
            onSuccess={() => {
              setShowSubmitForm(false);
              loadUserSubmissions();
            }}
          />
        </section>
      )}

      {/* Admin Panel */}
      {showAdminPanel && user?.user?.role === 'admin' && (
        <section className="admin-section">
          <AdminPanel 
            martyrs={adminMartyrs}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        </section>
      )}

      {/* User Submissions */}
      {user && userSubmissions.length > 0 && (
        <section className="submissions-section">
          <h3>Your Submissions</h3>
          <div className="submissions-grid">
            {userSubmissions.map((submission) => (
              <SubmissionCard key={submission._id} submission={submission} />
            ))}
          </div>
        </section>
      )}

      {/* Martyrs Grid */}
      <main className="martyrs-main">
        {loading ? (
          <div className="loading">Loading martyrs...</div>
        ) : martyrs.length > 0 ? (
          <div className="martyrs-grid">
            {martyrs.map((martyr) => (
              <MartyrCard key={martyr._id} martyr={martyr} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <h3>No Approved Martyr Stories Yet</h3>
              <p>Be the first to submit a martyr story. Share the stories of those who sacrificed their lives for our freedom.</p>
              <button 
                onClick={() => setShowSubmitForm(true)}
                className="submit-btn"
              >
                Submit First Story
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="martyrs-footer">
        <div className="footer-content">
          <p>"তাদের রক্তে রাঙানো পথে আমরা এগিয়ে যাব"</p>
          <p>"We will march forward on the path colored with their blood"</p>
        </div>
      </footer>
    </div>
  );
};

// Martyr Card Component
const MartyrCard = ({ martyr }) => {
  return (
    <div className="martyr-card">
      <div className="martyr-header">
        <div className="martyr-icon">🕊️</div>
        <div className="martyr-info">
          <h3 className="martyr-name">{martyr.name}</h3>
          <h4 className="martyr-english-name">{martyr.englishName}</h4>
          <p className="martyr-date">{martyr.dateOfMartyrdom}</p>
          <p className="martyr-location">{martyr.location}</p>
        </div>
      </div>
      
      <div className="martyr-quote">
        <blockquote>"{martyr.quote}"</blockquote>
      </div>
      
      <div className="martyr-details">
        <div className="martyr-background">
          <h5>Background</h5>
          <p>{martyr.background}</p>
        </div>
        
        <div className="martyr-story">
          <h5>Life Story</h5>
          <p>{martyr.lifeStory}</p>
        </div>
        
        <div className="martyr-contribution">
          <h5>Contribution</h5>
          <p>{martyr.contribution}</p>
        </div>
        
        <div className="martyr-impact">
          <h5>Impact</h5>
          <p>{martyr.impact}</p>
        </div>
      </div>
      
      <div className="martyr-footer">
        <span className="martyr-status">শহীদ</span>
        <span className="martyr-status-en">Martyr</span>
      </div>
    </div>
  );
};

// Martyr Submit Form Component
const MartyrSubmitForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    englishName: '',
    dateOfMartyrdom: '',
    location: '',
    age: '',
    background: '',
    lifeStory: '',
    quote: '',
    contribution: '',
    impact: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Submitting martyr data:', formData);
      const response = await martyrService.submitMartyr(formData);
      console.log('Submission response:', response);
      
      if (response.success) {
        alert('Martyr story submitted successfully! Waiting for admin approval.');
        setFormData({
          name: '',
          englishName: '',
          dateOfMartyrdom: '',
          location: '',
          age: '',
          background: '',
          lifeStory: '',
          quote: '',
          contribution: '',
          impact: ''
        });
        onSuccess();
      } else {
        alert(`Failed to submit: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit martyr story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="submit-form-container">
      <h3>Submit Martyr Story</h3>
      <form onSubmit={handleSubmit} className="submit-form">
        <div className="form-row">
          <div className="form-group">
            <label>Name (Bengali)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Name (English)</label>
            <input
              type="text"
              name="englishName"
              value={formData.englishName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date of Martyrdom</label>
            <input
              type="text"
              name="dateOfMartyrdom"
              value={formData.dateOfMartyrdom}
              onChange={handleChange}
              placeholder="জুলাই ২৪, ২০২৪"
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Background</label>
          <textarea
            name="background"
            value={formData.background}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Life Story</label>
          <textarea
            name="lifeStory"
            value={formData.lifeStory}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Quote</label>
          <input
            type="text"
            name="quote"
            value={formData.quote}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Contribution</label>
          <textarea
            name="contribution"
            value={formData.contribution}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Impact</label>
          <textarea
            name="impact"
            value={formData.impact}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Submitting...' : 'Submit Martyr Story'}
        </button>
      </form>
    </div>
  );
};

// Admin Panel Component
const AdminPanel = ({ martyrs, onApprove, onReject, onDelete }) => {
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <div className="admin-panel">
      <h3>Admin Panel - Martyr Approvals</h3>
      <div className="admin-martyrs">
        {martyrs.map((martyr) => (
          <div key={martyr._id} className="admin-martyr-card">
            <div className="martyr-info">
              <h4>{martyr.name} ({martyr.englishName})</h4>
              <p><strong>Status:</strong> {martyr.status}</p>
              <p><strong>Submitted by:</strong> {martyr.submittedBy?.username}</p>
              <p><strong>Date:</strong> {martyr.dateOfMartyrdom}</p>
            </div>
            
            <div className="martyr-actions">
              {martyr.status === 'pending' && (
                <>
                  <button 
                    onClick={() => onApprove(martyr._id)}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) onReject(martyr._id, reason);
                    }}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </>
              )}
              <button 
                onClick={() => onDelete(martyr._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Submission Card Component
const SubmissionCard = ({ submission }) => {
  return (
    <div className={`submission-card ${submission.status}`}>
      <h4>{submission.name}</h4>
      <p><strong>Status:</strong> {submission.status}</p>
      <p><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleDateString()}</p>
      {submission.status === 'rejected' && (
        <p><strong>Reason:</strong> {submission.rejectionReason}</p>
      )}
    </div>
  );
};

export default Martyrs;