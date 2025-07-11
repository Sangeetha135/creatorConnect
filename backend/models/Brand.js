const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    companyName: String,
    companyLogo: String,
    website: String,
    industry: String,
    description: String,
    campaignStats: {
        totalCampaigns: {
            type: Number,
            default: 0
        },
        activeCampaigns: {
            type: Number,
            default: 0
        },
        completedCampaigns: {
            type: Number,
            default: 0
        },
        totalInfluencers: {
            type: Number,
            default: 0
        },
        totalReach: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Brand', brandSchema);