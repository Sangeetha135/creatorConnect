const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { content, media } = req.body;
    
    if (!content || content.trim().length === 0) {
        res.status(400);
        throw new Error('Content is required');
    }

    // Validate media if present
    if (media && Array.isArray(media)) {
        media.forEach(item => {
            if (!item.type || !item.url || !['image', 'video'].includes(item.type)) {
                res.status(400);
                throw new Error('Invalid media format');
            }
        });
    }

    const post = await Post.create({
        user: req.user._id,
        content,
        media: media || []
    });

    if (post) {
        const populatedPost = await Post.findById(post._id)
            .populate('user', 'name email profileImage role');
        res.status(201).json(populatedPost);
    } else {
        res.status(400);
        throw new Error('Invalid post data');
    }
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({})
        .populate('user', 'name email profileImage role')
        .sort({ createdAt: -1 });

    // Transform posts to ensure media is properly formatted
    const formattedPosts = posts.map(post => {
        const formattedPost = post.toObject();
        
        // If media exists but is in old format (string), convert to new format
        if (formattedPost.media) {
            formattedPost.media = formattedPost.media.map(media => {
                if (typeof media === 'string') {
                    return {
                        type: 'image', // Default to image for legacy data
                        url: media
                    };
                }
                return media;
            });
        }
        
        return formattedPost;
    });

    res.json(formattedPosts);
});

// @desc    Toggle like on a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    const likedIndex = post.likes.indexOf(req.user._id);
    if (likedIndex === -1) {
        post.likes.push(req.user._id);
    } else {
        post.likes.splice(likedIndex, 1);
    }

    await post.save();
    res.json(post);
});

module.exports = {
    createPost,
    getAllPosts,
    toggleLike
}; 