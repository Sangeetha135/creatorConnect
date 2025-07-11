const Invitation = require('../models/Invitation');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Influencer = require('../models/Influencer');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { checkAndUpdateCampaignProgress } = require('./campaignController');

// @desc    Create a new invitation
// @route   POST /api/invitations
// @access  Private/Brand
const createInvitation = asyncHandler(async (req, res) => {
    // Check if user is a brand
    if (req.user.role !== 'brand') {
        res.status(403);
        throw new Error('Only brands can create invitations');
    }

    const { influencerId, campaignId, message, compensation } = req.body;

    // Start a session for transaction
    const session = await Invitation.startSession();
    session.startTransaction();

    try {
        // Check if campaign exists and belongs to the brand
        const campaign = await Campaign.findOne({
            _id: campaignId,
            brand: req.user._id
        })
            .populate('brand', 'name companyName')
            .session(session);
            
        if (!campaign) {
            throw new Error('Campaign not found or not authorized');
        }

        // Check if influencer exists and is a creator
        const influencer = await User.findOne({
            _id: influencerId,
            role: 'influencer'
        }).session(session);

        if (!influencer) {
            throw new Error('Influencer not found');
        }

        // Check if invitation already exists
        const existingInvitation = await Invitation.findOne({
            campaign: campaignId,
            influencer: influencerId,
            status: 'pending'
        }).session(session);

        if (existingInvitation) {
            throw new Error('An invitation has already been sent to this influencer');
        }

        // Create invitation
        const invitation = await Invitation.create([{
            campaign: campaignId,
            brand: req.user._id,
            influencer: influencerId,
            message,
            compensation,
            status: 'pending'
        }], { session });

        // Create notification for the influencer
        await Notification.create([{
            recipient: influencerId,
            type: 'CAMPAIGN_INVITATION',
            title: 'New Campaign Invitation',
            message: `${campaign.brand.name} has invited you to participate in their campaign: ${campaign.title}`,
            data: {
                campaignId: campaign._id,
                invitationId: invitation[0]._id,
                brandId: campaign.brand._id,
                compensation: compensation
            }
        }], { session });

        // Add invitation to influencer's record
        const influencerProfile = await Influencer.findOne({ user: influencerId }).session(session);
        if (influencerProfile) {
            influencerProfile.campaignInvitations.push({
                invitation: invitation[0]._id,
                campaign: campaignId,
                status: 'pending',
                compensation: compensation
            });
            await influencerProfile.save({ session });
        }

        // Populate brand and campaign details
        await invitation[0].populate([
            { path: 'brand', select: 'name companyName' },
            { path: 'campaign', select: 'title description' },
            { path: 'influencer', select: 'name email' }
        ]);

        // Check and update campaign progress
        await checkAndUpdateCampaignProgress(campaignId, session);

        await session.commitTransaction();
        res.status(201).json(invitation[0]);
    } catch (error) {
        await session.abortTransaction();
        res.status(400);
        throw error;
    } finally {
        session.endSession();
    }
});

// @desc    Get all invitations for the logged-in user
// @route   GET /api/invitations
// @access  Private
const getInvitations = asyncHandler(async (req, res) => {
    const invitations = await Invitation.find({
        $or: [
            { brand: req.user._id },
            { influencer: req.user._id }
        ]
    })
        .populate('brand', 'name companyName')
        .populate('campaign', 'title description')
        .populate('influencer', 'name email')
        .sort('-createdAt');

    res.json(invitations);
});

// @desc    Get invitation by ID
// @route   GET /api/invitations/:id
// @access  Private
const getInvitationById = asyncHandler(async (req, res) => {
    const invitation = await Invitation.findById(req.params.id)
        .populate('brand', 'name companyName')
        .populate('campaign', 'title description')
        .populate('influencer', 'name email');

    if (!invitation) {
        res.status(404);
        throw new Error('Invitation not found');
    }

    // Check if user has permission to view this invitation
    if (invitation.brand.toString() !== req.user._id.toString() &&
        invitation.influencer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this invitation');
    }

    res.json(invitation);
});

