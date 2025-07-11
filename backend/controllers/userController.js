// const User = require('../models/User');
// const Brand = require('../models/Brand');
// const Influencer = require('../models/Influencer');
// const Campaign = require('../models/Campaign');
// const generateToken = require('../utils/generateToken');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
// const { validationResult } = require('express-validator');
// const asyncHandler = require('express-async-handler');
// const Content = require('../models/Content');

// // Create email transporter
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

// // Generate verification code
// const generateVerificationCode = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// };

// const registerBrand = async (req, res) => {
//     try {
//         const { name, email, password, companyName, website, industry, description } = req.body;

//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // Generate verification code
//         const verificationCode = generateVerificationCode();
//         const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

//         const user = await User.create({
//             name,
//             email,
//             password,
//             role: 'brand',
//             verificationCode,
//             verificationExpiry,
//             isVerified: false
//         });

//         if (user) {
//             const brand = await Brand.create({
//                 brand: user._id,
//                 companyName,
//                 website,
//                 industry,
//                 description
//             });

//             // Try to send verification email
//             const emailSent = await sendVerificationEmail(email, verificationCode);

//             res.status(201).json({
//                 message: 'Registration successful. Please check your email for verification code.',
//                 verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
//                 userId: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 companyName: brand.companyName,
//                 emailSent
//             });
//         }
//     } catch (error) {
//         res.status(400).json({ message: error.message || 'Registration failed' });
//     }
// };

// const registerInfluencer = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Check if user already exists
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // Generate verification code
//         const verificationCode = generateVerificationCode();
//         const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

//         // Create new user with verification details
//         user = new User({
//             name,
//             email,
//             password, // Password will be hashed by the pre-save middleware
//             role: 'influencer',
//             verificationCode,
//             verificationExpiry,
//             isVerified: false
//         });

//         // Save user - this will trigger the password hashing middleware
//         await user.save();

//         // Create basic influencer profile
//         const influencer = new Influencer({
//             user: user._id,
//             isProfileComplete: false
//         });

//         await influencer.save();

//         // Send verification email
//         const emailSent = await sendVerificationEmail(email, verificationCode);

//         res.status(201).json({
//             message: 'Registration successful. Please verify your email before connecting your YouTube channel.',
//             verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
//             userId: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             emailSent,
//             isVerified: false,
//             isProfileComplete: false
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message || 'Registration failed' });
//     }
// };

// const loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Add debug logging
//         console.log('Login attempt for email:', email);

//         const user = await User.findOne({ email });
//         if (!user) {
//             console.log('User not found for email:', email);
//             return res.status(400).json({ message: 'Invalid email or password' });
//         }

//         // Check if user is verified
//         if (!user.isVerified) {
//             console.log('User not verified:', email);
//             return res.status(400).json({ message: 'Please verify your email before logging in' });
//         }

//         const isMatch = await user.matchPassword(password);
//         console.log('Password match result:', isMatch);

//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid email or password' });
//         }

//         let additionalData = {};
//         if (user.role === 'brand') {
//             const brand = await Brand.findOne({ brand: user._id });
//             additionalData = {
//                 companyName: brand?.companyName,
//                 industry: brand?.industry
//             };
//         } else {
//             const influencer = await Influencer.findOne({ user: user._id });
//             additionalData = {
//                 bio: influencer?.bio,
//                 youtube: influencer?.youtube
//             };
//         }

//         const token = generateToken(user._id);

//         res.json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             isVerified: user.isVerified,
//             ...additionalData,
//             token
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ message: 'Server error during login' });
//     }
// };

