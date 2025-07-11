const Message = require('../models/Message');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');

// @desc    Get conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get all messages where user is either sender or receiver
    const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }]
    })
    .sort('-createdAt')
    .populate('sender', 'name email profileImage')
    .populate('receiver', 'name email profileImage')
    .populate('campaignId', 'title');

    // Group messages by conversation
    const conversations = messages.reduce((acc, message) => {
        const otherUser = message.sender._id.toString() === userId.toString() 
            ? message.receiver 
            : message.sender;
        
        const conversationKey = `${otherUser._id}-${message.campaignId._id}`;
        
        if (!acc[conversationKey]) {
            acc[conversationKey] = {
                otherUser,
                campaignId: message.campaignId._id,
                campaignTitle: message.campaignId.title,
                messages: [],
                lastMessage: null,
                unreadCount: 0
            };
        }
        
        acc[conversationKey].messages.push(message);
        
        // Update unread count
        if (!message.read && message.receiver._id.toString() === userId.toString()) {
            acc[conversationKey].unreadCount++;
        }
        
        // Update last message
        if (!acc[conversationKey].lastMessage || 
            message.createdAt > acc[conversationKey].lastMessage.createdAt) {
            acc[conversationKey].lastMessage = message;
        }
        
        return acc;
    }, {});

    res.json(Object.values(conversations));
});

// @desc    Get messages for a specific conversation
// @route   GET /api/messages/:campaignId/:userId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const { campaignId, userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
        campaignId,
        $or: [
            { sender: currentUserId, receiver: userId },
            { sender: userId, receiver: currentUserId }
        ]
    })
    .sort('createdAt')
    .populate('sender', 'name email profileImage')
    .populate('receiver', 'name email profileImage');

    // Mark messages as read
    await Message.updateMany(
        {
            campaignId,
            sender: userId,
            receiver: currentUserId,
            read: false
        },
        { read: true }
    );

    res.json(messages);
});

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { content, receiverId, campaignId } = req.body;
    const senderId = req.user._id;

    let messageData = {
        sender: senderId,
        receiver: receiverId,
        campaignId,
        content
    };

    // If there's a file uploaded
    if (req.file) {
        messageData.fileUrl = `/uploads/messages/${req.file.filename}`;
        messageData.fileName = req.file.originalname;
        messageData.fileType = req.file.mimetype;
    }

    const message = await Message.create(messageData);

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email profileImage')
        .populate('receiver', 'name email profileImage');

    res.status(201).json(populatedMessage);
});

// @desc    Get unread message counts
// @route   GET /api/messages/unread-counts
// @access  Private
const getUnreadCounts = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const messages = await Message.find({
        receiver: userId,
        read: false
    })
    .select('campaignId sender');

    const unreadCounts = messages.reduce((acc, message) => {
        const key = `${message.sender}-${message.campaignId}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    res.json(unreadCounts);
});

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    getUnreadCounts
}; 