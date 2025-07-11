const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    influencer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        required: true
    },
    responseMessage: {
        type: String
    },
    compensation: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Create indexes for faster querying
invitationSchema.index({ brand: 1, influencer: 1, campaign: 1 });
invitationSchema.index({ status: 1 });

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation; 