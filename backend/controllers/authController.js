const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate a secure token for logged-in users
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'your-secret-key-change-this-later', {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email or username already exists!' 
      });
    }

    // Create the new user
    const newUser = await User.create({
      username,
      email,
      password,
      role: 'user'
    });

    // Send back user info and a token
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      token: generateToken(newUser._id, newUser.role),
    });

  } catch (error) {
    console.log('Registration error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Registration failed. Please try again.' 
    });
  }
};

// Login an existing user or admin
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (user && await user.comparePassword(password)) {
      res.json({
        success: true,
        message: 'Login successful!',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

  } catch (error) {
    console.log('Login error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Login failed. Please try again.' 
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Failed to get user profile' 
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};