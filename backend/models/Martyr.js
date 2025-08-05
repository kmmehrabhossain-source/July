const mongoose = require('mongoose');

const martyrSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  englishName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfMartyrdom: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  background: {
    type: String,
    required: true,
    trim: true
  },
  lifeStory: {
    type: String,
    required: true,
    trim: true
  },
  quote: {
    type: String,
    required: true,
    trim: true
  },
  contribution: {
    type: String,
    required: true,
    trim: true
  },
  impact: {
    type: String,
    required: true,
    trim: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
martyrSchema.index({ status: 1, createdAt: -1 });
martyrSchema.index({ submittedBy: 1 });

module.exports = mongoose.model('Martyr', martyrSchema); 