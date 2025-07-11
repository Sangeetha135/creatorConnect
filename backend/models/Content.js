const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        alias: 'influencer'
    },
    deliverableType: {
        type: String,
        required: true,
        enum: ['video', 'reelShort', 'storyPost', 'blog']
    },
    platform: {
        type: String,
        required: true,
        enum: ['YouTube', 'Instagram', 'TikTok', 'Other']
    },
    urlType: {
        type: String,
        required: true,
        enum: ['youtube', 'googledrive', 'dropbox', 'onedrive', 'other']
    },
    contentUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    caption: {
        type: String
    },
    hashtags: [{
        type: String
    }],
    mentions: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected', 'published'],
        default: 'draft'
    },
    feedback: {
        type: String
    },
    metrics: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 }
    },
    publishedAt: {
        type: Date
    },
    submittedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual for backward compatibility
contentSchema.virtual('influencer').get(function() {
    return this.creator;
});

// Pre-save middleware to set submittedAt date when status changes to 'submitted'
contentSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'submitted' && !this.submittedAt) {
        this.submittedAt = new Date();
    }
    next();
});

// Indexes for efficient querying
contentSchema.index({ campaign: 1, status: 1 });
contentSchema.index({ creator: 1, createdAt: -1 });
contentSchema.index({ campaign: 1, createdAt: -1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content; 