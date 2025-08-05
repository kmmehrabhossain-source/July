const Martyr = require('../models/Martyr');
const User = require('../models/User');

// Get all approved martyrs (public)
const getApprovedMartyrs = async (req, res) => {
  try {
    const martyrs = await Martyr.find({ status: 'approved' })
      .populate('submittedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: martyrs
    });
  } catch (error) {
    console.error('Error fetching approved martyrs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch martyrs'
    });
  }
};

// Get all martyrs (admin only)
const getAllMartyrs = async (req, res) => {
  try {
    const martyrs = await Martyr.find()
      .populate('submittedBy', 'username')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: martyrs
    });
  } catch (error) {
    console.error('Error fetching all martyrs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch martyrs'
    });
  }
};

// Submit new martyr story
const submitMartyr = async (req, res) => {
  try {
    const {
      name,
      englishName,
      dateOfMartyrdom,
      location,
      age,
      background,
      lifeStory,
      quote,
      contribution,
      impact
    } = req.body;

    const newMartyr = await Martyr.create({
      name,
      englishName,
      dateOfMartyrdom,
      location,
      age,
      background,
      lifeStory,
      quote,
      contribution,
      impact,
      submittedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Martyr story submitted successfully! Waiting for admin approval.',
      data: newMartyr
    });
  } catch (error) {
    console.error('Error submitting martyr:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to submit martyr story'
    });
  }
};

// Approve martyr story (admin only)
const approveMartyr = async (req, res) => {
  try {
    const { martyrId } = req.params;
    const { rejectionReason } = req.body;

    const martyr = await Martyr.findById(martyrId);
    
    if (!martyr) {
      return res.status(404).json({
        success: false,
        message: 'Martyr not found'
      });
    }

    if (req.body.action === 'reject') {
      martyr.status = 'rejected';
      martyr.rejectionReason = rejectionReason;
    } else {
      martyr.status = 'approved';
      martyr.approvedBy = req.user.id;
      martyr.approvedAt = new Date();
    }

    await martyr.save();

    res.json({
      success: true,
      message: `Martyr story ${req.body.action === 'reject' ? 'rejected' : 'approved'} successfully`,
      data: martyr
    });
  } catch (error) {
    console.error('Error approving martyr:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve martyr'
    });
  }
};

// Delete martyr (admin only)
const deleteMartyr = async (req, res) => {
  try {
    const { martyrId } = req.params;

    const martyr = await Martyr.findById(martyrId);
    
    if (!martyr) {
      return res.status(404).json({
        success: false,
        message: 'Martyr not found'
      });
    }

    await Martyr.findByIdAndDelete(martyrId);

    res.json({
      success: true,
      message: 'Martyr deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting martyr:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete martyr'
    });
  }
};

// Get martyr by ID
const getMartyrById = async (req, res) => {
  try {
    const { martyrId } = req.params;

    const martyr = await Martyr.findById(martyrId)
      .populate('submittedBy', 'username')
      .populate('approvedBy', 'username');

    if (!martyr) {
      return res.status(404).json({
        success: false,
        message: 'Martyr not found'
      });
    }

    res.json({
      success: true,
      data: martyr
    });
  } catch (error) {
    console.error('Error fetching martyr:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch martyr'
    });
  }
};

// Get user's submitted martyrs
const getUserMartyrs = async (req, res) => {
  try {
    const martyrs = await Martyr.find({ submittedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: martyrs
    });
  } catch (error) {
    console.error('Error fetching user martyrs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user martyrs'
    });
  }
};

module.exports = {
  getApprovedMartyrs,
  getAllMartyrs,
  submitMartyr,
  approveMartyr,
  deleteMartyr,
  getMartyrById,
  getUserMartyrs
}; 