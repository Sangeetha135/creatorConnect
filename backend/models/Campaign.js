const mongoose = require('mongoose');

const progressStepSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'active', 'completed'],
        default: 'pending'
    },
    completedAt: Date
});

const requirementsSchema = new mongoose.Schema({
    preferredCreatorCategory: String,
    locationTargeting: String,
    minSubscribers: {
        type: Number,
        default: 0
    },
    minViews: {
        type: Number,
        default: 0
    }
}, { _id: false });

const campaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    influencer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'upcoming', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    budget: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: requirementsSchema,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    deliverables: [{
        type: String
    }],
    category: {
        type: String,
        required: true,
        default: function() {
            return this.requirements?.preferredCreatorCategory || 'General';
        }
    },
    platform: {
        type: String,
        required: true,
        enum: ['youtube', 'instagram', 'tiktok'],
        default: function() {
            return this.platforms?.[0]?.toLowerCase() || 'youtube';
        }
    },
    metrics: {
        views: Number,
        likes: Number,
        comments: Number,
        shares: Number,
        engagement: Number
    },
    campaignType: {
        type: String,
        required: true,
        enum: ['Sponsored Post', 'Brand Ambassador', 'Product Review', 'Content Creation', 'Affiliate Marketing']
    },
    platforms: {
        type: [String],
        required: true,
        enum: ['YouTube', 'Instagram', 'TikTok']
    },
    numberOfDeliverables: {
        type: Number,
        required: true,
        min: 1
    },
    campaignGoals: {
        type: [String],
        required: true,
        enum: ['increaseReach', 'driveWebsiteTraffic', 'appDownloads', 'salesConversions']
    },
    contentGuidelines: {
        general: {
            guidelines: String,
            contentType: String,
            duration: String,
            quality: String,
            tone: String,
            specificRequirements: [String]
        },
        dosAndDonts: [String],
        hashtagsAndMentions: [String],
        references: [String]
    },
    kpis: String,
    contentSubmissionDeadline: {
        type: Date,
        required: true
    },
    campaignAssets: {
        type: String  // URL to uploaded file
    },
    applications: [{
        influencer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        invitationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Invitation'
        }
    }],
    progress: {
        creation: {
            status: {
                type: String,
                enum: ['pending', 'active', 'completed'],
                default: 'completed'
            },
            completedAt: {
                type: Date,
                default: Date.now
            }
        },
        invitations: {
            status: {
                type: String,
                enum: ['pending', 'active', 'completed'],
                default: 'active'
            },
            completedAt: Date
        },
        content: {
            status: {
                type: String,
                enum: ['pending', 'active', 'completed'],
                default: 'pending'
            },
            completedAt: Date
        },
        completion: {
            status: {
                type: String,
                enum: ['pending', 'active', 'completed'],
                default: 'pending'
            },
            completedAt: Date
        }
    },
    notificationFlags: {
        type: Map,
        of: Boolean,
        default: {}
    }
}, {
    timestamps: true
});

// Pre-save middleware to ensure progress is properly initialized
campaignSchema.pre('save', function(next) {
    if (!this.progress) {
        this.progress = {
            creation: {
                status: 'completed',
                completedAt: new Date()
            },
            invitations: {
                status: 'active',
                completedAt: null
            },
            content: {
                status: 'pending',
                completedAt: null
            },
            completion: {
                status: 'pending',
                completedAt: null
            }
        };
    }
    next();
});

module.exports = mongoose.model('Campaign', campaignSchema);