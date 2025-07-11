const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
    getConversations,
    getMessages,
    sendMessage,
    getUnreadCounts
} = require('../controllers/messageController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/messages');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create messages directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads/messages');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
router.get('/conversations', protect, getConversations);
router.get('/unread-counts', protect, getUnreadCounts);
router.get('/:campaignId/:userId', protect, getMessages);
router.post('/', protect, upload.single('file'), sendMessage);

module.exports = router; 