const express = require('express');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Event routes working!' });
});

// Submit new event with image upload (protected route)
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      date,
      location,
      tags,
      sources,
      casualties,
      injured
    } = req.body;

    // Process uploaded files
    const media = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        media.push({
          type: 'image',
          url: `/uploads/${file.filename}`,
          caption: '' // We can add captions later
        });
      });
    }

    // Process tags (handle both string and array)
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        processedTags = tags;
      }
    }

    // Process sources
    let processedSources = [];
    if (sources) {
      if (typeof sources === 'string') {
        processedSources = sources.split(',').map(source => source.trim()).filter(source => source);
      } else if (Array.isArray(sources)) {
        processedSources = sources;
      }
    }

    // Create the event
    const event = await Event.create({
      title,
      description,
      eventType,
      date: new Date(date),
      location,
      tags: processedTags,
      sources: processedSources,
      casualties: parseInt(casualties) || 0,
      injured: parseInt(injured) || 0,
      submittedBy: req.user._id,
      media: media
    });

    // Populate the submittedBy field
    await event.populate('submittedBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Event submitted successfully!',
      event
    });

  } catch (error) {
    console.log('Event submission error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to submit event: ' + error.message
    });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const {
      eventType,
      tags,
      startDate,
      endDate,
      location,
      page = 1,
      limit = 50
    } = req.query;

    // Build filter object
    let filter = {};

    if (eventType) {
      filter.eventType = eventType;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get events with filters and pagination
    const events = await Event.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('submittedBy', 'username');

    // Get total count for pagination
    const totalEvents = await Event.countDocuments(filter);

    res.json({
      success: true,
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEvents / limit),
        totalEvents,
        hasNext: page < Math.ceil(totalEvents / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.log('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events: ' + error.message
    });
  }
});

// Get event statistics
router.get('/stats', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    
    const eventsByType = await Event.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const totalCasualties = await Event.aggregate([
      { $group: { _id: null, total: { $sum: '$casualties' } } }
    ]);

    const totalInjured = await Event.aggregate([
      { $group: { _id: null, total: { $sum: '$injured' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents,
        eventsByType,
        totalCasualties: totalCasualties[0]?.total || 0,
        totalInjured: totalInjured[0]?.total || 0
      }
    });

  } catch (error) {
    console.log('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
});

// Admin routes - require admin role
// Get pending events for approval
router.get('/admin/pending', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const pendingEvents = await Event.find({ verified: false })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'username email');

    res.json({
      success: true,
      events: pendingEvents
    });

  } catch (error) {
    console.log('Get pending events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending events'
    });
  }
});

// Approve an event
router.put('/admin/approve/:eventId', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { verified: true },
      { new: true }
    ).populate('submittedBy', 'username email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event approved successfully',
      event
    });

  } catch (error) {
    console.log('Approve event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve event'
    });
  }
});

// Reject/Delete an event
router.delete('/admin/delete/:eventId', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const event = await Event.findByIdAndDelete(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.log('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
});

// Get all events for admin management
router.get('/admin/all', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      verified,
      eventType,
      page = 1,
      limit = 50
    } = req.query;

    // Build filter object
    let filter = {};

    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    if (eventType) {
      filter.eventType = eventType;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get events with filters and pagination
    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('submittedBy', 'username email');

    // Get total count for pagination
    const totalEvents = await Event.countDocuments(filter);

    res.json({
      success: true,
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEvents / limit),
        totalEvents,
        hasNext: page < Math.ceil(totalEvents / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.log('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

module.exports = router;