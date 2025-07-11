const express = require('express');
const router = express.Router();
const { registerInfluencer, login, verifyEmail, resendVerificationCode, verifyEmailAndProceed } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register/influencer', registerInfluencer);
router.post('/login', login);

// Email verification routes
router.post('/verify-email', verifyEmail);
router.post('/verify-email-proceed', verifyEmailAndProceed);
router.post('/resend-verification', resendVerificationCode);

module.exports = router; 