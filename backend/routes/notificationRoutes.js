const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    createTestRejectionNotification
} = require('../controllers/notificationController');

// Get all notifications for logged in user
router.get('/', protect, getNotifications);

// Mark a notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Get unread notification count
router.get('/unread-count', protect, getUnreadCount);

// Test route to create a rejection notification
router.post('/test-rejection', createTestRejectionNotification);

module.exports = router; 