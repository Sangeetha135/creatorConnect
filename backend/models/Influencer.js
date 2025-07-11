const mongoose = require('mongoose');

const videoTypeSchema = new mongoose.Schema({
    type: String,
    percentage: Number
}, { _id: false });

const uploadDaySchema = new mongoose.Schema({
    day: String,
    percentage: Number
}, { _id: false });

const influencerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        default: ''
    },
    profilePicture: String,
    location: {
        type: String,
        default: ''
    },
    categories: [{
        type: String
    }],
    youtube: {
        channelId: String,
        channelName: String,
        description: String,
        customUrl: String,
        thumbnails: {
            default: { url: String, width: Number, height: Number },
            medium: { url: String, width: Number, height: Number },
            high: { url: String, width: Number, height: Number }
        },
        country: String,
        subscriberCount: Number,
        totalViews: Number,
        totalVideos: Number,
        hiddenSubscriberCount: Boolean,
        averageViews: Number,
        publishedAt: Date,
        engagementRate: Number,
        demographics: {
            ageGroups: [{
                range: String,
                percentage: Number
            }],
            genderDistribution: {
                male: Number,
                female: Number,
                other: Number
            },
            topCountries: [{
                country: String,
                percentage: Number
            }],
            topLanguages: [{
                language: String,
                percentage: Number
            }]
        },
        analytics: {
            viewsLast30Days: Number,
            viewsLast90Days: Number,
            subscribersGainedLast30Days: Number,
            subscribersGainedLast90Days: Number,
            averageViewDuration: Number,
            averageWatchTime: Number,
            engagementRateLast30Days: Number,
            topPerformingVideos: [{
                videoId: String,
                title: String,
                views: Number,
                likes: Number,
                comments: Number,
                publishedAt: Date
            }],
            uploadFrequency: Number,
            categoryPerformance: [{
                category: String,
                averageViews: Number,
                engagementRate: Number
            }]
        },
        contentStats: {
            totalVideos: Number,
            averageVideoLength: Number,
            uploadConsistency: Number,
            mostPopularUploadDays: [uploadDaySchema],
            mostPopularVideoTypes: [videoTypeSchema]
        },
        oauthTokens: {
            accessToken: String,
            refreshToken: String,
            tokenExpiry: Date,
            scope: String
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    campaignApplications: [
        {
            campaign: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Campaign'
            },
            status: {
                type: String,
                enum: ['applied', 'accepted', 'rejected'],
                default: 'applied'
            },
            appliedAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: Date
        }
    ],
    campaignInvitations: [
        {
            invitation: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Invitation'
            },
            campaign: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Campaign'
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            },
            receivedAt: {
                type: Date,
                default: Date.now
            },
            respondedAt: Date,
            compensation: Number
        }
    ],
    campaignStats: {
        totalCampaigns: {
            type: Number,
            default: 0
        },
        completedCampaigns: {
            type: Number,
            default: 0
        },
        totalEarnings: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Influencer', influencerSchema);