const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createPost,
    getAllPosts,
    toggleLike
} = require('../controllers/postController');

// Protected routes
router.post('/', protect, createPost);
router.get('/', protect, getAllPosts);
router.put('/:id/like', protect, toggleLike);

module.exports = router; 