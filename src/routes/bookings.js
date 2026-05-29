const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getBookingsForHouse,
  updateBookingStatus, getAllBookings,
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, authorize('STUDENT'), createBooking);
router.get('/my', authenticate, authorize('STUDENT'), getMyBookings);
router.get('/house/:houseId', authenticate, authorize('LANDLORD', 'STAFF'), getBookingsForHouse);
router.patch('/:id/status', authenticate, authorize('LANDLORD', 'STUDENT', 'STAFF'), updateBookingStatus);
router.get('/', authenticate, authorize('STAFF'), getAllBookings);

module.exports = router;
