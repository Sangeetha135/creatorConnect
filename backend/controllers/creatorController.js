const User = require('../models/User');
const Influencer = require('../models/Influencer');
const asyncHandler = require('express-async-handler');

// @desc    Get all creators/influencers
// @route   GET /api/creators
// @access  Private
const getCreators = asyncHandler(async (req, res) => {
    // Find all users with role 'influencer' and their associated influencer profiles
    const creators = await User.find({ role: 'influencer' })
        .select('-password')
        .lean();

    // Get the influencer details for each creator
    const creatorsWithDetails = await Promise.all(
        creators.map(async (creator) => {
            const influencer = await Influencer.findOne({ user: creator._id }).lean();
            return {
                id: creator._id,
                name: creator.name,
                email: creator.email,
                avatar: creator.profilePicture,
                subscribers: influencer?.youtube?.subscriberCount || 0,
                avgViews: influencer?.youtube?.averageViews || 0,
                platforms: influencer?.youtube ? ['YouTube'] : [],
                category: influencer?.categories?.[0] || '',
                location: influencer?.location || '',
                description: influencer?.bio || ''
            };
        })
    );

    res.json(creatorsWithDetails);
});

module.exports = {
    getCreators
}; 