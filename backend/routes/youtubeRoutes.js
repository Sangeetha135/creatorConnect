const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const Influencer = require('../models/Influencer');
const protect = require('../middleware/auth');

require('dotenv').config();

// Debug logging with actual values
console.log('Environment Variables Actual Values:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('REDIRECT_URI:', process.env.REDIRECT_URI);

// Debug log for environment variables
console.log('YouTube OAuth Configuration:', {
    clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set',
    redirectUri: process.env.REDIRECT_URI
});

// Initialize OAuth2 client with the correct redirect URI
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI || 'http://localhost:5000/api/youtube/oauth2callback'
);

// Define scopes for YouTube access
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/youtube.force-ssl'
];

// Test route to verify the router is working
router.get('/test', (req, res) => {
    res.json({ message: 'YouTube routes are working' });
});

// Route to get YouTube OAuth URL (protected)
router.get('/auth-url', protect, async (req, res) => {
    try {
        console.log('Generating auth URL...');
        console.log('Environment variables:', {
            clientId: process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing',
            redirectUri: process.env.REDIRECT_URI
        });

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            console.error('Missing OAuth credentials');
            return res.status(500).json({
                message: 'Server configuration error: Missing OAuth credentials'
            });
        }

        // Use the authenticated user's ID as state
        const state = req.user._id.toString();
        console.log('User state:', state);

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            include_granted_scopes: true,
            prompt: 'consent',
            state: state
        });

        console.log('Generated auth URL:', authUrl);
        res.json({ authUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({
            message: 'Failed to initiate YouTube connection. Please try again.',
            details: error.message
        });
    }
});

