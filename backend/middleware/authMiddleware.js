const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes that require authentication
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-later');

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed' 
      });
    }
  }

  if (!token) {
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token' 
    });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ 
      success: false,
      message: 'Not authorized as admin' 
    });
  }
};

module.exports = { protect, admin }; 