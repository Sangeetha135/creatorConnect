const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getCampaigns,
    createCampaign,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    applyToCampaign,
    updateCampaignProgress,
    getCampaignUsers,
    updateCampaignStatus,
    getCompletedCampaigns,
    updateAllCampaignsProgress,
    checkAndUpdateCampaignProgress,
    handleInvitation,
    testRejectionNotification,
    recalculateCampaignStats
} = require('../controllers/campaignController');
const { protect, isBrand, isInfluencer, isAdmin } = require('../middleware/authMiddleware');

// Configure multer for campaign assets
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/campaigns');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create campaigns directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads/campaigns');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

router.route('/')
    .get(protect, getCampaigns)
    .post(protect, isBrand, upload.single('campaignAssets'), createCampaign);

// Add completed campaigns route BEFORE the dynamic ID routes
router.get('/completed', protect, getCompletedCampaigns);

// Add route for updating all campaigns' progress
router.route('/update-all-progress')
    .post(protect, isAdmin, updateAllCampaignsProgress);

router.route('/:id')
    .get(protect, async (req, res, next) => {
        await checkAndUpdateCampaignProgress(req.params.id);
        next();
    }, getCampaignById)
    .put(protect, isBrand, async (req, res, next) => {
        await checkAndUpdateCampaignProgress(req.params.id);
        next();
    }, updateCampaign)
    .delete(protect, isBrand, deleteCampaign);

router.route('/:id/users')
    .get(protect, async (req, res, next) => {
        await checkAndUpdateCampaignProgress(req.params.id);
        next();
    }, getCampaignUsers);

router.route('/:id/apply')
    .post(protect, isInfluencer, applyToCampaign);

// Add campaign progress update route
router.route('/:id/progress')
    .put(protect, isBrand, updateCampaignProgress);

// @route   PUT /api/campaigns/:id/status
// @desc    Update campaign status and update influencer stats if completed
// @access  Private
router.put('/:id/status', protect, isBrand, async (req, res, next) => {
    await checkAndUpdateCampaignProgress(req.params.id);
    next();
}, updateCampaignStatus);

// Test route for rejection notifications
router.post('/test-rejection', protect, testRejectionNotification);

// @route   POST /api/campaigns/recalculate-stats
// @desc    Recalculate all campaign statistics for brands and influencers
// @access  Private
router.post('/recalculate-stats', protect, recalculateCampaignStats);

module.exports = router;