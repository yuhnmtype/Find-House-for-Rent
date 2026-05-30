const express = require('express');
const router  = express.Router();
const {
  getHouses, getHouseById, createHouse,
  updateHouse, deleteHouse, getMyHouses, updateHouseStatus,
  getLandlordStats,
} = require('../controllers/houseController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// public
router.get('/', getHouses);

// static paths — must come before /:id
router.get('/landlord/my',    authenticate, authorize('LANDLORD'), getMyHouses);
router.get('/landlord/stats', authenticate, authorize('LANDLORD'), getLandlordStats);

// ── Parameterised routes ─────────────────────────────────────────────────────
router.get('/:id',         getHouseById);
router.post('/',           authenticate, authorize('LANDLORD'), upload.array('images', 10), createHouse);
router.put('/:id',         authenticate, authorize('LANDLORD', 'STAFF'), upload.array('images', 10), updateHouse);
router.delete('/:id',      authenticate, authorize('LANDLORD', 'STAFF'), deleteHouse);
router.patch('/:id/status',authenticate, authorize('LANDLORD', 'STAFF'), updateHouseStatus);

module.exports = router;