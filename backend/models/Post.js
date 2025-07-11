const mongoose = require('mongoose');

const mediaSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    media: [mediaSchema],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    linkedCampaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema); 