import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import './AdminApprove.css';

const AdminApprove = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = authService.getCurrentUser();
  const isAdmin = user?.user?.role === 'admin';

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/dashboard';
    }
  }, [isAdmin]);

  // Fetch pending events
  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      
      const response = await axios.get('http://localhost:5000/api/events/admin/pending', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPendingEvents(response.data.events);
    } catch (error) {
      setError('Failed to fetch pending events');
      console.error('Error fetching pending events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      const token = user?.token;
      
      await axios.put(`http://localhost:5000/api/events/admin/approve/${eventId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Event approved successfully!');
      fetchPendingEvents(); // Refresh the list
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to approve event');
      console.error('Error approving event:', error);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const token = user?.token;
      
      await axios.delete(`http://localhost:5000/api/events/admin/delete/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Event deleted successfully!');
      fetchPendingEvents(); // Refresh the list
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-approve-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>👑 Admin Panel - Event Approval</h1>
          <Link to="/dashboard" className="back-button">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Content */}
      <div className="admin-content">
        <div className="stats-panel">
          <h2>📊 Pending Events: {pendingEvents.length}</h2>
          <p>Review and approve or reject submitted events</p>
        </div>

        {loading ? (
          <div className="loading">Loading pending events...</div>
        ) : pendingEvents.length === 0 ? (
          <div className="no-events">
            <h3>🎉 No pending events!</h3>
            <p>All submitted events have been reviewed.</p>
          </div>
        ) : (
          <div className="events-grid">
            {pendingEvents.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className={`event-type ${event.eventType}`}>
                    {event.eventType}
                  </span>
                </div>

                <div className="event-details">
                  <p><strong>Date:</strong> {formatDate(event.date)}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Submitted by:</strong> {event.submittedBy?.username}</p>
                  <p><strong>Submitted on:</strong> {formatDate(event.createdAt)}</p>
                </div>

                <div className="event-description">
                  <p>{event.description}</p>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="event-tags">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}

                {event.media && event.media.length > 0 && (
                  <div className="event-media">
                    <h4>📷 Media ({event.media.length})</h4>
                    <div className="media-grid">
                      {event.media.map((media, index) => (
                        <div key={index} className="media-item">
                          <img 
                            src={`http://localhost:5000${media.url}`} 
                            alt={media.caption || 'Event media'}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="event-actions">
                  <button 
                    onClick={() => handleApprove(event._id)}
                    className="approve-button"
                  >
                    ✅ Approve
                  </button>
                  <button 
                    onClick={() => handleDelete(event._id)}
                    className="delete-button"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprove; 