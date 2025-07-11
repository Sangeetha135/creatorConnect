const Campaign = require('../models/Campaign');
const Invitation = require('../models/Invitation');
const Notification = require('../models/Notification');
const Content = require('../models/Content');
const asyncHandler = require('express-async-handler');
const Influencer = require('../models/Influencer');
const Brand = require('../models/Brand');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Private
const getCampaigns = asyncHandler(async (req, res) => {
    const showAccepted = req.query.status === 'accepted';
    let query = {};

    // If user is a brand, get their campaigns
    if (req.user.role === 'brand') {
        query.brand = req.user._id;
    } else if (req.user.role === 'influencer') {
        if (showAccepted) {
            // For accepted campaigns, find campaigns where the influencer has accepted invitations or applications
            const acceptedInvitations = await Invitation.find({
                influencer: req.user._id,
                status: 'accepted'
            }).select('campaign');

            const acceptedCampaignIds = acceptedInvitations.map(inv => inv.campaign);

            // Find campaigns where the influencer has accepted applications
            const acceptedApplicationsCampaigns = await Campaign.find({
                'applications': {
                    $elemMatch: {
                        'influencer': req.user._id,
                        'status': 'accepted'
                    }
                }
            }).select('_id');

            const acceptedApplicationCampaignIds = acceptedApplicationsCampaigns.map(camp => camp._id);

            // Show only accepted campaigns that are not completed
            query = {
                _id: { $in: [...acceptedCampaignIds, ...acceptedApplicationCampaignIds] },
                status: { $ne: 'completed' }  // Exclude completed campaigns
            };
        } else {
            // For active campaigns, exclude the ones that are accepted or completed
            const acceptedInvitations = await Invitation.find({
                influencer: req.user._id,
                status: 'accepted'
            }).select('campaign');

            const acceptedCampaignIds = acceptedInvitations.map(inv => inv.campaign);

            const acceptedApplicationsCampaigns = await Campaign.find({
                'applications': {
                    $elemMatch: {
                        'influencer': req.user._id,
                        'status': 'accepted'
                    }
                }
            }).select('_id');

            const acceptedApplicationCampaignIds = acceptedApplicationsCampaigns.map(camp => camp._id);

            // Exclude accepted and completed campaigns
            query = {
                _id: { $nin: [...acceptedCampaignIds, ...acceptedApplicationCampaignIds] },
                status: { $ne: 'completed' }  // Exclude completed campaigns
            };
        }
    }

    const campaigns = await Campaign.find(query)
        .populate('brand', 'name companyName')
        .populate({
            path: 'applications.influencer',
            select: 'name email profilePicture'
        })
        .sort('-createdAt');

    // Process campaigns based on user role
    if (req.user.role === 'brand') {
        // For brand's campaigns, get invitation details
        const campaignsWithInvitations = await Promise.all(campaigns.map(async (campaign) => {
            const campaignObj = campaign.toObject();

            // Get all invitations for this campaign
            const invitations = await Invitation.find({ campaign: campaign._id })
                .populate('influencer', 'name email profilePicture')
                .select('status createdAt responseMessage compensation');

            // Group invitations by status
            campaignObj.invitations = {
                pending: invitations.filter(inv => inv.status === 'pending'),
                accepted: invitations.filter(inv => inv.status === 'accepted'),
                rejected: invitations.filter(inv => inv.status === 'rejected')
            };

            // Calculate campaign statistics
            campaignObj.statistics = {
                totalInvitations: invitations.length,
                pendingInvitations: campaignObj.invitations.pending.length,
                acceptedInvitations: campaignObj.invitations.accepted.length,
                rejectedInvitations: campaignObj.invitations.rejected.length,
                totalApplications: campaign.applications.length,
                pendingApplications: campaign.applications.filter(app => app.status === 'pending').length,
                acceptedApplications: campaign.applications.filter(app => app.status === 'accepted').length,
                rejectedApplications: campaign.applications.filter(app => app.status === 'rejected').length
            };

            // Calculate campaign status based on dates
            const now = new Date();
            const startDate = new Date(campaign.startDate);
            const endDate = new Date(campaign.endDate);

            // Update campaign status based on dates
            if (now < startDate) {
                campaignObj.status = 'upcoming';
            } else if (now >= startDate && now <= endDate) {
                campaignObj.status = 'active';
            } else if (now > endDate) {
                campaignObj.status = campaign.status === 'completed' ? 'completed' : 'active';
            }

            // Add timeline and progress information
            campaignObj.timeline = {
                daysUntilStart: Math.max(0, Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))),
                daysRemaining: Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))),
                daysUntilSubmission: Math.max(0, Math.ceil((new Date(campaign.contentSubmissionDeadline) - now) / (1000 * 60 * 60 * 24))),
                submissionDeadline: campaign.contentSubmissionDeadline,
                startDate: campaign.startDate,
                endDate: campaign.endDate
            };

            return campaignObj;
        }));

        return res.json(campaignsWithInvitations);
    } else {
        // For influencers, process campaigns to include their application and invitation status
        const processedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
            const campaignObj = campaign.toObject();

            // Find the influencer's application for this campaign
            const influencerApplication = campaign.applications.find(
                app => app.influencer?._id?.toString() === req.user._id.toString()
            );

            // Find the influencer's invitation for this campaign
            const invitation = await Invitation.findOne({
                campaign: campaign._id,
                influencer: req.user._id
            }).select('status createdAt responseMessage compensation');

            // Add application and invitation status
            campaignObj.userApplication = influencerApplication || null;
            campaignObj.userInvitation = invitation || null;

            // Calculate campaign status based on dates
            const now = new Date();
            const startDate = new Date(campaign.startDate);
            const endDate = new Date(campaign.endDate);

            // Update campaign status based on dates
            if (now < startDate) {
                campaignObj.status = 'upcoming';
            } else if (now >= startDate && now <= endDate) {
                campaignObj.status = 'active';
            } else if (now > endDate) {
                campaignObj.status = campaign.status === 'completed' ? 'completed' : 'active';
            }

            // Add timeline and progress information
            campaignObj.timeline = {
                daysUntilStart: Math.max(0, Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))),
                daysRemaining: Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))),
                daysUntilSubmission: Math.max(0, Math.ceil((new Date(campaign.contentSubmissionDeadline) - now) / (1000 * 60 * 60 * 24))),
                submissionDeadline: campaign.contentSubmissionDeadline,
                startDate: campaign.startDate,
                endDate: campaign.endDate
            };

            return campaignObj;
        }));

        return res.json(processedCampaigns);
    }
});

