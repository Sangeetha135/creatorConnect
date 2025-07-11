const express = require('express');
const router = express.Router();
const {
    registerBrand,
    registerInfluencer,
    loginUser,
    verifyEmailAndProceed,
    verifyEmail,
    resendVerificationCode,
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    updateSocialMediaData,
    updateAnalytics,
    forgotPassword,
    resetPassword,
    searchUsers,
    getUserProfile,
    getCampaignStats
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const auth = require('../middleware/auth');

// Public routes
router.post('/register/brand', registerBrand);
router.post('/register/influencer', registerInfluencer);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/verify-email-proceed', verifyEmailAndProceed);
router.post('/resend-verification', resendVerificationCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/search', searchUsers);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Social media and analytics routes
router.put('/social-media', protect, updateSocialMediaData);
router.put('/analytics', protect, updateAnalytics);

// Campaign statistics route
router.get('/campaign-stats/:userId', protect, getCampaignStats);

// Get user profile by ID
router.get('/profile/:userId', getUserProfile);

module.exports = router;