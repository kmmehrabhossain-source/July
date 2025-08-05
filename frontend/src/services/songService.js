import axios from 'axios';

const API_URL = 'http://localhost:5000/api/songs';

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

// Get approved songs (public)
const getApprovedSongs = async () => {
  try {
    const response = await axios.get(`${API_URL}/approved`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    // Return empty success response when API fails
    return { success: true, data: [] };
  }
};

// Get all songs (admin only)
const getAllSongs = async () => {
  try {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/admin/all`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: true, data: [] };
  }
};

// Submit new song
const submitSong = async (songData) => {
  try {
    setAuthHeader();
    const response = await axios.post(`${API_URL}/submit`, songData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to submit song' 
    };
  }
};

// Approve/reject song (admin only)
const approveSong = async (songId, action, rejectionReason = '') => {
  try {
    setAuthHeader();
    const response = await axios.put(`${API_URL}/admin/${songId}/approve`, {
      action,
      rejectionReason
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Failed to approve/reject song' };
  }
};

// Delete song (admin only)
const deleteSong = async (songId) => {
  try {
    setAuthHeader();
    const response = await axios.delete(`${API_URL}/admin/${songId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Failed to delete song' };
  }
};

// Get song by ID
const getSongById = async (songId) => {
  try {
    const response = await axios.get(`${API_URL}/${songId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Failed to fetch song' };
  }
};

// Get user's submitted songs
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

const songService = {
  getApprovedSongs,
  getAllSongs,
  submitSong,
  approveSong,
  deleteSong,
  getSongById,
  getUserSubmissions
};

export default songService;