// Helper function to add common campaign metadata
const addCampaignMetadata = (campaignObj) => {
    // Ensure progress object exists with default values if not set
    if (!campaignObj.progress) {
        campaignObj.progress = {
            creation: { status: 'completed', completedAt: campaignObj.createdAt },
            invitations: { status: 'active', completedAt: null },
            content: { status: 'pending', completedAt: null },
            completion: { status: 'pending', completedAt: null }
        };
    } else {
        // Ensure invitations stage is always active if not completed
        if (campaignObj.progress.invitations.status === 'pending') {
            campaignObj.progress.invitations.status = 'active';
        }
    }

    // Add timeline information
    campaignObj.timeline = {
        daysUntilStart: Math.max(0, Math.ceil((new Date(campaignObj.startDate) - new Date()) / (1000 * 60 * 60 * 24))),
        daysRemaining: Math.max(0, Math.ceil((new Date(campaignObj.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
        daysUntilSubmission: Math.max(0, Math.ceil((new Date(campaignObj.contentSubmissionDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
    };

    return campaignObj;
};

// @desc    Get campaign by ID
// @route   GET /api/campaigns/:id
// @access  Private
const getCampaignById = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id)
        .populate('brand', 'name companyName');

    if (!campaign) {
        res.status(404);
        throw new Error('Campaign not found');
    }

    // Get all invitations for this campaign
    const invitations = await Invitation.find({ campaign: campaign._id })
        .populate('influencer', 'name email profilePicture')
        .select('status createdAt responseMessage compensation');

    // Format the campaign data for the frontend
    const formattedCampaign = {
        ...campaign.toObject(),
        campaignRequirements: {
            category: campaign.requirements.preferredCreatorCategory || '',
            minSubscribers: campaign.requirements.minSubscribers || 0,
            minAverageViews: campaign.requirements.minViews || 0,
            platforms: campaign.platforms || [],
            location: campaign.requirements.locationTargeting || ''
        },
        invitations: {
            pending: invitations.filter(inv => inv.status === 'pending'),
            accepted: invitations.filter(inv => inv.status === 'accepted'),
            rejected: invitations.filter(inv => inv.status === 'rejected')
        },
        statistics: {
            totalInvitations: invitations.length,
            pendingInvitations: invitations.filter(inv => inv.status === 'pending').length,
            acceptedInvitations: invitations.filter(inv => inv.status === 'accepted').length,
            rejectedInvitations: invitations.filter(inv => inv.status === 'rejected').length,
            totalApplications: campaign.applications.length,
            pendingApplications: campaign.applications.filter(app => app.status === 'pending').length,
            acceptedApplications: campaign.applications.filter(app => app.status === 'accepted').length,
            rejectedApplications: campaign.applications.filter(app => app.status === 'rejected').length
        },
        contentGuidelines: campaign.contentGuidelines || {},
        timeline: {
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            contentSubmissionDeadline: campaign.contentSubmissionDeadline,
            daysUntilStart: Math.max(0, Math.ceil((new Date(campaign.startDate) - new Date()) / (1000 * 60 * 60 * 24))),
            daysRemaining: Math.max(0, Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
            daysUntilSubmission: Math.max(0, Math.ceil((new Date(campaign.contentSubmissionDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
        },
        progress: campaign.progress || {
            creation: { status: 'completed', completedAt: campaign.createdAt },
            invitations: { status: 'pending' },
            content: { status: 'pending' },
            completion: { status: 'pending' }
        }
    };

    res.json(formattedCampaign);
});

// @desc    Create a campaign
// @route   POST /api/campaigns
// @access  Private/Brand
const createCampaign = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        budget,
        campaignType,
        platforms,
        deliverables,
        numberOfDeliverables,
        campaignGoals,
        startDate,
        endDate,
        contentSubmissionDeadline,
        kpis,
        requirements,
        // Content guideline sections
        contentGuidelines,
        dosAndDonts,
        hashtagsAndMentions,
        references
    } = req.body;

    // Validate required fields
    if (!title || !description || !budget || !campaignType || !platforms || !deliverables ||
        !numberOfDeliverables || !campaignGoals || !startDate || !endDate || !contentSubmissionDeadline) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }

    // Parse numeric values
    const parsedBudget = parseFloat(budget);
    const parsedNumberOfDeliverables = parseInt(numberOfDeliverables);

    if (isNaN(parsedBudget) || parsedBudget <= 0) {
        res.status(400);
        throw new Error('Please provide a valid budget amount');
    }

    if (isNaN(parsedNumberOfDeliverables) || parsedNumberOfDeliverables < 1) {
        res.status(400);
        throw new Error('Please provide a valid number of deliverables');
    }

    // Parse arrays
    const parsedPlatforms = Array.isArray(platforms) ? platforms : JSON.parse(platforms);
    const parsedDeliverables = Array.isArray(deliverables) ? deliverables : JSON.parse(deliverables);
    const parsedCampaignGoals = Array.isArray(campaignGoals) ? campaignGoals : JSON.parse(campaignGoals);

    // Parse requirements
    let parsedRequirements = requirements;
    if (typeof requirements === 'string') {
        try {
            parsedRequirements = JSON.parse(requirements);
        } catch (error) {
            console.error('Error parsing requirements:', error);
            parsedRequirements = {
                preferredCreatorCategory: 'General',
                locationTargeting: '',
                minSubscribers: 0,
                minViews: 0
            };
        }
    }

    // Parse content guidelines sections
    let parsedContentGuidelines = contentGuidelines;
    let parsedDosAndDonts = dosAndDonts;
    let parsedHashtagsAndMentions = hashtagsAndMentions;
    let parsedReferences = references;

    // Parse content guidelines if it's a string
    if (typeof contentGuidelines === 'string') {
        try {
            parsedContentGuidelines = JSON.parse(contentGuidelines);
        } catch (error) {
            console.error('Error parsing content guidelines:', error);
            parsedContentGuidelines = {
                generalGuidelines: '',
                contentType: '',
                duration: '',
                quality: '',
                tone: '',
                specificRequirements: []
            };
        }
    }

    // Parse do's and don'ts if it's a string
    if (typeof dosAndDonts === 'string') {
        try {
            parsedDosAndDonts = JSON.parse(dosAndDonts);
        } catch (error) {
            console.error('Error parsing dos and donts:', error);
            parsedDosAndDonts = [];
        }
    }

    // Parse hashtags and mentions if it's a string
    if (typeof hashtagsAndMentions === 'string') {
        try {
            parsedHashtagsAndMentions = JSON.parse(hashtagsAndMentions);
        } catch (error) {
            console.error('Error parsing hashtags and mentions:', error);
            parsedHashtagsAndMentions = [];
        }
    }

    // Parse references if it's a string
    if (typeof references === 'string') {
        try {
            parsedReferences = JSON.parse(references);
        } catch (error) {
            console.error('Error parsing references:', error);
            parsedReferences = [];
        }
    }

    // Initialize progress object with proper states
    const now = new Date();
    const progress = {
        creation: { status: 'completed', completedAt: now },
        invitations: { status: 'active', completedAt: null },
        content: { status: 'pending', completedAt: null },
        completion: { status: 'pending', completedAt: null }
    };

    // Calculate initial campaign status based on dates
    const startDateObj = new Date(startDate);
    let initialStatus;
    if (now < startDateObj) {
        initialStatus = 'upcoming';
    } else {
        initialStatus = 'active';
    }

    // Create campaign object
    const campaignData = {
        title,
        description,
        budget: parsedBudget,
        campaignType,
        platforms: parsedPlatforms,
        deliverables: parsedDeliverables,
        numberOfDeliverables: parsedNumberOfDeliverables,
        campaignGoals: parsedCampaignGoals,
        startDate,
        endDate,
        contentSubmissionDeadline,
        kpis,
        requirements: {
            preferredCreatorCategory: parsedRequirements.preferredCreatorCategory || 'General',
            locationTargeting: parsedRequirements.locationTargeting || '',
            minSubscribers: parsedRequirements.minSubscribers || 0,
            minViews: parsedRequirements.minViews || 0
        },
        contentGuidelines: {
            general: {
                guidelines: parsedContentGuidelines.generalGuidelines || '',
                contentType: parsedContentGuidelines.contentType || '',
                duration: parsedContentGuidelines.duration || '',
                quality: parsedContentGuidelines.quality || '',
                tone: parsedContentGuidelines.tone || '',
                specificRequirements: parsedContentGuidelines.specificRequirements || []
            },
            dosAndDonts: Array.isArray(parsedDosAndDonts) ? parsedDosAndDonts : [],
            hashtagsAndMentions: Array.isArray(parsedHashtagsAndMentions) ? parsedHashtagsAndMentions : [],
            references: Array.isArray(parsedReferences) ? parsedReferences : []
        },
        brand: req.user._id,
        status: initialStatus,
        progress,
        platform: parsedPlatforms[0]?.toLowerCase() || 'youtube',
        category: parsedRequirements.preferredCreatorCategory || 'General'
    };

    try {
    const campaign = await Campaign.create(campaignData);
    res.status(201).json(campaign);
    } catch (error) {
        console.error('Campaign creation error:', error);
        res.status(400);
        throw error;
    }
});

// @desc    Apply to a campaign
// @route   POST /api/campaigns/:id/apply
// @access  Private/Influencer
const applyToCampaign = asyncHandler(async (req, res) => {
    const campaignId = req.params.id;
    const influencerId = req.user._id;

    const session = await Campaign.startSession();
    session.startTransaction();

    try {
        const campaign = await Campaign.findById(campaignId)
            .populate('brand', 'name email')
            .session(session);

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        if (campaign.status !== 'active') {
            throw new Error('This campaign is not accepting applications');
        }

        // Check if already applied
        const alreadyApplied = campaign.applications.some(
            app => app.influencer.toString() === influencerId.toString()
        );

        if (alreadyApplied) {
            throw new Error('You have already applied to this campaign');
        }

        // Add application to campaign
        campaign.applications.push({
            influencer: influencerId,
            status: 'pending',
            appliedAt: new Date()
        });

        await campaign.save({ session });

        // Create notification for brand
        await Notification.create([{
            recipient: campaign.brand._id,
            type: 'CAMPAIGN_APPLICATION',
            title: 'New Campaign Application',
            message: `${req.user.name} has applied to your campaign "${campaign.title}"`,
            data: {
                campaignId: campaign._id,
                influencerId: influencerId,
                influencerName: req.user.name,
                applicationId: campaign.applications[campaign.applications.length - 1]._id
            }
        }], { session });

        await session.commitTransaction();
        res.json({ message: 'Application submitted successfully' });
    } catch (error) {
        await session.abortTransaction();
        res.status(400);
        throw error;
    } finally {
        session.endSession();
    }
});

// @desc    Update campaign progress
// @route   PUT /api/campaigns/:id/progress
// @access  Private/Brand
const updateCampaignProgress = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
        res.status(404);
        throw new Error('Campaign not found');
    }

    // Verify that the user is the campaign owner
    if (campaign.brand.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this campaign');
    }

    const { currentStep, completed } = req.body;
    const now = new Date();

    // Ensure campaign.progress exists
    if (!campaign.progress) {
        campaign.progress = {
            creation: { status: 'completed', completedAt: campaign.createdAt },
            invitations: { status: 'pending', completedAt: null },
            content: { status: 'pending', completedAt: null },
            completion: { status: 'pending', completedAt: null }
        };
    }

    // Update campaign progress based on the step
    switch (currentStep) {
        case 'creation':
            campaign.progress = {
                ...campaign.progress,
                creation: { status: 'completed', completedAt: now },
                invitations: { status: 'active', completedAt: null },
                content: { status: 'pending', completedAt: null },
                completion: { status: 'pending', completedAt: null }
            };
            break;
        case 'invitations':
            campaign.progress = {
                ...campaign.progress,
                creation: { ...campaign.progress.creation }, // Preserve creation state
                invitations: { status: completed ? 'completed' : 'active', completedAt: completed ? now : null },
                content: { status: completed ? 'active' : 'pending', completedAt: null },
                completion: { status: 'pending', completedAt: null }
            };
            break;
        case 'content':
            campaign.progress = {
                ...campaign.progress,
                creation: { ...campaign.progress.creation }, // Preserve creation state
                invitations: { ...campaign.progress.invitations }, // Preserve invitations state
                content: { status: completed ? 'completed' : 'active', completedAt: completed ? now : null },
                completion: { status: completed ? 'active' : 'pending', completedAt: null }
            };
            break;
        case 'completion':
            campaign.progress = {
                ...campaign.progress,
                creation: { ...campaign.progress.creation }, // Preserve creation state
                invitations: { ...campaign.progress.invitations }, // Preserve invitations state
                content: { ...campaign.progress.content }, // Preserve content state
                completion: { status: 'completed', completedAt: now }
            };
            campaign.status = 'completed';
            break;
        default:
            res.status(400);
            throw new Error('Invalid step specified');
    }

    const updatedCampaign = await campaign.save();
    res.json(updatedCampaign);
});

// @desc    Update a campaign
// @route   PUT /api/campaigns/:id
// @access  Private/Brand
const updateCampaign = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
        res.status(404);
        throw new Error('Campaign not found');
    }

    // Check if user is the brand that created the campaign
    if (campaign.brand.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this campaign');
    }

    // Update campaign fields
    const updatedCampaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate('brand', 'name companyName');

    res.status(200).json(updatedCampaign);
});

// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
// @access  Private/Brand
const deleteCampaign = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
        res.status(404);
        throw new Error('Campaign not found');
    }

    // Check if user is the brand that created the campaign
    if (campaign.brand.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this campaign');
    }

    await campaign.deleteOne();
    res.status(200).json({ message: 'Campaign deleted successfully' });
});

// @desc    Get users associated with a campaign
// @route   GET /api/campaigns/:id/users
// @access  Private
const getCampaignUsers = asyncHandler(async (req, res) => {
    const campaign = await Campaign.findById(req.params.id)
        .populate('brand', 'name email profileImage role')
        .populate('applications.influencer', 'name email profileImage role');

    if (!campaign) {
        res.status(404);
        throw new Error('Campaign not found');
    }

    // Get all invitations for this campaign
    const invitations = await Invitation.find({ campaign: campaign._id })
        .populate('influencer', 'name email profileImage role');

    let users = [];

    if (req.user.role === 'brand') {
        // If user is a brand, return all influencers from applications and invitations
        const applicationInfluencers = campaign.applications.map(app => app.influencer);
        const invitationInfluencers = invitations.map(inv => inv.influencer);
        
        // Combine and remove duplicates
        users = [...new Map([...applicationInfluencers, ...invitationInfluencers].map(user => [user._id.toString(), user])).values()];
    } else {
        // If user is an influencer, return only the brand
        users = [campaign.brand];
    }

    res.json(users);
});

