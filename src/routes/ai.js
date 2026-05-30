const express = require('express');
const router  = express.Router();
const { chat, recommend }            = require('../controllers/aiController');
const { authenticate, authorize }    = require('../middlewares/authMiddleware');

// chat is public — anyone can ask housing questions
router.post('/chat',      chat);

// recommend requires a logged-in student (needs view/favorite history)
router.get('/recommend',  authenticate, authorize('STUDENT'), recommend);

module.exports = router;