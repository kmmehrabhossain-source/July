import axios from 'axios';

const API_URL = 'http://localhost:5000/api/martyrs';

// Configure axios with timeout
axios.defaults.timeout = 5000; // 5 second timeout

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).token : null;
};

// Set auth header for requests
const setAuthHeader = () => {
  const token = getAuthToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Get approved martyrs (public)
const getApprovedMartyrs = async () => {
  try {
    const response = await axios.get(`${API_URL}/approved`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    // Return empty success response when API fails
    return { success: true, data: [] };
  }
};

// Get all martyrs (admin only)
const getAllMartyrs = async () => {
  try {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/admin/all`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: true, data: [] };
  }
};

// Submit new martyr story
const submitMartyr = async (martyrData) => {
  try {
    setAuthHeader();
    const response = await axios.post(`${API_URL}/submit`, martyrData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Failed to submit martyr story' };
  }
};

// Approve/reject martyr (admin only)
const approveMartyr = async (martyrId, action, rejectionReason = '') => {
  try {
    setAuthHeader();
    const response = await axios.put(`${API_URL}/admin/${martyrId}/approve`, {
      action,
      rejectionReason
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Failed to approve/reject martyr' };
  }
};

// Delete martyr (admin only)
const deleteMartyr = async (martyrId) => {
  try {
    setAuthHeader();
    const response = await axios.delete(`${API_URL}/admin/${martyrId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Failed to delete martyr' };
  }
};

// Get martyr by ID
const getMartyrById = async (martyrId) => {
  try {
    const response = await axios.get(`${API_URL}/${martyrId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Failed to fetch martyr' };
  }
};

// Get user's submitted martyrs
const getUserSubmissions = async () => {
  try {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/user/submissions`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: true, data: [] };
  }
};

const martyrService = {
  getApprovedMartyrs,
  getAllMartyrs,
  submitMartyr,
  approveMartyr,
  deleteMartyr,
  getMartyrById,
  getUserSubmissions
};

export default martyrService; 