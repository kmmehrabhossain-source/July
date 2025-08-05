const express = require('express');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/register - Create a new user account
router.post('/register', registerUser);

// POST /api/auth/login - Login with existing account
router.post('/login', loginUser);

// GET /api/auth/me - Get current user profile (protected route)
router.get('/me', protect, getCurrentUser);

// Test route to make sure our auth routes are working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes are working! 🎉',
    availableRoutes: [
      'POST /api/auth/register - Create account',
      'POST /api/auth/login - Login',
      'GET /api/auth/me - Get current user (protected)'
    ]
  });
});

module.exports = router;