
const express = require('express');
const router  = express.Router();
const { toggleFavorite, getMyFavorites, checkFavorite } = require('../controllers/favoriteController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/',                    authenticate, authorize('STUDENT'), getMyFavorites);
router.get('/check/:houseId',      authenticate, authorize('STUDENT'), checkFavorite);
router.post('/:houseId',           authenticate, authorize('STUDENT'), toggleFavorite);

module.exports = router;