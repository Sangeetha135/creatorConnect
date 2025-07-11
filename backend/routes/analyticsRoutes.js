const express = require('express');
const router = express.Router();
const { getYouTubeAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/youtube', protect, getYouTubeAnalytics);

module.exports = router; 