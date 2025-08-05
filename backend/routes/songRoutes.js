const express = require('express');
const {
  getApprovedSongs,
  getAllSongs,
  submitSong,
  approveSong,
  deleteSong,
  getSongById,
  getUserSongs
} = require('../controllers/songController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/approved', getApprovedSongs);
router.get('/:id', getSongById);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.post('/submit', submitSong);
router.get('/user/submissions', getUserSongs);

// Admin routes
router.get('/admin/all', admin, getAllSongs);
router.put('/admin/:songId/approve', admin, approveSong);
router.delete('/admin/:songId', admin, deleteSong);

module.exports = router;