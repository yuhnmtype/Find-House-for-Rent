const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, toggleUserStatus,
  createStaff, getDashboardStats,
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/dashboard/stats', authenticate, authorize('STAFF'), getDashboardStats);
router.get('/', authenticate, authorize('STAFF'), getAllUsers);
router.get('/:id', authenticate, authorize('STAFF'), getUserById);
router.patch('/:id/status', authenticate, authorize('STAFF'), toggleUserStatus);
router.post('/staff', authenticate, authorize('STAFF'), createStaff);

module.exports = router;
