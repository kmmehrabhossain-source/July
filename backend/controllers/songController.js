const Song = require('../models/Song');
const User = require('../models/User');

// Get all approved songs (public)
const getApprovedSongs = async (req, res) => {
  try {
    const songs = await Song.find({ status: 'approved' })
      .populate('submittedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: songs
    });
  } catch (error) {
    console.error('Error fetching approved songs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch songs'
    });
  }
};

// Get all songs (admin only)
const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find()
      .populate('submittedBy', 'username')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: songs
    });
  } catch (error) {
    console.error('Error fetching all songs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch songs'
    });
  }
};

// Submit new song
const submitSong = async (req, res) => {
  try {
    const {
      title,
      artist,
      description,
      youtubeLink,
      tags
    } = req.body;

    const newSong = await Song.create({
      title,
      artist,
      description,
      youtubeLink,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      submittedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Song submitted successfully! Waiting for admin approval.',
      data: newSong
    });
  } catch (error) {
    console.error('Error submitting song:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit song'
    });
  }
};

// Approve song (admin only)
const approveSong = async (req, res) => {
  try {
    const { songId } = req.params;
    const { rejectionReason } = req.body;

    const song = await Song.findById(songId);
    
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    if (req.body.action === 'reject') {
      song.status = 'rejected';
      song.rejectionReason = rejectionReason;
    } else {
      song.status = 'approved';
      song.approvedBy = req.user.id;
      song.approvedAt = new Date();
    }

    await song.save();

    res.json({
      success: true,
      message: `Song ${req.body.action === 'reject' ? 'rejected' : 'approved'} successfully`,
      data: song
    });
  } catch (error) {
    console.error('Error approving song:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve song'
    });
  }
};

// Delete song (admin only)
const deleteSong = async (req, res) => {
  try {
    const { songId } = req.params;

    const song = await Song.findById(songId);
    
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    await Song.findByIdAndDelete(songId);

    res.json({
      success: true,
      message: 'Song deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete song'
    });
  }
};

// Get song by ID
const getSongById = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await Song.findById(id)
      .populate('submittedBy', 'username')
      .populate('approvedBy', 'username');

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.json({
      success: true,
      data: song
    });
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch song'
    });
  }
};

// Get user's submitted songs
const getUserSongs = async (req, res) => {
  try {
    const songs = await Song.find({ submittedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: songs
    });
  } catch (error) {
    console.error('Error fetching user songs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user songs'
    });
  }
};

module.exports = {
  getApprovedSongs,
  getAllSongs,
  submitSong,
  approveSong,
  deleteSong,
  getSongById,
  getUserSongs
};