// OAuth callback route
router.get('/oauth2callback', async (req, res) => {
    const { code, error, state } = req.query;

    console.log('Received OAuth callback:', { code: !!code, error, state }); // Debug log

    if (error) {
        console.error('OAuth error:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/register/influencer?error=auth_error`);
    }

    if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/register/influencer?error=missing_code`);
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });

        const youtubeAnalytics = google.youtubeAnalytics({
            version: 'v2',
            auth: oauth2Client
        });

        // Get basic channel info
        const channelResponse = await youtube.channels.list({
            part: 'snippet,statistics,contentDetails',
            mine: true
        });

        if (!channelResponse.data.items?.length) {
            throw new Error('No YouTube channel found');
        }

        const channel = channelResponse.data.items[0];
        const channelId = channel.id;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

        // Get basic channel statistics
        const channelStats = {
            channelId: channel.id,
            channelName: channel.snippet.title,
            description: channel.snippet.description || '',
            customUrl: channel.snippet.customUrl || '',
            thumbnails: channel.snippet.thumbnails || {},
            country: channel.snippet.country || '',
            subscriberCount: parseInt(channel.statistics.subscriberCount || 0),
            totalViews: parseInt(channel.statistics.viewCount || 0),
            totalVideos: parseInt(channel.statistics.videoCount || 0),
            hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount || false,
            averageViews: parseInt(channel.statistics.viewCount || 0) / (parseInt(channel.statistics.videoCount || 1) || 1),
            publishedAt: channel.snippet.publishedAt ? new Date(channel.snippet.publishedAt) : new Date(),
            lastUpdated: new Date()
        };

        // Get analytics data
        const [
            basicMetrics,
            demographicsData,
            topVideos,
            geographicData,
            subscriberGrowth
        ] = await Promise.all([
            youtubeAnalytics.reports.query({
                ids: `channel==${channelId}`,
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0],
                metrics: 'estimatedMinutesWatched,averageViewDuration,averageViewPercentage,views'
            }).catch(err => ({ data: { rows: [[0, 0, 0, 0]] } })), // Default values if error
            youtubeAnalytics.reports.query({
                ids: `channel==${channelId}`,
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0],
                dimensions: 'ageGroup,gender',
                metrics: 'viewerPercentage'
            }).catch(err => ({ data: { rows: [] } })), // Empty array if error
            youtube.search.list({
                part: 'snippet',
                channelId: channelId,
                order: 'viewCount',
                type: 'video',
                maxResults: 5
            }).catch(err => ({ data: { items: [] } })), // Empty array if error
            youtubeAnalytics.reports.query({
                ids: `channel==${channelId}`,
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0],
                dimensions: 'country',
                metrics: 'views',
                sort: '-views',
                maxResults: 10
            }).catch(err => ({ data: { rows: [], totals: [0] } })), // Default values if error
            youtubeAnalytics.reports.query({
                ids: `channel==${channelId}`,
                startDate: ninetyDaysAgo.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0],
                metrics: 'subscribersGained'
            }).catch(err => ({ data: { rows: [[0]] } })) // Default value if error
        ]);

        // Process demographics data with null checks
        const ageGroups = [];
        const genderDistribution = { male: 0, female: 0, other: 0 };
        if (demographicsData?.data?.rows) {
            demographicsData.data.rows.forEach(row => {
                const [age, gender, percentage] = row;
                if (gender === 'male') genderDistribution.male += parseFloat(percentage) || 0;
                else if (gender === 'female') genderDistribution.female += parseFloat(percentage) || 0;
                else genderDistribution.other += parseFloat(percentage) || 0;

                const existingAge = ageGroups.find(g => g.range === age);
                if (existingAge) {
                    existingAge.percentage += parseFloat(percentage) || 0;
                } else {
                    ageGroups.push({ range: age, percentage: parseFloat(percentage) || 0 });
                }
            });
        }

        // Process geographic data with null checks
        const topCountries = [];
        try {
            if (geographicData?.data?.rows && Array.isArray(geographicData.data.rows) && geographicData.data.rows.length > 0) {
                geographicData.data.rows.forEach(row => {
                    if (row && Array.isArray(row) && row.length >= 2) {
                        const views = parseFloat(row[1]) || 0;
                        const total = parseFloat(geographicData.data.totals?.[0]) || 1;
                        topCountries.push({
                            country: row[0] || 'Unknown',
                            percentage: ((views / total) * 100).toFixed(2)
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error processing geographic data:', error);
        }

        // Get video details for top videos with null checks
        let topPerformingVideos = [];
        try {
            const videoIds = [];
            if (topVideos?.data?.items && Array.isArray(topVideos.data.items)) {
                topVideos.data.items.forEach(item => {
                    if (item?.id?.videoId) {
                        videoIds.push(item.id.videoId);
                    }
                });
            }

            let videoStats = { data: { items: [] } };
            if (videoIds.length > 0) {
                try {
                    videoStats = await youtube.videos.list({
                        part: 'statistics',
                        id: videoIds.join(',')
                    }).catch(err => {
                        console.error('Error fetching video statistics:', err);
                        return { data: { items: [] } };
                    });
                } catch (error) {
                    console.error('Error in video stats request:', error);
                }
            }

            if (topVideos?.data?.items && Array.isArray(topVideos.data.items)) {
                topPerformingVideos = topVideos.data.items.map((video, index) => {
                    try {
                        const stats = videoStats.data.items?.[index]?.statistics || {};
                        return {
                            videoId: video.id?.videoId || '',
                            title: video.snippet?.title || 'Untitled',
                            views: parseInt(stats.viewCount || 0),
                            likes: parseInt(stats.likeCount || 0),
                            comments: parseInt(stats.commentCount || 0),
                            publishedAt: video.snippet?.publishedAt ? new Date(video.snippet.publishedAt) : new Date()
                        };
                    } catch (error) {
                        console.error('Error processing video data:', error);
                        return null;
                    }
                }).filter(video => video !== null);
            }
        } catch (error) {
            console.error('Error processing video data:', error);
        }

        // Process analytics data with null checks
        const analyticsData = {
            viewsLast30Days: 0,
            viewsLast90Days: 0,
            subscribersGainedLast30Days: 0,
            subscribersGainedLast90Days: 0,
            averageViewDuration: 0,
            averageWatchTime: 0,
            engagementRateLast30Days: 0
        };

        try {
            if (basicMetrics?.data?.rows?.[0]) {
                const [watchTime, viewDuration, viewPercentage, views] = basicMetrics.data.rows[0].map(val => parseFloat(val) || 0);
                analyticsData.viewsLast30Days = views;
                analyticsData.viewsLast90Days = views * 3;
                analyticsData.averageViewDuration = viewDuration;
                analyticsData.averageWatchTime = views > 0 ? watchTime / views : 0;
                analyticsData.engagementRateLast30Days = viewPercentage;
            }

            if (subscriberGrowth?.data?.rows?.[0]?.[0]) {
                const subscribersGained = parseFloat(subscriberGrowth.data.rows[0][0]) || 0;
                analyticsData.subscribersGainedLast90Days = subscribersGained;
                analyticsData.subscribersGainedLast30Days = subscribersGained / 3;
            }
        } catch (error) {
            console.error('Error processing analytics data:', error);
        }

        const youtubeData = {
            ...channelStats,
            demographics: {
                ageGroups,
                genderDistribution,
                topCountries,
                topLanguages: [{ language: channel.snippet?.defaultLanguage || 'en', percentage: 100 }]
            },
            analytics: {
                ...analyticsData,
                topPerformingVideos,
                uploadFrequency: channelStats.totalVideos / 30,
                categoryPerformance: [{
                    category: channel.snippet?.categoryId || 'uncategorized',
                    averageViews: channelStats.averageViews,
                    engagementRate: analyticsData.engagementRateLast30Days
                }]
            },
            contentStats: {
                totalVideos: channelStats.totalVideos,
                averageVideoLength: 0,
                uploadConsistency: 85,
                mostPopularUploadDays: [
                    { day: 'Monday', percentage: 20 },
                    { day: 'Wednesday', percentage: 30 },
                    { day: 'Friday', percentage: 25 }
                ],
                mostPopularVideoTypes: [
                    { type: 'Tutorial', percentage: 40 },
                    { type: 'Vlog', percentage: 30 },
                    { type: 'Review', percentage: 30 }
                ]
            },
            oauthTokens: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiry: new Date(tokens.expiry_date),
                scope: tokens.scope
            }
        };

        // Find influencer by user ID from state
        const influencer = await Influencer.findOne({ user: state });
        if (!influencer) {
            throw new Error('Influencer not found');
        }

        // Update influencer with YouTube data
        influencer.youtube = youtubeData;
        await influencer.save();

        const encodedData = encodeURIComponent(JSON.stringify(youtubeData));
        res.redirect(`${process.env.FRONTEND_URL}/register/influencer?youtubeData=${encodedData}&step=3`);
    } catch (error) {
        console.error('YouTube API Error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/register/influencer?error=server_error`);
    }
});

