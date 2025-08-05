const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes - checks if user has valid token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from "Bearer TOKEN_HERE"
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login to continue.'
      });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-later');
      
      // Get user from token (without password)
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please login again.'
        });
      }

      // Add user to request object so we can use it in our controllers
      req.user = user;
      next(); // Continue to the next middleware/controller

    } catch (error) {
      console.log('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

  } catch (error) {
    console.log('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Optional middleware to get user info if token exists (but don't require it)
const getUser = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-later');
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // If token is invalid, just continue without user (don't throw error)
        console.log('Optional auth failed:', error.message);
      }
    }

    next(); // Continue regardless of whether user was found

  } catch (error) {
    next(); // Continue even if there's an error
  }
};

module.exports = {
  protect,
  getUser
};