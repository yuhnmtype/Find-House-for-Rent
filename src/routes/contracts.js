const express = require('express');
const router = express.Router();
const {
  createContract, getMyContracts, getContractsByHouse,
  getAllContracts, terminateContract,
} = require('../controllers/contractController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/', authenticate, authorize('LANDLORD', 'STAFF'), createContract);
router.get('/my', authenticate, authorize('STUDENT'), getMyContracts);
router.get('/house/:houseId', authenticate, authorize('LANDLORD', 'STAFF'), getContractsByHouse);
router.get('/', authenticate, authorize('STAFF'), getAllContracts);
router.patch('/:id/terminate', authenticate, authorize('LANDLORD', 'STAFF'), terminateContract);

module.exports = router;
