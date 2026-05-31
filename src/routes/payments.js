const express = require('express');
const router = express.Router();
const {
  generateMonthlyFees, getMyPayments, markAsPaid,
  getAllPayments, getPaymentStats,
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/generate', authenticate, authorize('STAFF'), generateMonthlyFees);
router.get('/my', authenticate, authorize('LANDLORD'), getMyPayments);
router.patch('/:id/pay', authenticate, authorize('LANDLORD', 'STAFF'), markAsPaid);
router.get('/stats', authenticate, authorize('STAFF'), getPaymentStats);
router.get('/', authenticate, authorize('STAFF'), getAllPayments);

module.exports = router;