// // Verify email and proceed to YouTube authorization
// const verifyEmailAndProceed = async (req, res) => {
//     try {
//         const { email, code } = req.body;

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         if (user.isVerified) {
//             return res.status(400).json({ message: 'Email is already verified' });
//         }

//         if (user.verificationCode !== code) {
//             return res.status(400).json({ message: 'Invalid verification code' });
//         }

//         if (user.verificationExpiry < Date.now()) {
//             return res.status(400).json({ message: 'Verification code has expired' });
//         }

//         user.isVerified = true;
//         user.verificationCode = undefined;
//         user.verificationExpiry = undefined;
//         await user.save();

//         // Generate token for YouTube authorization
//         const token = generateToken(user._id);

//         res.json({
//             message: 'Email verified successfully. Please proceed with YouTube channel connection.',
//             token,
//             userId: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             isVerified: true,
//             nextStep: 'youtube-auth'
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Verify email
// const verifyEmail = async (req, res) => {
//     try {
//         const { email, code } = req.body;

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         if (user.isVerified) {
//             return res.status(400).json({ message: 'Email is already verified' });
//         }

//         if (user.verificationCode !== code) {
//             return res.status(400).json({ message: 'Invalid verification code' });
//         }

//         if (user.verificationExpiry < Date.now()) {
//             return res.status(400).json({ message: 'Verification code has expired' });
//         }

//         user.isVerified = true;
//         user.verificationCode = undefined;
//         user.verificationExpiry = undefined;
//         await user.save();

//         // Generate token
//         const token = generateToken(user._id);

//         res.json({
//             message: 'Email verified successfully',
//             token,
//             userId: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             isVerified: true
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Resend verification code
// const resendVerificationCode = async (req, res) => {
//     try {
//         const { email } = req.body;

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         if (user.isVerified) {
//             return res.status(400).json({ message: 'Email is already verified' });
//         }

//         // Generate new verification code
//         const verificationCode = generateVerificationCode();
//         user.verificationCode = verificationCode;
//         user.verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//         await user.save();

//         // Send new verification email
//         const emailSent = await sendVerificationEmail(email, verificationCode);

//         // In development, return the verification code
//         if (process.env.NODE_ENV === 'development') {
//             return res.json({
//                 message: 'Verification code sent successfully',
//                 verificationCode: verificationCode,
//                 emailSent: emailSent
//             });
//         }

//         // In production, don't return the verification code
//         res.json({
//             message: emailSent
//                 ? 'Verification code sent successfully'
//                 : 'Verification code generated but email sending failed. Please try again or contact support.'
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Register a new user
// const register = async (req, res) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const { email, password, role } = req.body;

//         // Check if user already exists
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // Generate verification code
//         const verificationCode = generateVerificationCode();
//         const verificationCodeExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

//         // Create new user
//         user = new User({
//             email,
//             password,
//             role,
//             verificationCode,
//             verificationCodeExpires,
//             isVerified: false
//         });

//         // Hash password
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(password, salt);

//         await user.save();

//         // Send verification email
//         const emailSent = await sendVerificationEmail(email, verificationCode);
//         if (!emailSent) {
//             return res.status(500).json({ message: 'Failed to send verification email' });
//         }

//         res.status(201).json({
//             message: 'User registered successfully. Please check your email for verification code.',
//             userId: user._id
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Login user
// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Validate input
//         if (!email || !password) {
//             return res.status(400).json({
//                 message: 'Please provide both email and password'
//             });
//         }

//         // Check if user exists
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({
//                 message: 'Invalid email or password'
//             });
//         }

//         // Check if user is verified
//         if (!user.isVerified) {
//             return res.status(400).json({
//                 message: 'Please verify your email before logging in'
//             });
//         }

//         // Check password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({
//                 message: 'Invalid email or password'
//             });
//         }

//         // Get additional data based on role
//         let additionalData = {};
//         if (user.role === 'brand') {
//             const brand = await Brand.findOne({ brand: user._id });
//             additionalData = {
//                 companyName: brand?.companyName,
//                 industry: brand?.industry
//             };
//         } else if (user.role === 'influencer') {
//             const influencer = await Influencer.findOne({ user: user._id });
//             additionalData = {
//                 bio: influencer?.bio,
//                 youtube: influencer?.youtube,
//                 isProfileComplete: influencer?.isProfileComplete
//             };
//         }

//         // Generate JWT token
//         const token = generateToken(user._id);

//         res.json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             isVerified: user.isVerified,
//             token,
//             ...additionalData
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({
//             message: 'Server error during login. Please try again.'
//         });
//     }
// };

// // Get user profile
// const getProfile = async (req, res) => {
//     try {
//         // Get user from database
//         const user = await User.findById(req.user._id).select('-password');
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Get influencer data if user is an influencer
//         let profileData = {
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             isVerified: user.isVerified
//         };

//         if (user.role === 'influencer') {
//             const influencer = await Influencer.findOne({ user: user._id });
//             if (influencer) {
//                 profileData = {
//                     ...profileData,
//                     bio: influencer.bio,
//                     categories: influencer.categories,
//                     socialLinks: influencer.socialLinks,
//                     completedCampaigns: influencer.completedCampaigns || 0,
//                     profilePictureUrl: influencer.profilePictureUrl,
//                     youtube: influencer.youtube ? {
//                         channelId: influencer.youtube.channelId,
//                         channelName: influencer.youtube.channelName,
//                         subscriberCount: influencer.youtube.subscriberCount,
//                         totalViews: influencer.youtube.totalViews,
//                         averageViews: influencer.youtube.averageViews,
//                         engagementRate: influencer.youtube.engagementRate,
//                         demographics: influencer.youtube.demographics,
//                         analytics: influencer.youtube.analytics,
//                         contentStats: influencer.youtube.contentStats,
//                         lastUpdated: influencer.youtube.lastUpdated
//                     } : null
//                 };
//             }
//         } else if (user.role === 'brand') {
//             const brand = await Brand.findOne({ brand: user._id });
//             if (brand) {
//                 profileData = {
//                     ...profileData,
//                     companyName: brand.companyName,
//                     website: brand.website,
//                     industry: brand.industry,
//                     description: brand.description,
//                     logoUrl: brand.logoUrl,
//                     location: brand.location,
//                     phone: brand.phone,
//                     preferredCategories: brand.preferredCategories || [],
//                     activeCampaigns: brand.activeCampaigns || 0,
//                     completedCampaigns: brand.completedCampaigns || 0,
//                     totalInfluencers: brand.totalInfluencers || 0,
//                     totalReach: brand.totalReach || 0
//                 };
//             }
//         }

//         res.json(profileData);
//     } catch (error) {
//         console.error('Get profile error:', error);
//         res.status(500).json({ message: 'Failed to fetch profile data' });
//     }
// };

// // Update user profile
// const updateProfile = async (req, res) => {
//     try {
//         const { name, bio, categories, socialLinks } = req.body;

//         // Get user from database
//         const user = await User.findById(req.user._id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Update user fields
//         if (name) user.name = name;

//         await user.save();

//         // If user is an influencer, update influencer profile
//         if (user.role === 'influencer') {
//             const influencer = await Influencer.findOne({ user: user._id });
//             if (!influencer) {
//                 return res.status(404).json({ message: 'Influencer profile not found' });
//             }

//             if (bio) influencer.bio = bio;
//             if (categories) influencer.categories = categories;
//             if (socialLinks) influencer.socialLinks = socialLinks;

//             await influencer.save();
//         }

//         res.json({
//             message: 'Profile updated successfully',
//             user: {
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });
//     } catch (error) {
//         console.error('Update profile error:', error);
//         res.status(500).json({ message: 'Failed to update profile' });
//     }
// };

// // Change password
// const changePassword = async (req, res) => {
//     try {
//         const { currentPassword, newPassword } = req.body;
//         const user = await User.findById(req.user.userId);

//         const isMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Current password is incorrect' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(newPassword, salt);
//         await user.save();

//         res.json({ message: 'Password changed successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // @desc    Update social media data
// // @route   PUT /api/users/social-media
// // @access  Private
// const updateSocialMediaData = asyncHandler(async (req, res) => {
//     const { platform, data } = req.body;
//     const user = await User.findById(req.user._id);

//     if (!user) {
//         res.status(404);
//         throw new Error('User not found');
//     }

//     // Initialize socialMedia object if it doesn't exist
//     if (!user.socialMedia) {
//         user.socialMedia = {};
//     }

//     // Update platform-specific data
//     user.socialMedia[platform] = {
//         ...user.socialMedia[platform],
//         ...data,
//         lastUpdated: new Date()
//     };

//     // Calculate engagement rates
//     if (platform === 'youtube') {
//         const totalEngagement = user.socialMedia.youtube.recentVideos?.reduce((sum, video) => sum + (video.views || 0), 0) || 0;
//         const subscribers = user.socialMedia.youtube.subscribers || 0;
//         user.analytics.averageEngagementRate = subscribers > 0 ? (totalEngagement / subscribers) * 100 : 0;
//     } else if (platform === 'instagram') {
//         const totalEngagement = user.socialMedia.instagram.recentPosts?.reduce((sum, post) => sum + (post.likes || 0) + (post.comments || 0), 0) || 0;
//         const followers = user.socialMedia.instagram.followers || 0;
//         user.analytics.averageEngagementRate = followers > 0 ? (totalEngagement / followers) * 100 : 0;
//     } else if (platform === 'tiktok') {
//         const totalEngagement = user.socialMedia.tiktok.recentVideos?.reduce((sum, video) => sum + (video.likes || 0) + (video.comments || 0) + (video.shares || 0), 0) || 0;
//         const followers = user.socialMedia.tiktok.followers || 0;
//         user.analytics.averageEngagementRate = followers > 0 ? (totalEngagement / followers) * 100 : 0;
//     }

//     const updatedUser = await user.save();
//     res.json(updatedUser);
// });

// // @desc    Update analytics data
// // @route   PUT /api/users/analytics
// // @access  Private
// const updateAnalytics = asyncHandler(async (req, res) => {
//     const { monthlyStats, topPerformingContent } = req.body;
//     const user = await User.findById(req.user._id);

//     if (!user) {
//         res.status(404);
//         throw new Error('User not found');
//     }

//     // Initialize analytics object if it doesn't exist
//     if (!user.analytics) {
//         user.analytics = {
//             averageEngagementRate: 0,
//             topPerformingContent: [],
//             monthlyStats: []
//         };
//     }

//     // Update monthly stats
//     if (monthlyStats) {
//         user.analytics.monthlyStats = monthlyStats;
//     }

//     // Update top performing content
//     if (topPerformingContent) {
//         user.analytics.topPerformingContent = topPerformingContent;
//     }

//     const updatedUser = await user.save();
//     res.json(updatedUser);
// });

// // @desc    Handle forgot password request
// // @route   POST /api/users/forgot-password
// // @access  Public
// const forgotPassword = asyncHandler(async (req, res) => {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//         res.status(404);
//         throw new Error('No account found with that email address');
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//     user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

//     await user.save();

//     try {
//         await sendPasswordResetEmail(email, resetToken);
//         res.json({ message: 'Password reset email sent' });
//     } catch (error) {
//         user.resetToken = undefined;
//         user.resetTokenExpiry = undefined;
//         await user.save();

//         res.status(500);
//         throw new Error('Error sending password reset email');
//     }
// });

// // @desc    Reset password
// // @route   POST /api/users/reset-password
// // @access  Public
// const resetPassword = asyncHandler(async (req, res) => {
//     const { token, password } = req.body;

//     // Hash the token to compare with stored hash
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//     const user = await User.findOne({
//         resetToken: hashedToken,
//         resetTokenExpiry: { $gt: Date.now() }
//     });

//     if (!user) {
//         res.status(400);
//         throw new Error('Invalid or expired reset token');
//     }

//     // Set new password
//     user.password = password;
//     user.resetToken = undefined;
//     user.resetTokenExpiry = undefined;

//     await user.save();

//     res.json({ message: 'Password reset successful' });
// });

// // @desc    Search users (brands and creators)
// // @route   GET /api/users/search
// // @access  Public
// const searchUsers = async (req, res) => {
//     try {
//         const { query } = req.query;
//         if (!query) {
//             return res.status(400).json({ message: 'Search query is required' });
//         }

//         // Create a case-insensitive regex pattern for the search query
//         const searchPattern = new RegExp(query, 'i');

//         // Search for users (both brands and creators)
//         const users = await User.find({
//             $or: [
//                 { name: searchPattern },
//                 { email: searchPattern }
//             ]
//         })
//         .select('name email role profilePictureUrl')
//         .limit(10);

//         // Get additional info for brands and creators
//         const enrichedUsers = await Promise.all(users.map(async (user) => {
//             const userData = user.toObject();

//             if (user.role === 'brand') {
//                 const brandInfo = await Brand.findOne({ brand: user._id })
//                     .select('companyName industry');
//                 if (brandInfo) {
//                     userData.companyName = brandInfo.companyName;
//                     userData.industry = brandInfo.industry;
//                 }
//             } else if (user.role === 'influencer') {
//                 const influencerInfo = await Influencer.findOne({ user: user._id })
//                     .select('bio categories');
//                 if (influencerInfo) {
//                     userData.bio = influencerInfo.bio;
//                     userData.categories = influencerInfo.categories;
//                 }
//             }

//             return userData;
//         }));

//         res.json(enrichedUsers);
//     } catch (error) {
//         console.error('Search error:', error);
//         res.status(500).json({ message: 'Error performing search' });
//     }
// };

// // @desc    Get user campaign statistics
// // @route   GET /api/users/campaign-stats/:userId
// // @access  Private
// const getCampaignStats = asyncHandler(async (req, res) => {
//     const userId = req.params.userId;
//     console.log('Fetching campaign stats for userId:', userId);

//     try {
//         const user = await User.findById(userId);
//         console.log('Found user:', user ? 'Yes' : 'No');
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Get all campaigns where the user is either the brand or an accepted/completed influencer
//         console.log('Searching for campaigns');

//         let campaignQuery;
//         if (user.role === 'brand') {
//             campaignQuery = { brand: userId };
//         } else {
//             campaignQuery = {
//             $or: [
//                     { 'applications': {
//                         $elemMatch: {
//                             'influencer': userId,
//                             'status': { $in: ['accepted', 'completed'] }
//                         }
//                     }},
//                     { 'invitations': {
//                         $elemMatch: {
//                             'influencer': userId,
//                             'status': 'accepted'
//                         }
//                     }}
//             ]
//             };
//         }

//         const campaigns = await Campaign.find(campaignQuery);

//         console.log('Found campaigns:', {
//             total: campaigns.length,
//             campaignIds: campaigns.map(c => c._id),
//             statuses: campaigns.map(c => c.status)
//         });

//         // Calculate statistics
//         const stats = {
//             totalCampaigns: campaigns.length,
//             activeCampaigns: campaigns.filter(c => c.status === 'active').length,
//             completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
//             pendingCampaigns: campaigns.filter(c => c.status === 'pending').length,
//             cancelledCampaigns: campaigns.filter(c => c.status === 'cancelled').length,
//             totalEarnings: campaigns.reduce((sum, campaign) => {
//                 if (user.role === 'influencer') {
//                     // For influencers, use their specific compensation
//                     if (campaign.status === 'completed') {
//                         const influencerApplication = campaign.applications.find(
//                             app => app.influencer.toString() === userId && app.status === 'completed'
//                         );
//                         return sum + (influencerApplication?.compensation || campaign.budget || 0);
//                     }
//                 } else {
//                     // For brands, use the campaign budget
//                     return sum + (campaign.budget || 0);
//                 }
//                 return sum;
//             }, 0),
//             successRate: campaigns.length > 0
//                 ? (campaigns.filter(c => c.status === 'completed').length / campaigns.length * 100).toFixed(1)
//                 : 0
//         };

//         console.log('Calculated campaign stats:', stats);

//         // Calculate metrics
//         const metrics = {
//             totalViews: 0,
//             totalLikes: 0,
//             totalComments: 0,
//             totalShares: 0,
//             averageEngagement: 0
//         };

//         // For completed campaigns, get content metrics
//         const completedCampaigns = campaigns.filter(c => c.status === 'completed');
//         for (const campaign of completedCampaigns) {
//             const contentQuery = user.role === 'influencer'
//                 ? { campaign: campaign._id, creator: userId, status: 'approved' }
//                 : { campaign: campaign._id, status: 'approved' };

//             const campaignContent = await Content.find(contentQuery);

//             campaignContent.forEach(content => {
//                 if (content.metrics) {
//                     metrics.totalViews += content.metrics.views || 0;
//                     metrics.totalLikes += content.metrics.likes || 0;
//                     metrics.totalComments += content.metrics.comments || 0;
//                     metrics.totalShares += content.metrics.shares || 0;
//                 }
//             });
//         }

//         // Calculate average engagement if there are views
//         if (metrics.totalViews > 0) {
//             metrics.averageEngagement = (
//                 ((metrics.totalLikes + metrics.totalComments + metrics.totalShares) / metrics.totalViews) * 100
//             ).toFixed(2);
//         }

//         // Get recent campaigns
//         const recentCampaigns = campaigns
//             .sort((a, b) => b.createdAt - a.createdAt)
//             .slice(0, 5)
//             .map(c => ({
//                 id: c._id,
//                 title: c.title,
//                 status: c.status,
//                 platform: c.platform,
//                 startDate: c.startDate,
//                 endDate: c.endDate
//             }));

//         // Calculate campaigns by category
//         const campaignsByCategory = {};
//         campaigns.forEach(campaign => {
//             if (campaign.category) {
//                 campaignsByCategory[campaign.category] = (campaignsByCategory[campaign.category] || 0) + 1;
//             }
//         });

//         // Calculate campaigns by platform
//         const campaignsByPlatform = {
//             youtube: campaigns.filter(c => c.platform === 'youtube').length,
//             instagram: campaigns.filter(c => c.platform === 'instagram').length,
//             tiktok: campaigns.filter(c => c.platform === 'tiktok').length
//         };

//         const finalStats = {
//             ...stats,
//             campaignsByCategory,
//             campaignsByPlatform,
//             recentCampaigns,
//             metrics
//         };

//         console.log('Sending final stats to client:', JSON.stringify(finalStats, null, 2));
//         res.json(finalStats);
//     } catch (error) {
//         console.error('Error calculating campaign stats:', error);
//         console.error('Error stack:', error.stack);
//         res.status(500).json({ message: 'Error calculating campaign statistics' });
//     }
// });

// const calculateBrandCampaignStats = async (userId) => {
//     // Get all campaigns for the brand
//     const campaigns = await Campaign.find({ brand: userId });

//     // Calculate basic statistics
//     const stats = {
//         totalCampaigns: campaigns.length,
//         activeCampaigns: campaigns.filter(c => c.status === 'active').length,
//         completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
//         pendingCampaigns: campaigns.filter(c => c.status === 'pending').length,
//         totalInfluencers: 0,
//         totalEarnings: campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0),
//         successRate: campaigns.length > 0
//             ? (campaigns.filter(c => c.status === 'completed').length / campaigns.length * 100).toFixed(1)
//             : 0
//     };

//     // Calculate total influencers across all campaigns
//     for (const campaign of campaigns) {
//         const acceptedApplications = campaign.applications.filter(app => app.status === 'accepted');
//         stats.totalInfluencers += acceptedApplications.length;
//     }

//     return stats;
// };

// // Update getUserProfile to include campaign stats
// const getUserProfile = async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         console.log('Getting user profile for userId:', userId);

//         const user = await User.findById(userId).select('-password -verificationCode -verificationExpiry');
//         console.log('Found user:', user ? 'Yes' : 'No');

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         let profileData = {
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             profilePictureUrl: user.profilePictureUrl
//         };

//         if (user.role === 'brand') {
//             console.log('Fetching brand data');
//             const brand = await Brand.findOne({ brand: user._id });
//             if (brand) {
//                 // Calculate campaign statistics
//                 const campaignStats = await calculateBrandCampaignStats(user._id);

//                 profileData = {
//                     ...profileData,
//                     companyName: brand.companyName,
//                     website: brand.website,
//                     industry: brand.industry,
//                     description: brand.description,
//                     logoUrl: brand.logoUrl,
//                     location: brand.location,
//                     phone: brand.phone,
//                     preferredCategories: brand.preferredCategories || [],
//                     campaignStats: {
//                         ...campaignStats,
//                         // Use stored stats for historical data that can't be calculated in real-time
//                         totalReach: brand.campaignStats?.totalReach || 0
//                     }
//                 };
//             }
//         } else {
//             console.log('Fetching influencer data');
//             const influencer = await Influencer.findOne({ user: user._id });
//             if (influencer) {
//                 profileData = {
//                     ...profileData,
//                     bio: influencer.bio,
//                     categories: influencer.categories,
//                     socialMedia: influencer.socialMedia,
//                     languages: influencer.languages,
//                     location: influencer.location,
//                     rating: influencer.rating,
//                     totalReviews: influencer.totalReviews,
//                     // Update campaignStats with calculated values
//                     campaignStats: {
//                         ...campaignStats,
//                         totalCampaigns: campaignStats.totalCampaigns,
//                         activeCampaigns: campaignStats.activeCampaigns,
//                         completedCampaigns: campaignStats.completedCampaigns,
//                         pendingCampaigns: campaignStats.pendingCampaigns,
//                         totalEarnings: campaignStats.totalEarnings,
//                         successRate: campaignStats.successRate,
//                         metrics: campaignStats.metrics,
//                         averageRating: influencer.rating || 0
//                     },
//                     youtube: influencer.youtube ? {
//                         channelId: influencer.youtube.channelId,
//                         channelName: influencer.youtube.channelName,
//                         subscriberCount: influencer.youtube.subscriberCount || 0,
//                         totalViews: influencer.youtube.totalViews || 0,
//                         engagementRate: influencer.youtube.engagementRate || 0,
//                         analytics: {
//                             monthlyStats: [
//                                 {
//                                     month: 'Last 30 Days',
//                                     views: influencer.youtube.analytics?.viewsLast30Days || 0,
//                                     engagement: influencer.youtube.analytics?.engagementRateLast30Days || 0
//                                 },
//                                 {
//                                     month: 'Last 90 Days',
//                                     views: influencer.youtube.analytics?.viewsLast90Days || 0,
//                                     engagement: influencer.youtube.analytics?.engagementRateLast90Days || 0
//                                 }
//                             ]
//                         },
//                         demographics: {
//                             ageGroups: influencer.youtube.demographics?.ageGroups?.reduce((acc, curr) => {
//                                 acc[curr.range] = curr.percentage;
//                                 return acc;
//                             }, {}) || {},
//                             locations: influencer.youtube.demographics?.topCountries?.reduce((acc, curr) => {
//                                 acc[curr.country] = curr.percentage;
//                                 return acc;
//                             }, {}) || {}
//                         }
//                     } : null
//                 };
//             }
//         }

//         console.log('Sending final profile data:', profileData);
//         res.json(profileData);
//     } catch (error) {
//         console.error('Error in getUserProfile:', error);
//         res.status(500).json({ message: 'Error fetching user profile' });
//     }
// };

// module.exports = {
//     registerBrand,
//     registerInfluencer,
//     loginUser,
//     verifyEmailAndProceed,
//     verifyEmail,
//     resendVerificationCode,
//     register,
//     login,
//     getProfile,
//     updateProfile,
//     changePassword,
//     updateSocialMediaData,
//     updateAnalytics,
//     forgotPassword,
//     resetPassword,
//     searchUsers,
//     getCampaignStats,
//     getUserProfile,
// };

const User = require("../models/User");
const Brand = require("../models/Brand");
const Influencer = require("../models/Influencer");
const Campaign = require("../models/Campaign");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/email");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Content = require("../models/Content");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerBrand = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      companyName,
      website,
      industry,
      description,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const user = await User.create({
      name,
      email,
      password,
      role: "brand",
      verificationCode,
      verificationExpiry,
      isVerified: false,
    });

    if (user) {
      const brand = await Brand.create({
        brand: user._id,
        companyName,
        website,
        industry,
        description,
      });

      // Try to send verification email
      const emailSent = await sendVerificationEmail(email, verificationCode);

      res.status(201).json({
        message:
          "Registration successful. Please check your email for verification code.",
        verificationCode:
          process.env.NODE_ENV === "development" ? verificationCode : undefined,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: brand.companyName,
        emailSent,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message || "Registration failed" });
  }
};

const registerInfluencer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Create new user with verification details
    user = new User({
      name,
      email,
      password, // Password will be hashed by the pre-save middleware
      role: "influencer",
      verificationCode,
      verificationExpiry,
      isVerified: false,
    });

    // Save user - this will trigger the password hashing middleware
    await user.save();

    // Create basic influencer profile
    const influencer = new Influencer({
      user: user._id,
      isProfileComplete: false,
    });

    await influencer.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message:
        "Registration successful. Please verify your email before connecting your YouTube channel.",
      verificationCode:
        process.env.NODE_ENV === "development" ? verificationCode : undefined,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailSent,
      isVerified: false,
      isProfileComplete: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Add debug logging
    console.log("Login attempt for email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.log("User not verified:", email);
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in" });
    }

    const isMatch = await user.matchPassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    let additionalData = {};
    if (user.role === "brand") {
      const brand = await Brand.findOne({ brand: user._id });
      additionalData = {
        companyName: brand?.companyName,
        industry: brand?.industry,
      };
    } else {
      const influencer = await Influencer.findOne({ user: user._id });
      additionalData = {
        bio: influencer?.bio,
        youtube: influencer?.youtube,
      };
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      ...additionalData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Verify email and proceed to YouTube authorization
const verifyEmailAndProceed = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.verificationExpiry < Date.now()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpiry = undefined;
    await user.save();

    // Generate token for YouTube authorization
    const token = generateToken(user._id);

    res.json({
      message:
        "Email verified successfully. Please proceed with YouTube channel connection.",
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: true,
      nextStep: "youtube-auth",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.verificationExpiry < Date.now()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpiry = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: "Email verified successfully",
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Resend verification code
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);

    // In development, return the verification code
    if (process.env.NODE_ENV === "development") {
      return res.json({
        message: "Verification code sent successfully",
        verificationCode: verificationCode,
        emailSent: emailSent,
      });
    }

    // In production, don't return the verification code
    res.json({
      message: emailSent
        ? "Verification code sent successfully"
        : "Verification code generated but email sending failed. Please try again or contact support.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Register a new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create new user
    user = new User({
      email,
      password,
      role,
      verificationCode,
      verificationCodeExpires,
      isVerified: false,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification code.",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email before logging in",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Get additional data based on role
    let additionalData = {};
    if (user.role === "brand") {
      const brand = await Brand.findOne({ brand: user._id });
      additionalData = {
        companyName: brand?.companyName,
        industry: brand?.industry,
      };
    } else if (user.role === "influencer") {
      const influencer = await Influencer.findOne({ user: user._id });
      additionalData = {
        bio: influencer?.bio,
        youtube: influencer?.youtube,
        isProfileComplete: influencer?.isProfileComplete,
      };
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token,
      ...additionalData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login. Please try again.",
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    // Get user from database
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get influencer data if user is an influencer
    let profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    if (user.role === "influencer") {
      const influencer = await Influencer.findOne({ user: user._id });
      if (influencer) {
        profileData = {
          ...profileData,
          bio: influencer.bio,
          categories: influencer.categories,
          socialLinks: influencer.socialLinks,
          completedCampaigns: influencer.completedCampaigns || 0,
          profilePictureUrl: influencer.profilePictureUrl,
          youtube: influencer.youtube
            ? {
                channelId: influencer.youtube.channelId,
                channelName: influencer.youtube.channelName,
                subscriberCount: influencer.youtube.subscriberCount,
                totalViews: influencer.youtube.totalViews,
                averageViews: influencer.youtube.averageViews,
                engagementRate: influencer.youtube.engagementRate,
                demographics: influencer.youtube.demographics,
                analytics: influencer.youtube.analytics,
                contentStats: influencer.youtube.contentStats,
                lastUpdated: influencer.youtube.lastUpdated,
              }
            : null,
        };
      }
    } else if (user.role === "brand") {
      const brand = await Brand.findOne({ brand: user._id });
      if (brand) {
        profileData = {
          ...profileData,
          companyName: brand.companyName,
          website: brand.website,
          industry: brand.industry,
          description: brand.description,
          logoUrl: brand.logoUrl,
          location: brand.location,
          phone: brand.phone,
          preferredCategories: brand.preferredCategories || [],
          activeCampaigns: brand.activeCampaigns || 0,
          completedCampaigns: brand.completedCampaigns || 0,
          totalInfluencers: brand.totalInfluencers || 0,
          totalReach: brand.totalReach || 0,
        };
      }
    }

    res.json(profileData);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile data" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, categories, socialLinks } = req.body;

    // Get user from database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    if (name) user.name = name;

    await user.save();

    // If user is an influencer, update influencer profile
    if (user.role === "influencer") {
      const influencer = await Influencer.findOne({ user: user._id });
      if (!influencer) {
        return res
          .status(404)
          .json({ message: "Influencer profile not found" });
      }

      if (bio) influencer.bio = bio;
      if (categories) influencer.categories = categories;
      if (socialLinks) influencer.socialLinks = socialLinks;

      await influencer.save();
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update social media data
// @route   PUT /api/users/social-media
// @access  Private
const updateSocialMediaData = asyncHandler(async (req, res) => {
  const { platform, data } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Initialize socialMedia object if it doesn't exist
  if (!user.socialMedia) {
    user.socialMedia = {};
  }

  // Update platform-specific data
  user.socialMedia[platform] = {
    ...user.socialMedia[platform],
    ...data,
    lastUpdated: new Date(),
  };

  // Calculate engagement rates
  if (platform === "youtube") {
    const totalEngagement =
      user.socialMedia.youtube.recentVideos?.reduce(
        (sum, video) => sum + (video.views || 0),
        0
      ) || 0;
    const subscribers = user.socialMedia.youtube.subscribers || 0;
    user.analytics.averageEngagementRate =
      subscribers > 0 ? (totalEngagement / subscribers) * 100 : 0;
  } else if (platform === "instagram") {
    const totalEngagement =
      user.socialMedia.instagram.recentPosts?.reduce(
        (sum, post) => sum + (post.likes || 0) + (post.comments || 0),
        0
      ) || 0;
    const followers = user.socialMedia.instagram.followers || 0;
    user.analytics.averageEngagementRate =
      followers > 0 ? (totalEngagement / followers) * 100 : 0;
  } else if (platform === "tiktok") {
    const totalEngagement =
      user.socialMedia.tiktok.recentVideos?.reduce(
        (sum, video) =>
          sum +
          (video.likes || 0) +
          (video.comments || 0) +
          (video.shares || 0),
        0
      ) || 0;
    const followers = user.socialMedia.tiktok.followers || 0;
    user.analytics.averageEngagementRate =
      followers > 0 ? (totalEngagement / followers) * 100 : 0;
  }

  const updatedUser = await user.save();
  res.json(updatedUser);
});

// @desc    Update analytics data
// @route   PUT /api/users/analytics
// @access  Private
const updateAnalytics = asyncHandler(async (req, res) => {
  const { monthlyStats, topPerformingContent } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Initialize analytics object if it doesn't exist
  if (!user.analytics) {
    user.analytics = {
      averageEngagementRate: 0,
      topPerformingContent: [],
      monthlyStats: [],
    };
  }

  // Update monthly stats
  if (monthlyStats) {
    user.analytics.monthlyStats = monthlyStats;
  }

  // Update top performing content
  if (topPerformingContent) {
    user.analytics.topPerformingContent = topPerformingContent;
  }

  const updatedUser = await user.save();
  res.json(updatedUser);
});

// @desc    Handle forgot password request
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No account found with that email address");
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

  await user.save();

  try {
    await sendPasswordResetEmail(email, resetToken);
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(500);
    throw new Error("Error sending password reset email");
  }
});

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  // Set new password
  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
});

// @desc    Search users (brands and creators)
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Create a case-insensitive regex pattern for the search query
    const searchPattern = new RegExp(query, "i");

    // Search for users (both brands and creators)
    const users = await User.find({
      $or: [{ name: searchPattern }, { email: searchPattern }],
    })
      .select("name email role profilePictureUrl")
      .limit(10);

    // Get additional info for brands and creators
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const userData = user.toObject();

        if (user.role === "brand") {
          const brandInfo = await Brand.findOne({ brand: user._id }).select(
            "companyName industry"
          );
          if (brandInfo) {
            userData.companyName = brandInfo.companyName;
            userData.industry = brandInfo.industry;
          }
        } else if (user.role === "influencer") {
          const influencerInfo = await Influencer.findOne({
            user: user._id,
          }).select("bio categories");
          if (influencerInfo) {
            userData.bio = influencerInfo.bio;
            userData.categories = influencerInfo.categories;
          }
        }

        return userData;
      })
    );

    res.json(enrichedUsers);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error performing search" });
  }
};

// @desc    Get user campaign statistics
// @route   GET /api/users/campaign-stats/:userId
// @access  Private
const getCampaignStats = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  console.log("Fetching campaign stats for userId:", userId);

  try {
    const user = await User.findById(userId);
    console.log("Found user:", user ? "Yes" : "No");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all campaigns where the user is either the brand or an accepted/completed influencer
    console.log("Searching for campaigns");

    let campaignQuery;
    if (user.role === "brand") {
      campaignQuery = { brand: userId };
    } else {
      campaignQuery = {
        $or: [
          {
            applications: {
              $elemMatch: {
                influencer: userId,
                status: { $in: ["accepted", "completed"] },
              },
            },
          },
          {
            invitations: {
              $elemMatch: {
                influencer: userId,
                status: "accepted",
              },
            },
          },
        ],
      };
    }

    const campaigns = await Campaign.find(campaignQuery);

    console.log("Found campaigns:", {
      total: campaigns.length,
      campaignIds: campaigns.map((c) => c._id),
      statuses: campaigns.map((c) => c.status),
    });

    // Calculate statistics
    const stats = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
      completedCampaigns: campaigns.filter((c) => c.status === "completed")
        .length,
      pendingCampaigns: campaigns.filter((c) => c.status === "pending").length,
      cancelledCampaigns: campaigns.filter((c) => c.status === "cancelled")
        .length,
      totalEarnings: campaigns.reduce((sum, campaign) => {
        if (user.role === "influencer") {
          // For influencers, use their specific compensation
          if (campaign.status === "completed") {
            const influencerApplication = campaign.applications.find(
              (app) =>
                app.influencer.toString() === userId &&
                app.status === "completed"
            );
            return (
              sum +
              (influencerApplication?.compensation || campaign.budget || 0)
            );
          }
        } else {
          // For brands, use the campaign budget
          return sum + (campaign.budget || 0);
        }
        return sum;
      }, 0),
      successRate:
        campaigns.length > 0
          ? (
              (campaigns.filter((c) => c.status === "completed").length /
                campaigns.length) *
              100
            ).toFixed(1)
          : 0,
    };

    console.log("Calculated campaign stats:", stats);

    // Calculate metrics
    const metrics = {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      averageEngagement: 0,
    };

    // For completed campaigns, get content metrics
    const completedCampaigns = campaigns.filter(
      (c) => c.status === "completed"
    );
    for (const campaign of completedCampaigns) {
      const contentQuery =
        user.role === "influencer"
          ? { campaign: campaign._id, creator: userId, status: "approved" }
          : { campaign: campaign._id, status: "approved" };

      const campaignContent = await Content.find(contentQuery);

      campaignContent.forEach((content) => {
        if (content.metrics) {
          metrics.totalViews += content.metrics.views || 0;
          metrics.totalLikes += content.metrics.likes || 0;
          metrics.totalComments += content.metrics.comments || 0;
          metrics.totalShares += content.metrics.shares || 0;
        }
      });
    }

    // Calculate average engagement if there are views
    if (metrics.totalViews > 0) {
      metrics.averageEngagement = (
        ((metrics.totalLikes + metrics.totalComments + metrics.totalShares) /
          metrics.totalViews) *
        100
      ).toFixed(2);
    }

    // Get recent campaigns
    const recentCampaigns = campaigns
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((c) => ({
        id: c._id,
        title: c.title,
        status: c.status,
        platform: c.platform,
        startDate: c.startDate,
        endDate: c.endDate,
      }));

    // Calculate campaigns by category
    const campaignsByCategory = {};
    campaigns.forEach((campaign) => {
      if (campaign.category) {
        campaignsByCategory[campaign.category] =
          (campaignsByCategory[campaign.category] || 0) + 1;
      }
    });

    // Calculate campaigns by platform
    const campaignsByPlatform = {
      youtube: campaigns.filter((c) => c.platform === "youtube").length,
      instagram: campaigns.filter((c) => c.platform === "instagram").length,
      tiktok: campaigns.filter((c) => c.platform === "tiktok").length,
    };

    const finalStats = {
      ...stats,
      campaignsByCategory,
      campaignsByPlatform,
      recentCampaigns,
      metrics,
    };

    console.log(
      "Sending final stats to client:",
      JSON.stringify(finalStats, null, 2)
    );
    res.json(finalStats);
  } catch (error) {
    console.error("Error calculating campaign stats:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Error calculating campaign statistics" });
  }
});

