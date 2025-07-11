const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get YouTube channel analytics
// @route   GET /api/analytics/youtube
// @access  Private
const getYouTubeAnalytics = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.socialLinks?.youtube) {
    res.status(400);
    throw new Error('YouTube channel not connected');
  }

  // TODO: Integrate with YouTube Data API to fetch real analytics
  // For now, returning mock data
  const analytics = {
    subscribers: {
      total: 10500,
      change: 150,
      changePeriod: 'month'
    },
    views: {
      total: 250000,
      change: 25000,
      changePeriod: 'month'
    },
    watchTime: {
      average: 8.5,
      change: 1.2,
      changePeriod: 'month'
    },
    viewsTrend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [1200, 1900, 3000, 5000, 4000, 6000]
    },
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 30 },
        { range: '25-34', percentage: 40 },
        { range: '35-44', percentage: 15 },
        { range: '45-54', percentage: 10 },
        { range: '55+', percentage: 5 }
      ]
    },
    engagement: {
      likes: 65,
      comments: 25,
      shares: 10
    }
  };

  res.json(analytics);
});

module.exports = {
  getYouTubeAnalytics
}; 