// Add a route to refresh YouTube data (protected)
router.post('/refresh-data', protect, async (req, res) => {
    try {
        const influencer = await Influencer.findOne({ user: req.user._id });

        if (!influencer || !influencer.youtube.oauthTokens) {
            return res.status(404).json({ message: 'Influencer or OAuth tokens not found' });
        }

        // Set up OAuth client with stored tokens
        oauth2Client.setCredentials({
            access_token: influencer.youtube.oauthTokens.accessToken,
            refresh_token: influencer.youtube.oauthTokens.refreshToken,
            expiry_date: influencer.youtube.oauthTokens.tokenExpiry
        });

        // Refresh the token if needed
        if (new Date() >= new Date(influencer.youtube.oauthTokens.tokenExpiry)) {
            const { tokens } = await oauth2Client.refreshAccessToken();
            influencer.youtube.oauthTokens = {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiry: new Date(tokens.expiry_date),
                scope: tokens.scope
            };
        }

        // Initialize API clients
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });

        const channelId = influencer.youtube.channelId;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

        // Fetch all required data in parallel
        const [
            channelResponse,
            basicMetrics,
            demographicsData,
            topVideos,
            geographicData,
            subscriberGrowth
        ] = await Promise.all([
            youtube.channels.list({
                part: 'snippet,statistics,contentDetails',
                id: channelId
            }),
            youtubeAnalytics.reports.query({
                ids: `channel==${channelId}`,
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0],
                metrics: 'estimatedMinutesWatched,averageViewDuration,averageViewPercentage,views'
            }),
            youtubeAnalytics.reports.query({
                ids: `channel==${channelId}`,
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0],
                dimensions: 'ageGroup,gender',
                metrics: 'viewerPercentage'
            }),
            youtube.search.list({
                part: 'snippet',
                channelId: channelId,
                order: 'viewCount',
                type: 'video',
                maxResults: 5
            }),
            youtubeAnalytics.reports.query({
                ids: `channel==${channelId}`,
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0],
                dimensions: 'country',
                metrics: 'views',
                sort: '-views',
                maxResults: 10
            }),
            youtubeAnalytics.reports.query({
                ids: `channel==${channelId}`,
                startDate: ninetyDaysAgo.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0],
                metrics: 'subscribersGained'
            })
        ]);

        const channel = channelResponse.data.items[0];

        // Process demographics data
        const ageGroups = [];
        const genderDistribution = { male: 0, female: 0, other: 0 };
        if (demographicsData.data.rows) {
            demographicsData.data.rows.forEach(row => {
                const [age, gender, percentage] = row;
                if (gender === 'male') genderDistribution.male += parseFloat(percentage);
                else if (gender === 'female') genderDistribution.female += parseFloat(percentage);
                else genderDistribution.other += parseFloat(percentage);

                const existingAge = ageGroups.find(g => g.range === age);
                if (existingAge) {
                    existingAge.percentage += parseFloat(percentage);
                } else {
                    ageGroups.push({ range: age, percentage: parseFloat(percentage) });
                }
            });
        }

        // Process geographic data
        const topCountries = geographicData.data.rows?.map(row => ({
            country: row[0],
            percentage: (row[1] / geographicData.data.totals[0] * 100).toFixed(2)
        })) || [];

        // Get video details for top videos
        const videoIds = topVideos.data.items.map(item => item.id.videoId);
        const videoStats = await youtube.videos.list({
            part: 'statistics',
            id: videoIds.join(',')
        });

        // Combine video data
        const topPerformingVideos = topVideos.data.items.map((video, index) => ({
            videoId: video.id.videoId,
            title: video.snippet.title,
            views: parseInt(videoStats.data.items[index].statistics.viewCount),
            likes: parseInt(videoStats.data.items[index].statistics.likeCount),
            comments: parseInt(videoStats.data.items[index].statistics.commentCount),
            publishedAt: new Date(video.snippet.publishedAt)
        }));

        // Update influencer data
        influencer.youtube = {
            ...influencer.youtube,
            channelName: channel.snippet.title,
            subscriberCount: parseInt(channel.statistics.subscriberCount),
            totalViews: parseInt(channel.statistics.viewCount),
            averageViews: parseInt(channel.statistics.viewCount) / (parseInt(channel.statistics.videoCount) || 1),
            demographics: {
                ageGroups,
                genderDistribution,
                topCountries,
                topLanguages: [{ language: channel.snippet.defaultLanguage || 'en', percentage: 100 }]
            },
            analytics: {
                viewsLast30Days: parseInt(basicMetrics.data.rows[0][3]),
                viewsLast90Days: parseInt(basicMetrics.data.rows[0][3]) * 3,
                subscribersGainedLast30Days: parseInt(subscriberGrowth.data.rows[0][0] / 3),
                subscribersGainedLast90Days: parseInt(subscriberGrowth.data.rows[0][0]),
                averageViewDuration: parseInt(basicMetrics.data.rows[0][1]),
                averageWatchTime: parseInt(basicMetrics.data.rows[0][0] / basicMetrics.data.rows[0][3]),
                engagementRateLast30Days: parseFloat(basicMetrics.data.rows[0][2]),
                topPerformingVideos,
                uploadFrequency: parseInt(channel.statistics.videoCount) / 30,
                categoryPerformance: [{
                    category: channel.snippet.categoryId,
                    averageViews: parseInt(channel.statistics.viewCount) / parseInt(channel.statistics.videoCount),
                    engagementRate: parseFloat(basicMetrics.data.rows[0][2])
                }]
            },
            contentStats: {
                totalVideos: parseInt(channel.statistics.videoCount),
                averageVideoLength: 0,
                uploadConsistency: 85,
                mostPopularUploadDays: [
                    { day: 'Monday', percentage: 20 },
                    { day: 'Wednesday', percentage: 30 },
                    { day: 'Friday', percentage: 25 }
                ],
                mostPopularVideoTypes: [
                    { type: 'Tutorial', percentage: 40 },
                    { type: 'Vlog', percentage: 30 },
                    { type: 'Review', percentage: 30 }
                ]
            },
            lastUpdated: new Date()
        };

        await influencer.save();
        res.json({ message: 'YouTube data updated successfully', data: influencer.youtube });
    } catch (error) {
        console.error('Error refreshing YouTube data:', error);
        res.status(500).json({ message: 'Failed to refresh YouTube data' });
    }
});

module.exports = router; 