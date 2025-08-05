const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  artist: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  youtubeLink: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic validation for YouTube links
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v);
      },
      message: props => `${props.value} is not a valid YouTube link!`
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
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
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for better query performance
songSchema.index({ status: 1, createdAt: -1 });
songSchema.index({ submittedBy: 1 });

module.exports = mongoose.model('Song', songSchema);