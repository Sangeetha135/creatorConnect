const express = require('express');
const router = express.Router();
const { protect, isInfluencer, isBrand } = require('../middleware/authMiddleware');
const {
    submitContent,
    getCampaignContent,
    reviewContent
} = require('../controllers/contentController');

// Content submission routes
router.post('/submit', protect, isInfluencer, submitContent);

// Route for getting all content for a campaign
router.get('/campaign/:campaignId', protect, getCampaignContent);

// Route for reviewing content (brands only)
router.put('/:contentId/review', protect, isBrand, reviewContent);

module.exports = router; 