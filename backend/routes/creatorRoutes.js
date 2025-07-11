const express = require('express');
const router = express.Router();
const { getCreators } = require('../controllers/creatorController');
const { protect } = require('../middleware/authMiddleware');

// Get all creators
router.route('/').get(protect, getCreators);

module.exports = router; 