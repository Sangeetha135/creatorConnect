const express = require('express');
const router = express.Router();
const {
    createInvitation,
    getInvitations,
    getInvitationById,
    updateInvitation,
    respondToInvitation
} = require('../controllers/invitationController');
const { protect, isBrand } = require('../middleware/authMiddleware');

// Routes for invitations
router.route('/')
    .post(protect, isBrand, createInvitation)
    .get(protect, getInvitations);

router.route('/:id')
    .get(protect, getInvitationById)
    .put(protect, updateInvitation);

// Route for influencers to respond to invitations
router.route('/:invitationId/respond')
    .post(protect, respondToInvitation);

module.exports = router; 