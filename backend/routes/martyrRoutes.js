const express = require('express');
const {
  getApprovedMartyrs,
  getAllMartyrs,
  submitMartyr,
  approveMartyr,
  deleteMartyr,
  getMartyrById,
  getUserMartyrs
} = require('../controllers/martyrController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/approved', getApprovedMartyrs);
router.get('/:id', getMartyrById);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.post('/submit', submitMartyr);
router.get('/user/submissions', getUserMartyrs);

// Admin routes
router.get('/admin/all', admin, getAllMartyrs);
router.put('/admin/:martyrId/approve', admin, approveMartyr);
router.delete('/admin/:martyrId', admin, deleteMartyr);

module.exports = router; 