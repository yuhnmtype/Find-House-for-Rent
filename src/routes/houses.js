const express = require('express');
const router  = express.Router();
const {
  getHouses, getHouseById, createHouse,
  updateHouse, deleteHouse, getMyHouses, updateHouseStatus,
} = require('../controllers/houseController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// ── Public ───────────────────────────────────────────────────────────────────
router.get('/', getHouses);

// ── Landlord-specific static paths MUST come before /:id ────────────────────
// If '/landlord/my' were registered after '/:id', Express would match it first
// with id = "landlord", parseInt would return NaN, and the DB query would crash.
router.get('/landlord/my', authenticate, authorize('LANDLORD'), getMyHouses);

// ── Parameterised routes ─────────────────────────────────────────────────────
router.get('/:id',         getHouseById);
router.post('/',           authenticate, authorize('LANDLORD'), upload.array('images', 10), createHouse);
router.put('/:id',         authenticate, authorize('LANDLORD', 'STAFF'), upload.array('images', 10), updateHouse);
router.delete('/:id',      authenticate, authorize('LANDLORD', 'STAFF'), deleteHouse);
router.patch('/:id/status',authenticate, authorize('LANDLORD', 'STAFF'), updateHouseStatus);

module.exports = router;