// @desc    Update invitation status
// @route   PUT /api/invitations/:id
// @access  Private
const updateInvitation = asyncHandler(async (req, res) => {
    const { status, responseMessage } = req.body;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status. Must be either "accepted" or "rejected"');
    }

    // Start a session for transaction
    const session = await Invitation.startSession();
    session.startTransaction();

    try {
        const invitation = await Invitation.findById(req.params.id)
            .populate('campaign')
            .populate('influencer', 'name')
            .session(session);

        if (!invitation) {
            throw new Error('Invitation not found');
        }

        // Check if user has permission to update this invitation
        if (invitation.influencer._id.toString() !== req.user._id.toString()) {
            throw new Error('Not authorized to update this invitation');
        }

        // Check if invitation is already responded to
        if (invitation.status !== 'pending') {
            throw new Error('This invitation has already been responded to');
        }

        // Update invitation
        invitation.status = status;
        if (responseMessage) {
            invitation.responseMessage = responseMessage;
        }
        await invitation.save({ session });

        // Create notification for brand based on the response
        const notificationData = {
            accepted: {
                type: 'INVITATION_ACCEPTED',
                title: 'Campaign Invitation Accepted',
                message: `${invitation.influencer.name} has accepted your invitation for campaign: ${invitation.campaign.title}`
            },
            rejected: {
                type: 'INVITATION_REJECTED',
                title: 'Campaign Invitation Rejected',
                message: `${invitation.influencer.name} has declined your invitation for campaign: ${invitation.campaign.title}`
            }
        };

        const notificationInfo = notificationData[status];
        await Notification.create([{
            recipient: invitation.brand,
            type: notificationInfo.type,
            title: notificationInfo.title,
            message: notificationInfo.message,
            data: {
                campaignId: invitation.campaign._id,
                invitationId: invitation._id,
                influencerId: invitation.influencer._id,
                responseMessage: responseMessage || ''
            }
        }], { session });

        // Update campaign applications if accepted
        if (status === 'accepted') {
            const campaign = await Campaign.findById(invitation.campaign._id).session(session);
            campaign.applications.push({
                influencer: invitation.influencer._id,
                status: 'accepted',
                invitationId: invitation._id
            });
            await campaign.save({ session });
        }

        // Update influencer's record
        const influencerProfile = await Influencer.findOne({ user: invitation.influencer._id }).session(session);
        if (influencerProfile) {
            const invitationRecord = influencerProfile.campaignInvitations.find(
                inv => inv.invitation.toString() === invitation._id.toString()
            );

            if (invitationRecord) {
                invitationRecord.status = status;
                invitationRecord.respondedAt = new Date();

                if (status === 'accepted') {
                    // Add to campaign applications if not already there
                    const existingApplication = influencerProfile.campaignApplications.find(
                        app => app.campaign.toString() === invitation.campaign._id.toString()
                    );

                    if (!existingApplication) {
                        influencerProfile.campaignApplications.push({
                            campaign: invitation.campaign._id,
                            status: 'accepted',
                            appliedAt: new Date(),
                            updatedAt: new Date()
                        });
                    }
                }

                await influencerProfile.save({ session });
            }
        }

        // Populate references for response
        await invitation.populate([
            { path: 'brand', select: 'name companyName' },
            { path: 'campaign', select: 'title description' },
            { path: 'influencer', select: 'name email' }
        ]);

        // Check and update campaign progress
        await checkAndUpdateCampaignProgress(invitation.campaign._id, session);

        await session.commitTransaction();
        res.json(invitation);
    } catch (error) {
        await session.abortTransaction();
        res.status(400);
        throw error;
    } finally {
        session.endSession();
    }
});

