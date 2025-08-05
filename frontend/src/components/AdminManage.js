import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import './AdminManage.css';

const AdminManage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    verified: '',
    eventType: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});

  const user = authService.getCurrentUser();
  const isAdmin = user?.user?.role === 'admin';

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/dashboard';
    }
  }, [isAdmin]);

  // Fetch events when filters change
  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      
      const params = new URLSearchParams();
      if (filters.verified !== '') params.append('verified', filters.verified);
      if (filters.eventType !== '') params.append('eventType', filters.eventType);
      params.append('page', filters.page);
      params.append('limit', 20);
      
      const response = await axios.get(`http://localhost:5000/api/events/admin/all?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setEvents(response.data.events);
      setPagination(response.data.pagination);
    } catch (error) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
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
      fetchEvents(); // Refresh the list
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-manage-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>👑 Admin Panel - Event Management</h1>
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
        {/* Filters */}
        <div className="filters-panel">
          <h2>🔍 Filters</h2>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={filters.verified} 
                onChange={(e) => handleFilterChange('verified', e.target.value)}
              >
                <option value="">All Events</option>
                <option value="true">Approved Only</option>
                <option value="false">Pending Only</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Event Type:</label>
              <select 
                value={filters.eventType} 
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="protest">Protest</option>
                <option value="arrest">Arrest</option>
                <option value="martyrdom">Martyrdom</option>
                <option value="statement">Statement</option>
                <option value="meeting">Meeting</option>
                <option value="violence">Violence</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-panel">
          <h2>📊 Event Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{pagination.totalEvents || 0}</span>
              <span className="stat-label">Total Events</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{pagination.currentPage || 1}</span>
              <span className="stat-label">Current Page</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{pagination.totalPages || 1}</span>
              <span className="stat-label">Total Pages</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="no-events">
            <h3>📭 No events found</h3>
            <p>Try adjusting your filters to see more events.</p>
          </div>
        ) : (
          <>
            {/* Events Table */}
            <div className="events-table-container">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Submitted By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td className="event-title">
                        <div>
                          <strong>{event.title}</strong>
                          <p className="event-description-preview">
                            {event.description.substring(0, 100)}...
                          </p>
                        </div>
                      </td>
                      <td>
                        <span className={`event-type ${event.eventType}`}>
                          {event.eventType}
                        </span>
                      </td>
                      <td>{formatDate(event.date)}</td>
                      <td>{event.location}</td>
                      <td>{event.submittedBy?.username}</td>
                      <td>
                        <span className={`status ${event.verified ? 'approved' : 'pending'}`}>
                          {event.verified ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleDelete(event._id)}
                            className="delete-button"
                            title="Delete Event"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="pagination-button"
                >
                  ← Previous
                </button>
                
                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button 
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="pagination-button"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminManage; 