// Helper function to check if all content is submitted and approved
const checkContentCompletion = async (campaignId, session) => {
    // Get all accepted influencers for this campaign
    const campaign = await Campaign.findById(campaignId).session(session);
    if (!campaign) return false;

    const acceptedInfluencers = campaign.applications
        .filter(app => app.status === 'accepted')
        .map(app => app.influencer.toString());

    if (acceptedInfluencers.length === 0) return false;

    // Get all content submissions for this campaign
    const content = await Content.find({
        campaign: campaignId,
        creator: { $in: acceptedInfluencers }
    }).session(session);

    // Check if all influencers have submitted and had their content approved
    const approvedContent = content.filter(c => c.status === 'approved');
    const allContentSubmitted = acceptedInfluencers.every(influencerId =>
        content.some(c => c.creator.toString() === influencerId)
    );
    const allContentApproved = acceptedInfluencers.every(influencerId =>
        approvedContent.some(c => c.creator.toString() === influencerId)
    );

    return allContentApproved && allContentSubmitted;
};

// Helper function to update campaign progress
const updateCampaignProgressHelper = async (campaignId, session) => {
    const campaign = await Campaign.findById(campaignId).session(session);
    if (!campaign) return;

    console.log('Checking campaign progress for:', campaignId);

    // Get all invitations
    const invitations = await Invitation.find({ campaign: campaignId }).session(session);
    const stats = {
        total: invitations.length,
        accepted: invitations.filter(inv => inv.status === 'accepted').length,
        rejected: invitations.filter(inv => inv.status === 'rejected').length,
        pending: invitations.filter(inv => inv.status === 'pending').length
    };

    console.log('Invitation statistics:', stats);
    console.log('Current campaign progress:', campaign.progress);

    // Detailed logging for debugging the "all rejected" case
    if (stats.total > 0 && stats.pending === 0) {
        console.log('All invitations have been handled (no pending)');
        if (stats.accepted === 0 && stats.rejected > 0) {
            console.log('ALL INVITATIONS REJECTED CONDITION MET!');
            console.log('Campaign brand ID:', campaign.brand);
        }
    }

    // Check content completion
    const contentCompleted = await checkContentCompletion(campaignId, session);
    console.log('Content completion status:', contentCompleted);

    // Update progress based on conditions
    let progressUpdated = false;
    const now = new Date();

    // Update invitation stage
    if (stats.total > 0 && stats.pending === 0 && stats.accepted > 0 && 
        campaign.progress.invitations.status !== 'completed') {
        campaign.progress.invitations = {
            status: 'completed',
            completedAt: now
        };
        campaign.progress.content = {
            status: 'active',
            completedAt: null
        };
        progressUpdated = true;
        console.log('Updated invitation stage to completed');
    }

    // Update content stage
    if (contentCompleted && campaign.progress.content.status !== 'completed') {
        campaign.progress.content = {
            status: 'completed',
            completedAt: now
        };
        campaign.progress.completion = {
            status: 'active',
            completedAt: null
        };
        progressUpdated = true;
        console.log('Updated content stage to completed');
    }

    // Check if campaign should be completed
    const endDate = new Date(campaign.endDate);
    const isAfterEndDate = now > endDate;
    const allStagesCompleted = campaign.progress.invitations.status === 'completed' &&
                             campaign.progress.content.status === 'completed';

    if ((isAfterEndDate || allStagesCompleted) && 
        campaign.progress.completion.status !== 'completed' &&
        campaign.status !== 'completed') {
        campaign.progress.completion = {
            status: 'completed',
            completedAt: now
        };
        campaign.status = 'completed';
        progressUpdated = true;
        console.log('Updated campaign to completed status');

        // Update influencer stats
        const acceptedApplications = campaign.applications.filter(app => app.status === 'accepted');
        const influencerIds = acceptedApplications.map(app => app.influencer);

        // Update User model stats
        await User.updateMany(
            { _id: { $in: influencerIds } },
            { $inc: { 'analytics.completedCampaigns': 1 } },
            { session }
        );

        // Update Influencer model stats
        for (const influencerId of influencerIds) {
            const influencer = await Influencer.findOne({ user: influencerId }).session(session);
            if (influencer) {
                if (!influencer.campaignStats) {
                    influencer.campaignStats = {
                        totalCampaigns: 1,
                        completedCampaigns: 1,
                        totalEarnings: 0,
                        averageRating: 0
                    };
                } else {
                    influencer.campaignStats.totalCampaigns++;
                    influencer.campaignStats.completedCampaigns++;
                }
                await influencer.save({ session });
            }
        }

        // Create completion notifications
        const notifications = influencerIds.map(influencerId => ({
            recipient: influencerId,
            type: 'CAMPAIGN_COMPLETED',
            title: 'Campaign Completed!',
            message: `The campaign "${campaign.title}" has been completed. Thank you for your participation!`,
            data: {
                campaignId: campaign._id,
                status: 'completed'
            }
        }));

        if (notifications.length > 0) {
            await Notification.create(notifications, { session });
        }
    }

    if (progressUpdated) {
        await campaign.save({ session });
    }

    return campaign;
};

// Middleware to check and update campaign progress
const checkAndUpdateCampaignProgress = async (campaignId, session = null) => {
    const useSession = session || await mongoose.startSession();
    if (!session) useSession.startTransaction();

    try {
        console.log(`Checking progress for campaign ${campaignId}`);
        const campaign = await Campaign.findById(campaignId).session(useSession);
        
        if (!campaign) {
            console.log('Campaign not found');
            return false;
        }

        // Get all invitations for the campaign
        const invitations = await Invitation.find({ campaign: campaignId }).session(useSession);
        
        // Calculate invitation statistics
        const stats = {
            total: invitations.length,
            accepted: invitations.filter(inv => inv.status === 'accepted').length,
            rejected: invitations.filter(inv => inv.status === 'rejected').length,
            pending: invitations.filter(inv => inv.status === 'pending').length
        };

        console.log('Invitation statistics:', stats);
        console.log('Current campaign progress:', campaign.progress);

        let progressUpdated = false;

        // Initialize progress object if it doesn't exist or is incomplete
        if (!campaign.progress || !campaign.progress.creation || !campaign.progress.completion) {
            campaign.progress = {
                creation: { status: 'completed', completedAt: campaign.createdAt },
                invitations: { status: stats.total > 0 ? 'active' : 'pending', completedAt: null },
                content: { status: 'pending', completedAt: null },
                completion: { status: 'pending', completedAt: null }
            };
            progressUpdated = true;
        }

        // Check if invitation stage should be completed
        if (stats.total > 0 && stats.pending === 0 && stats.accepted > 0) {
            console.log(`Campaign ${campaign._id}: All invitations handled (${stats.accepted} accepted, ${stats.rejected} rejected)`);
            if (campaign.progress.invitations.status !== 'completed') {
                campaign.progress.invitations = {
                    status: 'completed',
                    completedAt: new Date()
                };
                campaign.progress.content = {
                    status: 'active',
                    completedAt: null
                };
                progressUpdated = true;
                
                // Create notifications for accepted influencers
                const acceptedInvitations = invitations.filter(inv => inv.status === 'accepted');
                const notifications = acceptedInvitations.map(invitation => ({
                    recipient: invitation.influencer,
                    type: 'CAMPAIGN_CONTENT_STAGE',
                    title: 'Campaign Content Stage Started',
                    message: `The campaign "${campaign.title}" has moved to the content stage. You can now start submitting your content.`,
                    data: {
                        campaignId: campaign._id,
                        stage: 'content'
                    }
                }));

                if (notifications.length > 0) {
                    await Notification.create(notifications, { session: useSession });
                }
            }
        } 
        // Check if all invitations were rejected (no pending, no accepted)
        else if (stats.total > 0 && stats.pending === 0 && stats.accepted === 0) {
            console.log(`Campaign ${campaign._id}: All invitations rejected (${stats.rejected} rejected)`);
            
            // First check if notification was already sent
            if (campaign.notificationFlags && campaign.notificationFlags.allInvitationsRejectedSent) {
                console.log('ALL_INVITATIONS_REJECTED notification already sent, skipping');
            } else {
                // Check if a notification already exists in the database
                const existingNotification = await Notification.findOne({
                    type: 'ALL_INVITATIONS_REJECTED',
                    'data.campaignId': campaign._id
                }).session(useSession);
                
                if (existingNotification) {
                    console.log('ALL_INVITATIONS_REJECTED notification already exists in database, skipping');
                    
                    // Still set the flag even though we didn't create the notification
                    campaign.notificationFlags = campaign.notificationFlags || {};
                    campaign.notificationFlags.allInvitationsRejectedSent = true;
                } else {
                    console.log('Creating ALL_INVITATIONS_REJECTED notification for brand');
                    
                    try {
                        // Make sure we have the brand reference
                        let brandId = campaign.brand;
                        
                        if (typeof brandId === 'object' && brandId._id) {
                            brandId = brandId._id;
                        }
                        
                        if (!brandId) {
                            // If brand is not available, get the brand ID from the campaign
                            const fullCampaign = await Campaign.findById(campaignId).select('brand').session(useSession);
                            if (!fullCampaign || !fullCampaign.brand) {
                                console.error('Cannot find brand for campaign', campaignId);
                                return false;
                            }
                            brandId = fullCampaign.brand;
                        }
                        
                        console.log('Creating notification for brand:', brandId);
                        
                        // Create notification for brand
                        await Notification.create([{
                            recipient: brandId,
                            type: 'ALL_INVITATIONS_REJECTED',
                            title: 'All Invitations Rejected',
                            message: `All invitations (${stats.rejected}) for your campaign "${campaign.title}" have been rejected. You may want to invite more influencers or review your campaign details.`,
                            data: {
                                campaignId: campaign._id,
                                stats: stats,
                                rejectedCount: stats.rejected
                            }
                        }], { session: useSession });
                        
                        // Set flag to prevent duplicate notifications
                        campaign.notificationFlags = campaign.notificationFlags || {};
                        campaign.notificationFlags.allInvitationsRejectedSent = true;
                        
                        console.log('Notification created successfully');
                    } catch (error) {
                        console.error('Failed to create ALL_INVITATIONS_REJECTED notification:', error);
                    }
                }
            }
            
            progressUpdated = true;
        }

        // Check content completion if invitation stage is complete
        if (campaign.progress.invitations.status === 'completed') {
            const acceptedInfluencers = invitations
                .filter(inv => inv.status === 'accepted')
                .map(inv => inv.influencer.toString());
                
            console.log('Accepted influencers:', acceptedInfluencers);

            const content = await Content.find({
                campaign: campaignId
            }).session(useSession);
            
            console.log('All content found:', content.length, 'items');
            console.log('Content creators:', content.map(c => ({
                creator: c.creator.toString(),
                status: c.status
            })));

            // Count content by creator, including only the most recent submission per creator
            const latestContentByCreator = content.reduce((acc, curr) => {
                if (!acc[curr.creator.toString()] || 
                    new Date(curr.createdAt) > new Date(acc[curr.creator.toString()].createdAt)) {
                    acc[curr.creator.toString()] = curr;
                }
                return acc;
            }, {});
            
            // Check if each accepted influencer has content
            const submittedCreators = Object.keys(latestContentByCreator);
            const approvedContent = Object.values(latestContentByCreator)
                .filter(c => c.status === 'approved');
                
            console.log('Latest content by creator:', Object.keys(latestContentByCreator).length);
            console.log('Approved content count:', approvedContent.length);

            const contentStats = {
                total: acceptedInfluencers.length,
                submitted: submittedCreators.length,
                approved: approvedContent.length,
                // Debug info
                submittedCreators,
                acceptedInfluencers,
                hasAllSubmitted: acceptedInfluencers.every(id => submittedCreators.includes(id)),
                hasAllApproved: acceptedInfluencers.every(id => {
                    const content = latestContentByCreator[id];
                    return content && content.status === 'approved';
                })
            };

            console.log(`Content stats: ${JSON.stringify(contentStats)}`);

            // Consider campaign complete if all influencers have APPROVED content
            if (contentStats.hasAllSubmitted && contentStats.hasAllApproved) {
                if (campaign.progress.content.status !== 'completed') {
                    console.log('All content has been submitted and approved! Marking campaign as complete.');
                    campaign.progress.content = {
                        status: 'completed',
                        completedAt: new Date()
                    };
                    campaign.progress.completion = {
                        status: 'active',
                        completedAt: null
                    };
                    campaign.status = 'completed';
                    progressUpdated = true;
                }
            } else if (contentStats.submitted > 0) {
                // At least some content submitted, ensure content stage is active
                if (campaign.progress.content.status !== 'active') {
                    console.log('Some content has been submitted. Setting content stage to active.');
                    campaign.progress.content = {
                        status: 'active',
                        completedAt: null
                    };
                    progressUpdated = true;
                }
            }
        }

        if (progressUpdated) {
            console.log('Saving updated campaign progress:', campaign.progress);
            await campaign.save({ session: useSession });
        }

        if (!session) {
            await useSession.commitTransaction();
        }
        return progressUpdated;
    } catch (error) {
        console.error('Error in checkAndUpdateCampaignProgress:', error);
        if (!session) {
            await useSession.abortTransaction();
        }
        throw error;
    } finally {
        if (!session) {
            useSession.endSession();
        }
    }
};

// @desc    Update campaign status
// @route   PUT /api/campaigns/:id/status
// @access  Private/Brand
const updateCampaignStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { campaignId, status } = req.body;
        const campaign = await Campaign.findById(campaignId).session(session);

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Store previous status to check if we're transitioning to completed
        const previousStatus = campaign.status;

        campaign.status = status;
        await campaign.save({ session });

        // Check and update progress after status change
        await checkAndUpdateCampaignProgress(campaignId);

        // If campaign is newly marked as completed, update stats for both brand and influencers
        if (status === 'completed' && previousStatus !== 'completed') {
            console.log(`Campaign ${campaignId} marked as completed. Updating stats.`);
            
            // Get all influencers with accepted applications
            const acceptedApplications = campaign.applications.filter(app => app.status === 'accepted');
            const influencerIds = acceptedApplications.map(app => app.influencer);

            // Update User model stats for influencers
            await User.updateMany(
                { _id: { $in: influencerIds } },
                { $inc: { 'analytics.completedCampaigns': 1 } },
                { session }
            );

            // Update Influencer model stats
            for (const influencerId of influencerIds) {
                const influencer = await Influencer.findOne({ user: influencerId }).session(session);
                
                if (influencer) {
                    // Initialize campaignStats if it doesn't exist
                    if (!influencer.campaignStats) {
                        influencer.campaignStats = {
                            totalCampaigns: 1,
                            completedCampaigns: 1,
                            totalEarnings: 0,
                            averageRating: 0
                        };
                    } else {
                        // Increment stats
                        influencer.campaignStats.totalCampaigns++;
                        influencer.campaignStats.completedCampaigns++;
                    }
                    
                    await influencer.save({ session });
                    console.log(`Updated stats for influencer ${influencerId}`);
                }
            }
            
            // Update Brand stats
            const brand = await Brand.findOne({ brand: campaign.brand }).session(session);
            if (brand) {
                // Initialize campaignStats if it doesn't exist
                if (!brand.campaignStats) {
                    brand.campaignStats = {
                        totalCampaigns: 1,
                        activeCampaigns: 0,
                        completedCampaigns: 1,
                        totalInfluencers: influencerIds.length,
                        totalReach: 0
                    };
                } else {
                    // Decrement active campaigns (if it was active before)
                    if (previousStatus === 'active') {
                        brand.campaignStats.activeCampaigns = Math.max(0, (brand.campaignStats.activeCampaigns || 0) - 1);
                    }
                    
                    // Increment completed campaigns
                    brand.campaignStats.totalCampaigns = (brand.campaignStats.totalCampaigns || 0) + 1;
                    brand.campaignStats.completedCampaigns = (brand.campaignStats.completedCampaigns || 0) + 1;
                    brand.campaignStats.totalInfluencers = (brand.campaignStats.totalInfluencers || 0) + influencerIds.length;
                }
                
                await brand.save({ session });
                console.log(`Updated stats for brand ${campaign.brand}`);
            }

            // Create notifications for all involved influencers
            const notifications = influencerIds.map(influencerId => ({
                recipient: influencerId,
                type: 'CAMPAIGN_COMPLETED',
                title: 'Campaign Completed!',
                message: `The campaign "${campaign.title}" has been marked as completed. Thank you for your participation!`,
                data: {
                    campaignId: campaign._id,
                    status: status
                }
            }));

            await Notification.create(notifications, { session });
        } else if (status === 'active' && previousStatus !== 'active') {
            // If campaign is newly marked as active, update brand stats
            const brand = await Brand.findOne({ brand: campaign.brand }).session(session);
            if (brand) {
                if (!brand.campaignStats) {
                    brand.campaignStats = {
                        totalCampaigns: 1,
                        activeCampaigns: 1,
                        completedCampaigns: 0,
                        totalInfluencers: 0,
                        totalReach: 0
                    };
                } else {
                    brand.campaignStats.totalCampaigns = (brand.campaignStats.totalCampaigns || 0) + 1;
                    brand.campaignStats.activeCampaigns = (brand.campaignStats.activeCampaigns || 0) + 1;
                }
                
                await brand.save({ session });
                console.log(`Updated stats for brand ${campaign.brand} - new active campaign`);
            }
        }

        await session.commitTransaction();
        res.json({ message: 'Campaign status updated successfully', campaign });
    } catch (err) {
        await session.abortTransaction();
        console.error('Error updating campaign status:', err);
        res.status(500).json({ message: 'Error updating campaign status' });
    } finally {
        session.endSession();
    }
};

// @desc    Get completed campaigns
// @route   GET /api/campaigns/completed
// @access  Private
const getCompletedCampaigns = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let query;
        if (userRole === 'brand') {
            // For brands, get campaigns where they are the owner and status is completed
            query = { 
                brand: userId,
                status: 'completed'
            };
        } else {
            // For influencers, get campaigns where they have an accepted application and status is completed
            query = {
                status: 'completed',
                applications: {
                $elemMatch: {
                        influencer: userId,
                        status: 'accepted'
                }
            }
            };
        }

        // First get the campaigns
        const campaigns = await Campaign.find(query)
            .populate('brand', 'companyName logoUrl industry')
        .populate({
            path: 'applications.influencer',
                select: 'name profilePictureUrl'
        })
            .sort({ completedDate: -1 });

        // Then fetch approved content for each campaign
        const enhancedCampaigns = await Promise.all(campaigns.map(async (campaign) => {
        const campaignObj = campaign.toObject();
        
            // Fetch approved content submissions for this campaign
        const approvedContent = await Content.find({
            campaign: campaign._id,
            status: 'approved'
            }).populate('creator', 'name profilePictureUrl');

            // Get the specific influencer's compensation if it's an influencer
            if (userRole === 'influencer') {
                const influencerApplication = campaign.applications?.find(
                    app => {
                        // Handle cases where influencer might not be populated
                        const appInfluencerId = app.influencer?._id?.toString() || app.influencer?.toString();
                        return appInfluencerId === userId && app.status === 'accepted';
                    }
                );
                campaignObj.compensation = influencerApplication?.compensation || campaign.budget;
            }

            // Format dates
            campaignObj.startDate = campaign.startDate;
            campaignObj.endDate = campaign.endDate;
            campaignObj.completedDate = campaign.completedDate || campaign.updatedAt;

            // Add approved content with creator information
            campaignObj.approvedContent = approvedContent.map(content => {
                // Ensure creator exists before accessing its properties
                const creator = content.creator || {};
                return {
                    _id: content._id,
                    contentUrl: content.contentUrl,
                    contentType: content.contentType,
                    description: content.description,
                    creator: {
                        _id: creator._id || null,
                        name: creator.name || 'Unknown Creator',
                        profilePictureUrl: creator.profilePictureUrl || null
                    },
                    submittedAt: content.createdAt
                };
            });

        return campaignObj;
    }));

        res.json(enhancedCampaigns);
    } catch (error) {
        console.error('Error fetching completed campaigns:', error);
        res.status(500).json({ message: 'Error fetching completed campaigns' });
    }
};

// @desc    Update progress for all past campaigns
// @route   POST /api/campaigns/update-all-progress
// @access  Private/Admin
const updateAllCampaignsProgress = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get all campaigns
        const campaigns = await Campaign.find({}).session(session);
        console.log(`Found ${campaigns.length} campaigns to process`);

        let updatedCount = 0;
        for (const campaign of campaigns) {
            // Get all invitations for the campaign
            const invitations = await Invitation.find({ campaign: campaign._id }).session(session);
            
            // Calculate invitation statistics
            const stats = {
                total: invitations.length,
                accepted: invitations.filter(inv => inv.status === 'accepted').length,
                rejected: invitations.filter(inv => inv.status === 'rejected').length,
                pending: invitations.filter(inv => inv.status === 'pending').length
            };

            console.log(`Campaign ${campaign._id}: ${JSON.stringify(stats)}`);

            // Check if we should complete the invitation stage
            if (stats.total > 0 && stats.pending === 0 && stats.accepted > 0) {
                // Only update if not already completed
                if (campaign.progress?.invitations?.status !== 'completed') {
                    campaign.progress = {
                        ...campaign.progress,
                        invitations: {
                            status: 'completed',
                            completedAt: new Date()
                        },
                        content: {
                            status: 'active',
                            completedAt: null
                        }
                    };
                    await campaign.save({ session });
                    updatedCount++;
                }
            }
        }

        await session.commitTransaction();
        res.json({ 
            message: 'Campaign progress update completed', 
            totalProcessed: campaigns.length,
            updatedCount: updatedCount 
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error updating campaign progress:', error);
        res.status(500).json({ message: 'Error updating campaign progress' });
    } finally {
        session.endSession();
    }
});

const handleInvitation = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { invitationId, action } = req.body;
        console.log(`Handling invitation ${invitationId} with action ${action}`);

        const invitation = await Invitation.findById(invitationId)
            .populate('campaign')
            .session(session);

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Verify the invitation belongs to the current user
        if (invitation.influencer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to handle this invitation' });
        }

        console.log(`Updating invitation status to ${action}`);
        invitation.status = action;
        invitation.respondedAt = new Date();
        await invitation.save({ session });

        // Check and update campaign progress
        console.log(`Checking campaign progress for ${invitation.campaign._id} after invitation update`);
        const progressUpdated = await checkAndUpdateCampaignProgress(invitation.campaign._id, session);
        console.log(`Campaign progress updated: ${progressUpdated}`);

        await session.commitTransaction();
        res.json({ message: 'Invitation handled successfully', invitation });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error handling invitation:', error);
        res.status(500).json({ message: 'Error handling invitation' });
    } finally {
        session.endSession();
    }
};

// @desc    Test sending a rejection notification
// @route   POST /api/campaigns/test-rejection
// @access  Private
const testRejectionNotification = asyncHandler(async (req, res) => {
    try {
        const { campaignId } = req.body;
        
        if (!campaignId) {
            return res.status(400).json({ message: 'Campaign ID is required' });
        }
        
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        console.log('Found campaign:', campaign._id, 'with brand:', campaign.brand);
        
        // Create a direct rejection notification
        const notification = await Notification.create({
            recipient: campaign.brand,
            type: 'ALL_INVITATIONS_REJECTED',
            title: 'All Invitations Rejected (Debug)',
            message: `All invitations for your campaign "${campaign.title}" have been rejected. You may want to invite more influencers or review your campaign details.`,
            data: {
                campaignId: campaign._id,
                rejectedCount: 2
            }
        });
        
        console.log('Created test notification:', notification);
        
        res.json({ 
            success: true, 
            campaign: campaign._id, 
            brand: campaign.brand,
            notification 
        });
    } catch (error) {
        console.error('Error in testRejectionNotification:', error);
        res.status(500).json({ message: 'Error creating test notification', error: error.message });
    }
});

// @desc    Recalculate and update all campaign statistics
// @route   POST /api/campaigns/recalculate-stats
// @access  Private/Admin
const recalculateCampaignStats = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log('Starting campaign statistics recalculation');
        
        // Get all brands and influencers
        const brands = await Brand.find({}).session(session);
        const influencers = await Influencer.find({}).session(session);
        
        console.log(`Found ${brands.length} brands and ${influencers.length} influencers`);
        
        // Create lookup maps for faster access
        const brandMap = brands.reduce((map, brand) => {
            map[brand.brand.toString()] = brand;
            return map;
        }, {});
        
        const influencerMap = influencers.reduce((map, influencer) => {
            map[influencer.user.toString()] = influencer;
            return map;
        }, {});
        
        // Initialize empty stats for all brands and influencers
        for (const brand of brands) {
            brand.campaignStats = {
                totalCampaigns: 0,
                activeCampaigns: 0,
                completedCampaigns: 0,
                totalInfluencers: 0,
                totalReach: 0
            };
        }
        
        for (const influencer of influencers) {
            influencer.campaignStats = {
                totalCampaigns: 0,
                completedCampaigns: 0,
                totalEarnings: 0,
                averageRating: 0
            };
        }
        
        // Get all campaigns
        const campaigns = await Campaign.find({}).session(session);
        console.log(`Found ${campaigns.length} campaigns to process`);
        
        // Process each campaign and update relevant stats
        for (const campaign of campaigns) {
            const brandId = campaign.brand.toString();
            const brand = brandMap[brandId];
            
            if (brand) {
                console.log(`Updating stats for brand ${brandId} from campaign ${campaign._id}`);
                
                // Update brand stats based on campaign status
                brand.campaignStats.totalCampaigns++;
                
                if (campaign.status === 'active') {
                    brand.campaignStats.activeCampaigns++;
                } else if (campaign.status === 'completed') {
                    brand.campaignStats.completedCampaigns++;
                }
                
                // Get accepted applications
                const acceptedApplications = campaign.applications.filter(app => app.status === 'accepted');
                const influencerUserIds = acceptedApplications.map(app => app.influencer.toString());
                
                console.log(`Campaign ${campaign._id} has ${influencerUserIds.length} accepted influencers`);
                
                brand.campaignStats.totalInfluencers += influencerUserIds.length;
                
                // Update stats for each involved influencer
                for (const influencerUserId of influencerUserIds) {
                    const influencer = influencerMap[influencerUserId];
                    
                    if (influencer) {
                        console.log(`Updating stats for influencer ${influencerUserId} from campaign ${campaign._id}`);
                        
                        // Update influencer stats
                        influencer.campaignStats.totalCampaigns++;
                        
                        if (campaign.status === 'completed') {
                            influencer.campaignStats.completedCampaigns++;
                            influencer.campaignStats.totalEarnings += campaign.budget || 0;
                        }
                    } else {
                        console.log(`Influencer ${influencerUserId} not found in map`);
                    }
                }
            } else {
                console.log(`Brand ${brandId} not found in map`);
            }
        }
        
        // Save all updated brands
        let updatedBrands = 0;
        for (const brand of brands) {
            console.log(`Saving brand ${brand.brand} stats:`, brand.campaignStats);
            await brand.save({ session });
            updatedBrands++;
        }
        
        // Save all updated influencers
        let updatedInfluencers = 0;
        for (const influencer of influencers) {
            console.log(`Saving influencer ${influencer.user} stats:`, influencer.campaignStats);
            await influencer.save({ session });
            updatedInfluencers++;
        }
        
        await session.commitTransaction();
        
        res.json({
            message: 'Campaign statistics recalculated successfully',
            stats: {
                processedCampaigns: campaigns.length,
                updatedBrands,
                updatedInfluencers
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error recalculating campaign stats:', error);
        res.status(500).json({ message: 'Error recalculating campaign statistics', error: error.message });
    } finally {
        session.endSession();
    }
});

module.exports = {
    getCampaigns,
    getCampaignById,
    createCampaign,
    applyToCampaign,
    updateCampaignProgress,
    updateCampaign,
    deleteCampaign,
    getCampaignUsers,
    updateCampaignStatus,
    getCompletedCampaigns,
    updateAllCampaignsProgress,
    checkAndUpdateCampaignProgress,
    handleInvitation,
    testRejectionNotification,
    recalculateCampaignStats
};