// @desc    Respond to campaign invitation
// @route   PUT /api/invitations/:id/respond
// @access  Private/Influencer
const respondToInvitation = asyncHandler(async (req, res) => {
    const { status, responseMessage } = req.body;
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const invitation = await Invitation.findById(req.params.id)
            .populate('campaign', 'title brand')
            .populate('influencer', 'name')
            .session(session);

        if (!invitation) {
            throw new Error('Invitation not found');
        }

        // Verify the invitation belongs to the current user
        if (invitation.influencer._id.toString() !== req.user._id.toString()) {
            throw new Error('Not authorized to respond to this invitation');
        }

        // Update invitation status
        invitation.status = status;
        invitation.responseMessage = responseMessage;
        invitation.respondedAt = new Date();

        await invitation.save({ session });

        // Create notification for brand
        await Notification.create([{
            recipient: invitation.campaign.brand,
            type: 'INVITATION_RESPONSE',
            title: `Invitation ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
            message: `${invitation.influencer.name} has ${status === 'accepted' ? 'accepted' : 'declined'} your invitation for campaign "${invitation.campaign.title}"`,
            data: {
                campaignId: invitation.campaign._id,
                invitationId: invitation._id,
                status: status
            }
        }], { session });

        // Update campaign applications if accepted
        if (status === 'accepted') {
            const campaign = await Campaign.findById(invitation.campaign._id).session(session);
            if (campaign) {
                campaign.applications.push({
                    influencer: invitation.influencer._id,
                    status: 'accepted',
                    invitationId: invitation._id,
                    appliedAt: new Date()
                });
                await campaign.save({ session });
            }
        } 
        // If this is a rejection, check if all invitations are now rejected
        else if (status === 'rejected') {
            console.log('Invitation rejected, checking if all invitations are now rejected');
            
            // Get all invitations for this campaign
            const allInvitations = await Invitation.find({ campaign: invitation.campaign._id }).session(session);
            
            // Calculate stats
            const stats = {
                total: allInvitations.length,
                accepted: allInvitations.filter(inv => inv.status === 'accepted').length,
                rejected: allInvitations.filter(inv => inv.status === 'rejected').length,
                pending: allInvitations.filter(inv => inv.status === 'pending').length
            };
            
            console.log('Campaign invitation stats:', stats);
            
            // If all invitations are now handled and all were rejected
            if (stats.total > 0 && stats.pending === 0 && stats.accepted === 0) {
                console.log('Checking if an ALL_INVITATIONS_REJECTED notification already exists');
                
                // First check if a notification already exists for this campaign
                const existingNotification = await Notification.findOne({
                    type: 'ALL_INVITATIONS_REJECTED',
                    'data.campaignId': invitation.campaign._id
                }).session(session);
                
                if (existingNotification) {
                    console.log('ALL_INVITATIONS_REJECTED notification already exists, skipping creation');
                } else {
                    console.log('ALL INVITATIONS REJECTED - Creating direct notification');
                    
                    // Send a special notification to the brand
                    await Notification.create([{
                        recipient: invitation.campaign.brand,
                        type: 'ALL_INVITATIONS_REJECTED',
                        title: 'All Invitations Rejected',
                        message: `All invitations (${stats.rejected}) for your campaign "${invitation.campaign.title}" have been rejected. You may want to invite more influencers or review your campaign details.`,
                        data: {
                            campaignId: invitation.campaign._id,
                            stats: stats,
                            rejectedCount: stats.rejected
                        }
                    }], { session });
    
                    // Update campaign with a flag to prevent duplicate notifications
                    const campaign = await Campaign.findById(invitation.campaign._id).session(session);
                    if (campaign) {
                        // Add flag to prevent duplicate notifications
                        campaign.notificationFlags = campaign.notificationFlags || {};
                        campaign.notificationFlags.allInvitationsRejectedSent = true;
                        await campaign.save({ session });
                    }
                }
            }
        }

        // Check and update campaign progress
        await checkAndUpdateCampaignProgress(invitation.campaign._id, session);

        await session.commitTransaction();
        res.json({ message: `Invitation ${status} successfully` });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error in respondToInvitation:', error);
        res.status(400);
        throw error;
    } finally {
        session.endSession();
    }
});

// @desc    Get all invitations for a campaign
// @route   GET /api/campaigns/:campaignId/invitations
// @access  Private
const getCampaignInvitations = asyncHandler(async (req, res) => {
    const invitations = await Invitation.find({ campaign: req.params.campaignId })
        .populate('influencer', 'name email profilePictureUrl')
        .populate('campaign', 'name');

    res.json(invitations);
});

// @desc    Delete invitation
// @route   DELETE /api/invitations/:id
// @access  Private/Brand
const deleteInvitation = asyncHandler(async (req, res) => {
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const invitation = await Invitation.findById(req.params.id).session(session);

        if (!invitation) {
            res.status(404);
            throw new Error('Invitation not found');
        }

        // Get campaign to verify ownership
        const campaign = await Campaign.findById(invitation.campaign).session(session);
        if (!campaign) {
            res.status(404);
            throw new Error('Associated campaign not found');
        }

        // Verify the campaign belongs to the logged-in brand
        if (campaign.brand.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Not authorized to delete this invitation');
        }

        // Delete the invitation
        await Invitation.deleteOne({ _id: invitation._id }).session(session);

        // Check and update campaign progress
        await checkAndUpdateCampaignProgress(campaign._id, session);
        
        await session.commitTransaction();
        
        res.json({ message: 'Invitation removed' });
    } catch (error) {
        await session.abortTransaction();
        res.status(400);
        throw error;
    } finally {
        session.endSession();
    }
});

module.exports = {
    createInvitation,
    getInvitations,
    getInvitationById,
    updateInvitation,
    respondToInvitation,
    getCampaignInvitations,
    deleteInvitation
}; 