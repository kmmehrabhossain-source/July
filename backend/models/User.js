const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define what a User looks like in our database
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Before saving a user, encrypt their password
userSchema.pre('save', async function(next) {
  // Only hash the password if it's new or changed
  if (!this.isModified('password')) return next();
  
  // Hash the password with bcrypt (makes it super secure!)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check if entered password matches the stored password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);