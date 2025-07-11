const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

// @desc    Get notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  let query = { recipient: req.user._id };

  // Filter notifications based on user role
  if (userRole === "brand") {
    // Brands should only see:
    // 1. When influencers accept/reject invitations
    // 2. When influencers submit content
    query.type = {
      $in: [
        "INVITATION_ACCEPTED",
        "INVITATION_REJECTED",
        "CONTENT_SUBMITTED",
        "APPLICATION_ACCEPTED",
        "APPLICATION_REJECTED",
        "ALL_INVITATIONS_REJECTED",
      ],
    };
  } else if (userRole === "influencer") {
    // Influencers should only see:
    // 1. New campaign invitations
    // 2. Content approval/rejection notifications
    // 3. Application status updates
    query.type = {
      $in: [
        "CAMPAIGN_INVITATION",
        "CONTENT_APPROVED",
        "CONTENT_REJECTED",
        "APPLICATION_ACCEPTED",
        "APPLICATION_REJECTED",
      ],
    };
  }

  const notifications = await Notification.find(query)
    .sort("-createdAt")
    .populate("data.campaignId", "title")
    .populate("data.brandId", "name companyName")
    .populate("data.influencerId", "name");

  res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  // Check if user owns this notification
  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this notification");
  }

  notification.read = true;
  await notification.save();

  res.json(notification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );

  res.json({ message: "All notifications marked as read" });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.json({ count });
});

// @desc    Create a test rejection notification
// @route   POST /api/notifications/test-rejection
// @access  Public (for testing)
const createTestRejectionNotification = asyncHandler(async (req, res) => {
  try {
    const { brandId } = req.body;

    if (!brandId) {
      res.status(400).json({ message: "Brand ID is required" });
      return;
    }

    console.log("Creating test rejection notification for brand:", brandId);

    const notification = await Notification.create({
      recipient: brandId,
      type: "ALL_INVITATIONS_REJECTED",
      title: "All Invitations Rejected (TEST)",
      message: `All invitations (2) for your campaign "Test Campaign" have been rejected. You may want to invite more influencers or review your campaign details.`,
      data: {
        campaignId: "6806ce7a86c3f56597e402f5", // Use a valid campaign ID
        stats: {
          total: 2,
          rejected: 2,
          accepted: 0,
          pending: 0,
        },
        rejectedCount: 2,
      },
    });

    console.log("Test notification created:", notification);
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating test notification:", error);
    res.status(500).json({ message: "Error creating test notification" });
  }
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createTestRejectionNotification,
};
