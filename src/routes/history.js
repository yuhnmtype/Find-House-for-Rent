const express = require('express');
const router  = express.Router();
const { getMyHistory, clearHistory } = require('../controllers/viewHistoryController');
const { authenticate, authorize }    = require('../middlewares/authMiddleware');

router.get('/',    authenticate, authorize('STUDENT'), getMyHistory);
router.delete('/', authenticate, authorize('STUDENT'), clearHistory);

module.exports = router;