const calculateBrandCampaignStats = async (userId) => {
  // Get all campaigns for the brand
  const campaigns = await Campaign.find({ brand: userId });

  // Calculate basic statistics
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === "active").length,
    completedCampaigns: campaigns.filter((c) => c.status === "completed")
      .length,
    pendingCampaigns: campaigns.filter((c) => c.status === "pending").length,
    totalInfluencers: 0,
    totalEarnings: campaigns.reduce(
      (sum, campaign) => sum + (campaign.budget || 0),
      0
    ),
    successRate:
      campaigns.length > 0
        ? (
            (campaigns.filter((c) => c.status === "completed").length /
              campaigns.length) *
            100
          ).toFixed(1)
        : 0,
  };

  // Calculate total influencers across all campaigns
  for (const campaign of campaigns) {
    const acceptedApplications = campaign.applications.filter(
      (app) => app.status === "accepted"
    );
    stats.totalInfluencers += acceptedApplications.length;
  }

  return stats;
};

// Update getUserProfile to include campaign stats
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Getting user profile for userId:", userId);

    const user = await User.findById(userId).select(
      "-password -verificationCode -verificationExpiry"
    );
    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePictureUrl: user.profilePictureUrl,
    };

    if (user.role === "brand") {
      console.log("Fetching brand data");
      const brand = await Brand.findOne({ brand: user._id });
      if (brand) {
        // Calculate campaign statistics
        const campaignStats = await calculateBrandCampaignStats(user._id);

        profileData = {
          ...profileData,
          companyName: brand.companyName,
          website: brand.website,
          industry: brand.industry,
          description: brand.description,
          logoUrl: brand.logoUrl,
          location: brand.location,
          phone: brand.phone,
          preferredCategories: brand.preferredCategories || [],
          campaignStats: {
            ...campaignStats,
            // Use stored stats for historical data that can't be calculated in real-time
            totalReach: brand.campaignStats?.totalReach || 0,
          },
        };
      }
    } else {
      console.log("Fetching influencer data");
      const influencer = await Influencer.findOne({ user: user._id });
      if (influencer) {
        // Calculate campaign statistics for influencer
        const campaignStats = {
          totalCampaigns: 0,
          activeCampaigns: 0,
          completedCampaigns: 0,
          pendingCampaigns: 0,
          totalEarnings: 0,
          successRate: 0,
          metrics: {
            reach: 0,
            engagement: 0,
            conversion: 0,
          },
        };

        // Get all campaigns for this influencer
        const campaigns = await Campaign.find({ influencer: influencer._id });
        campaignStats.totalCampaigns = campaigns.length;
        campaignStats.activeCampaigns = campaigns.filter(
          (c) => c.status === "active"
        ).length;
        campaignStats.completedCampaigns = campaigns.filter(
          (c) => c.status === "completed"
        ).length;
        campaignStats.pendingCampaigns = campaigns.filter(
          (c) => c.status === "pending"
        ).length;

        // Calculate total earnings
        campaignStats.totalEarnings = campaigns.reduce(
          (total, campaign) => total + (campaign.payment?.amount || 0),
          0
        );

        // Calculate success rate
        if (campaignStats.totalCampaigns > 0) {
          campaignStats.successRate =
            (campaignStats.completedCampaigns / campaignStats.totalCampaigns) *
            100;
        }

        profileData = {
          ...profileData,
          bio: influencer.bio,
          categories: influencer.categories,
          socialMedia: influencer.socialMedia,
          languages: influencer.languages,
          location: influencer.location,
          rating: influencer.rating,
          totalReviews: influencer.totalReviews,
          campaignStats: {
            ...campaignStats,
            averageRating: influencer.rating || 0,
          },
          youtube: influencer.youtube
            ? {
                channelId: influencer.youtube.channelId,
                channelName: influencer.youtube.channelName,
                subscriberCount: influencer.youtube.subscriberCount || 0,
                totalViews: influencer.youtube.totalViews || 0,
                engagementRate: influencer.youtube.engagementRate || 0,
                analytics: {
                  monthlyStats: [
                    {
                      month: "Last 30 Days",
                      views: influencer.youtube.analytics?.viewsLast30Days || 0,
                      engagement:
                        influencer.youtube.analytics
                          ?.engagementRateLast30Days || 0,
                    },
                    {
                      month: "Last 90 Days",
                      views: influencer.youtube.analytics?.viewsLast90Days || 0,
                      engagement:
                        influencer.youtube.analytics
                          ?.engagementRateLast90Days || 0,
                    },
                  ],
                },
                demographics: {
                  ageGroups:
                    influencer.youtube.demographics?.ageGroups?.reduce(
                      (acc, curr) => {
                        acc[curr.range] = curr.percentage;
                        return acc;
                      },
                      {}
                    ) || {},
                  locations:
                    influencer.youtube.demographics?.topCountries?.reduce(
                      (acc, curr) => {
                        acc[curr.country] = curr.percentage;
                        return acc;
                      },
                      {}
                    ) || {},
                },
              }
            : null,
        };
      }
    }

    console.log("Sending final profile data:", profileData);
    res.json(profileData);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

module.exports = {
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
  getCampaignStats,
  getUserProfile,
};
