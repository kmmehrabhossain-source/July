import axios from 'axios';

// This is where our backend server is running
const API_URL = 'http://localhost:5000/api/auth';

// Register a new user
const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    
    // If registration successful, save user data
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    // If there's an error, throw it so our components can handle it
    throw error.response.data;
  }
};

// Login an existing user
const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    
    // If login successful, save user data
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  window.location.href = '/login'; // Redirect to login page
};

// Get current logged-in user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is logged in
const isLoggedIn = () => {
  const user = getCurrentUser();
  return user && user.token;
};

// Export all our functions
const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
};

export default authService;