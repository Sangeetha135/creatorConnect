const asyncHandler = require("express-async-handler");
const Campaign = require("../models/Campaign");
const Content = require("../models/Content");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Influencer = require("../models/Influencer");
const { checkAndUpdateCampaignProgress } = require("./campaignController");

// @desc    Submit content for a campaign
// @route   POST /api/content/submit
// @access  Private/Influencer
const submitContent = asyncHandler(async (req, res) => {
  const { campaignId, contentUrl, urlType, description } = req.body;

  if (!contentUrl || !urlType || !description) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Start a session for transaction
  const session = await Campaign.startSession();
  session.startTransaction();

  try {
    // Find the campaign and populate brand details
    const campaign = await Campaign.findById(campaignId)
      .populate("brand", "name email")
      .session(session);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Check if user is authorized to submit content for this campaign
    const isAuthorized = campaign.applications.some(
      (app) =>
        app.influencer.toString() === req.user._id.toString() &&
        app.status === "accepted"
    );

    if (!isAuthorized) {
      throw new Error("Not authorized to submit content for this campaign");
    }

    // Create content submission
    const content = await Content.create(
      [
        {
          campaign: campaignId,
          creator: req.user._id,
          brand: campaign.brand._id,
          contentUrl,
          description,
          platform: "Other", // Default platform since we're using urlType
          deliverableType: "video", // Default type
          urlType, // Add the new urlType field
          status: "submitted",
          submittedAt: new Date(),
        },
      ],
      { session }
    );

    // Update campaign progress if needed
    if (campaign.progress.content.status !== "completed") {
      campaign.progress.content = {
        status: "active",
        completedAt: null,
      };
      await campaign.save({ session });
    }

    // Create notification for brand
    await Notification.create(
      [
        {
          recipient: campaign.brand._id,
          type: "CONTENT_SUBMITTED",
          title: "New Content Submission",
          message: `${req.user.name} has submitted content for campaign: ${campaign.title}`,
          data: {
            campaignId: campaign._id,
            contentId: content[0]._id,
            content: content[0],
            creatorId: req.user._id,
            urlType,
            contentUrl,
            campaignTitle: campaign.title,
            creatorName: req.user.name,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(content[0]);
  } catch (error) {
    console.error("Content submission error:", error);
    await session.abortTransaction();
    res.status(400);
    throw error;
  } finally {
    session.endSession();
  }
});

// @desc    Get content for a campaign
// @route   GET /api/content/campaign/:campaignId
// @access  Private
const getCampaignContent = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    res.status(404);
    throw new Error("Campaign not found");
  }

  // Check authorization
  if (
    req.user.role === "brand" &&
    campaign.brand.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to view this campaign's content");
  }

  if (
    req.user.role === "influencer" &&
    !campaign.applications.some(
      (app) =>
        app.influencer.toString() === req.user._id.toString() &&
        app.status === "accepted"
    )
  ) {
    res.status(403);
    throw new Error("Not authorized to view this campaign's content");
  }

  const content = await Content.find({ campaign: campaignId })
    .populate("creator", "name email profilePicture")
    .sort("-createdAt");

  res.json(content);
});

// @desc    Review content submission
// @route   PUT /api/content/:contentId/review
// @access  Private/Brand
const reviewContent = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { contentId } = req.params;

  if (!contentId) {
    res.status(400);
    throw new Error("Content ID is required");
  }

  const session = await Content.startSession();
  session.startTransaction();

  try {
    const content = await Content.findById(contentId)
      .populate("campaign")
      .populate("creator", "name email")
      .session(session);

    if (!content) {
      throw new Error("Content not found");
    }

    // Verify that the user is the brand owner of the campaign
    if (content.campaign.brand.toString() !== req.user._id.toString()) {
      throw new Error("Not authorized to review this content");
    }

    // Update content status
    content.status = status;
    content.reviewedAt = new Date();
    await content.save({ session });

    console.log(`Content ${contentId} status updated to ${status}`);

    // Get the campaign ID for updating progress
    const campaignId = content.campaign._id;

    // Call the campaign progress update function, which will check if all content is approved
    await checkAndUpdateCampaignProgress(campaignId, session);

    // If content is approved, handle additional logic for campaign completion
    if (status === "approved") {
      const campaign = await Campaign.findById(content.campaign._id)
        .populate("applications.influencer")
        .session(session);

      // Create content approval notification
      await Notification.create(
        [
          {
            recipient: content.creator._id,
            type: "CONTENT_APPROVED",
            title: "Content Approved!",
            message: `Your content for campaign "${campaign.title}" has been approved.`,
            data: {
              campaignId: campaign._id,
              contentId: content._id,
              status: status,
            },
          },
        ],
        { session }
      );
    } else if (status === "rejected") {
      // Create rejection notification
      await Notification.create(
        [
          {
            recipient: content.creator._id,
            type: "CONTENT_REJECTED",
            title: "Content Needs Revision",
            message: `Your content for campaign "${content.campaign.title}" requires changes.`,
            data: {
              campaignId: content.campaign._id,
              contentId: content._id,
              status: status,
            },
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    res.json(content);
  } catch (error) {
    await session.abortTransaction();
    res.status(400);
    throw error;
  } finally {
    session.endSession();
  }
});

// Create new content
const createContent = async (req, res) => {
  try {
    const {
      campaignId,
      deliverableType,
      platform,
      contentUrl,
      thumbnailUrl,
      caption,
      hashtags,
      mentions,
    } = req.body;

    // Verify campaign exists and user is part of it
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (!campaign.influencers.includes(req.user._id)) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to submit content for this campaign",
        });
    }

    const content = await Content.create({
      campaign: campaignId,
      creator: req.user._id,
      deliverableType,
      platform,
      contentUrl,
      thumbnailUrl,
      caption,
      hashtags,
      mentions,
    });

    await content.populate("creator", "name email profileImage");
    await content.populate("campaign", "title brand");

    res.status(201).json(content);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get content created by the logged-in user
const getMyContent = async (req, res) => {
  try {
    const content = await Content.find({ creator: req.user._id })
      .populate("campaign", "title brand")
      .sort("-createdAt");

    res.json(content);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update content status
const updateContentStatus = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { status, feedback } = req.body;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Verify user is authorized (campaign owner or content creator)
    const campaign = await Campaign.findById(content.campaign);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const isAuthorized =
      campaign.brand.equals(req.user._id) ||
      content.creator.equals(req.user._id);
    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this content" });
    }

    content.status = status;
    if (feedback) {
      content.feedback = feedback;
    }

    if (status === "published") {
      content.publishedAt = new Date();
    }

    await content.save();
    await content.populate("creator", "name email profileImage");
    await content.populate("campaign", "title brand");

    res.json(content);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update content metrics
const updateMetrics = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { metrics } = req.body;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Only content creator can update metrics
    if (!content.creator.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update metrics" });
    }

    content.metrics = { ...content.metrics, ...metrics };
    await content.save();

    res.json(content);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  submitContent,
  getCampaignContent,
  reviewContent,
  createContent,
  getMyContent,
  updateContentStatus,
  updateMetrics,
};
