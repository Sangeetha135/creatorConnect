const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'CONTENT_SUBMITTED',
            'CONTENT_APPROVED',
            'CONTENT_REJECTED',
            'CAMPAIGN_INVITATION',
            'INVITATION_ACCEPTED',
            'INVITATION_REJECTED',
            'APPLICATION_ACCEPTED',
            'APPLICATION_REJECTED',
            'CONTENT_APPROVED_CAMPAIGN_COMPLETED',
            'CAMPAIGN_COMPLETED',
            'CAMPAIGN_CONTENT_STAGE',
            'INVITATION_RESPONSE',
            'ALL_INVITATIONS_REJECTED'
        ]
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for querying notifications by recipient and read status
notificationSchema.index({ recipient: 1, read: 1 });
// Index for sorting by creation date
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 