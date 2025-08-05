import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5000/api/events';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };
  }
  return {
    'Content-Type': 'application/json'
  };
};

// Submit a new July event
const submitEvent = async (eventData) => {
  try {
    const response = await axios.post(API_URL, eventData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit event' };
  }
};

// Get all events with optional filters
const getEvents = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.eventType) params.append('eventType', filters.eventType);
    if (filters.tags) params.append('tags', filters.tags);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.location) params.append('location', filters.location);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const url = queryString ? `${API_URL}?${queryString}` : API_URL;

    const response = await axios.get(url, {
      headers: getAuthHeaders()
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events' };
  }
};

// Get a single event by ID
const getEventById = async (eventId) => {
  try {
    const response = await axios.get(`${API_URL}/${eventId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch event' };
  }
};

// Update an event
const updateEvent = async (eventId, eventData) => {
  try {
    const response = await axios.put(`${API_URL}/${eventId}`, eventData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update event' };
  }
};

// Delete an event
const deleteEvent = async (eventId) => {
  try {
    const response = await axios.delete(`${API_URL}/${eventId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete event' };
  }
};

// Get event statistics
const getEventStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch statistics' };
  }
};

// Export all functions
const eventService = {
  submitEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventStats
};

export default eventService;