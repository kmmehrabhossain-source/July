const mongoose = require('mongoose');

// Define what a July Event looks like in our database
const eventSchema = new mongoose.Schema({
  title: {
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
  eventType: {
    type: String,
    required: true,
    enum: ['protest', 'arrest', 'martyrdom', 'statement', 'meeting', 'violence', 'other'],
    lowercase: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Media files (we'll store file paths/URLs)
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: 500
    }
  }],
  // Who submitted this event
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Verification status
  verified: {
    type: Boolean,
    default: false
  },
  // Source information
  sources: [{
    type: String,
    trim: true
  }],
  // Additional metadata
  casualties: {
    type: Number,
    min: 0,
    default: 0
  },
  injured: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for better performance when filtering/searching
eventSchema.index({ date: -1 }); // Sort by date (newest first)
eventSchema.index({ eventType: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ location: 1 });

// Static method to get events by date range
eventSchema.statics.getEventsByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 }).populate('submittedBy', 'username');
};

// Static method to get events by type
eventSchema.statics.getEventsByType = function(eventType) {
  return this.find({ eventType }).sort({ date: -1 }).populate('submittedBy', 'username');
};

// Static method to get events by tags
eventSchema.statics.getEventsByTags = function(tags) {
  return this.find({ 
    tags: { $in: tags } 
  }).sort({ date: -1 }).populate('submittedBy', 'username');
};

module.exports = mongoose.model('Event', eventSchema);