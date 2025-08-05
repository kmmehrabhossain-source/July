import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import authService from '../services/authService';
import './EventTimeline.css';

const EventTimeline = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    eventType: '',
    tags: '',
    location: ''
  });

  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const eventTypeIcons = {
    protest: '✊',
    arrest: '🚔',
    martyrdom: '💔',
    statement: '📢',
    meeting: '🤝',
    violence: '⚠️',
    other: '📝'
  };

  const eventTypeColors = {
    protest: '#e74c3c',
    arrest: '#f39c12',
    martyrdom: '#8e44ad',
    statement: '#3498db',
    meeting: '#2ecc71',
    violence: '#e67e22',
    other: '#95a5a6'
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({ limit: 100 });
      setEvents(response.events || []);
    } catch (error) {
      setError('Failed to load events: ' + (error.message || 'Unknown error'));
      console.error('Fetch events error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (filters.eventType) {
      filtered = filtered.filter(event => event.eventType === filters.eventType);
    }

    if (filters.tags) {
      const searchTags = filters.tags.toLowerCase().split(',').map(tag => tag.trim());
      filtered = filtered.filter(event => 
        event.tags && event.tags.some(tag => 
          searchTags.some(searchTag => tag.includes(searchTag))
        )
      );
    }

    if (filters.location) {
      filtered = filtered.filter(event => 
        event.location && event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      eventType: '',
      tags: '',
      location: ''
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="timeline-loading">
        <div className="loading-spinner"></div>
        <p>Loading July Archive events...</p>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {/* Header */}
      <div className="timeline-header">
        <div className="header-content">
          <div className="nav-controls">
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              ← Dashboard
            </button>
            <span className="user-info">Hello, {user?.user?.username}!</span>
          </div>
          
          <h1>📅 July Archive Timeline</h1>
          <p>Documenting the July movement events</p>
          
          {user && (
            <Link to="/submit-event" className="add-event-btn">
              📝 Add Event
            </Link>
          )}

          {/* Event Count */}
          <div className="event-count">
            <strong>{filteredEvents.length}</strong> events found
            {events.length !== filteredEvents.length && (
              <span> (filtered from {events.length} total)</span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>🔍 Filter Events</h3>
        <div className="filters-grid">
          <select
            name="eventType"
            value={filters.eventType}
            onChange={handleFilterChange}
            className="filter-input"
          >
            <option value="">All Event Types</option>
            <option value="protest">✊ Protest</option>
            <option value="arrest">🚔 Arrest</option>
            <option value="martyrdom">💔 Martyrdom</option>
            <option value="statement">📢 Statement</option>
            <option value="meeting">🤝 Meeting</option>
            <option value="violence">⚠️ Violence</option>
            <option value="other">📝 Other</option>
          </select>

          <input
            type="text"
            name="tags"
            placeholder="Search by tags (comma-separated)"
            value={filters.tags}
            onChange={handleFilterChange}
            className="filter-input"
          />

          <input
            type="text"
            name="location"
            placeholder="Search by location"
            value={filters.location}
            onChange={handleFilterChange}
            className="filter-input"
          />

          <button onClick={clearFilters} className="clear-filters-btn">
            🗑️ Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Timeline */}
      <div className="timeline-content">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <h3>📭 No events found</h3>
            <p>
              {events.length === 0 
                ? "No events have been submitted yet." 
                : "No events match your current filters."
              }
            </p>
            {user && events.length === 0 && (
              <Link to="/submit-event" className="submit-first-btn">
                📝 Submit the first event
              </Link>
            )}
          </div>
        ) : (
          <div className="timeline">
            {filteredEvents.map((event, index) => (
              <div key={event._id || index} className="timeline-item">
                <div className="timeline-marker">
                  <div 
                    className="timeline-icon"
                    style={{ backgroundColor: eventTypeColors[event.eventType] }}
                  >
                    {eventTypeIcons[event.eventType]}
                  </div>
                  <div className="timeline-date">
                    {formatTime(event.date)}
                  </div>
                </div>
                
                <div className="timeline-content-card">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <span className="event-type" style={{ color: eventTypeColors[event.eventType] }}>
                        {eventTypeIcons[event.eventType]} {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                      </span>
                      <span className="event-date">{formatDate(event.date)}</span>
                    </div>
                  </div>

                  <p className="event-description">{event.description}</p>

                  <div className="event-details">
                    <div className="detail-item">
                      <strong>📍 Location:</strong> {event.location}
                    </div>
                    
                    {event.tags && event.tags.length > 0 && (
                      <div className="detail-item">
                        <strong>🏷️ Tags:</strong>
                        <div className="tags-container">
                          {event.tags.map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(event.casualties > 0 || event.injured > 0) && (
                      <div className="detail-item casualties">
                        {event.casualties > 0 && (
                          <span className="casualty-count">💔 {event.casualties} casualties</span>
                        )}
                        {event.injured > 0 && (
                          <span className="injured-count">🏥 {event.injured} injured</span>
                        )}
                      </div>
                    )}

                    <div className="event-footer">
                      <span className="submitted-by">
                        📝 Submitted by {event.submittedBy?.username || 'Anonymous'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTimeline;