const User = require("../models/User");
const Campaign = require("../models/Campaign");
const Report = require("../models/Report");
const Contract = require("../models/Contract");
const Transaction = require("../models/Transaction");
const Brand = require("../models/Brand");
const Influencer = require("../models/Influencer");
const Post = require("../models/Post");

// 🔐 USER MANAGEMENT

// Get all users with filtering and pagination
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (role && role !== "all") filter.role = role;
    if (status) filter.isVerified = status === "verified";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Fetch users with pagination
    const users = await User.find(filter)
      .select("-password -verificationCode -resetToken")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get additional data for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        let additionalData = {};

        if (user.role === "brand") {
          const brand = await Brand.findOne({ brand: user._id });
          additionalData = {
            companyName: brand?.companyName,
            industry: brand?.industry,
            totalCampaigns: await Campaign.countDocuments({ brand: user._id }),
          };
        } else if (user.role === "influencer") {
          const influencer = await Influencer.findOne({ user: user._id });
          additionalData = {
            bio: influencer?.bio,
            categories: influencer?.categories || [],
            totalCampaigns: await Campaign.countDocuments({
              influencer: user._id,
            }),
            youtube: influencer?.youtube,
          };
        }

        return {
          ...user,
          ...additionalData,
          lastLogin: user.updatedAt, // Approximate last activity
        };
      })
    );

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.json({
      users: enrichedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Suspend/Activate user
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'suspend' | 'activate'

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent suspending other admins
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot suspend admin users" });
    }

    if (action === "suspend") {
      user.isVerified = false;
      user.suspendedAt = new Date();
      user.suspensionReason = reason;
    } else if (action === "activate") {
      user.isVerified = true;
      user.suspendedAt = undefined;
      user.suspensionReason = undefined;
    }

    await user.save();

    res.json({
      message: `User ${action}d successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        suspendedAt: user.suspendedAt,
        suspensionReason: user.suspensionReason,
      },
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    res
      .status(500)
      .json({ message: "Error updating user status", error: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole } = req.body;

    if (!["brand", "influencer", "admin"].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = newRole;
    await user.save();

    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    console.error("Update role error:", error);
    res
      .status(500)
      .json({ message: "Error updating user role", error: error.message });
  }
};

// 📊 ANALYTICS DASHBOARD

exports.getAnalyticsData = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalBrands = await User.countDocuments({ role: "brand" });
    const totalInfluencers = await User.countDocuments({ role: "influencer" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: "active" });
    const completedCampaigns = await Campaign.countDocuments({
      status: "completed",
    });
    const pendingCampaigns = await Campaign.countDocuments({
      status: "pending",
    });

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });

    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({
      status: "pending",
    });

    // Calculate revenue (platform fees)
    const revenueData = await Transaction.aggregate([
      { $match: { status: "completed", type: "platform_fee" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Get monthly user growth
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Get top performing campaigns
    const topCampaigns = await Campaign.find({ status: "completed" })
      .populate("brand", "name")
      .populate("influencer", "name")
      .sort({ budget: -1 })
      .limit(5)
      .select("title budget description brand influencer");

    // Get recent activity
    const recentActivity = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name role createdAt"),
      Campaign.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("brand", "name")
        .select("title status createdAt brand"),
      Report.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("reportedBy", "name")
        .select("category status createdAt reportedBy"),
    ]);

    res.json({
      overview: {
        totalUsers,
        totalBrands,
        totalInfluencers,
        totalAdmins,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        pendingCampaigns,
        totalReports,
        pendingReports,
        totalTransactions,
        pendingTransactions,
        totalRevenue,
      },
      charts: {
        userGrowth: userGrowth.map((item) => ({
          month: `${item._id.year}-${item._id.month
            .toString()
            .padStart(2, "0")}`,
          users: item.count,
        })),
      },
      topCampaigns,
      recentActivity: {
        newUsers: recentActivity[0],
        newCampaigns: recentActivity[1],
        newReports: recentActivity[2],
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: error.message });
  }
};

// 🚩 REPORTS & MODERATION

exports.getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      severity,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (category && category !== "all") filter.category = category;
    if (severity && severity !== "all") filter.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const reports = await Report.find(filter)
      .populate("reportedBy", "name email role")
      .populate("reportedUser", "name email role")
      .populate("adminResponse.reviewedBy", "name")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalReports = await Report.countDocuments(filter);

    res.json({
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReports / parseInt(limit)),
        totalReports,
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res
      .status(500)
      .json({ message: "Error fetching reports", error: error.message });
  }
};

// Take action on a report
exports.handleReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, actionReason } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update report status
    report.status = "resolved";
    report.adminResponse = {
      reviewedBy: req.user._id,
      action,
      actionReason,
      reviewedAt: new Date(),
    };

    // Take action on reported user if necessary
    if (report.reportedUser && action !== "no_action") {
      const reportedUser = await User.findById(report.reportedUser);
      if (reportedUser) {
        switch (action) {
          case "warning":
            // Could implement a warnings system
            break;
          case "account_suspension":
            reportedUser.isVerified = false;
            reportedUser.suspendedAt = new Date();
            reportedUser.suspensionReason = `Report: ${actionReason}`;
            await reportedUser.save();
            break;
          case "account_ban":
            reportedUser.isVerified = false;
            reportedUser.bannedAt = new Date();
            reportedUser.banReason = `Report: ${actionReason}`;
            await reportedUser.save();
            break;
        }
      }
    }

    await report.save();

    res.json({ message: "Report handled successfully", report });
  } catch (error) {
    console.error("Handle report error:", error);
    res
      .status(500)
      .json({ message: "Error handling report", error: error.message });
  }
};

// 📁 CAMPAIGN OVERSIGHT

exports.getAllCampaigns = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const campaigns = await Campaign.find(filter)
      .populate("brand", "name email")
      .populate("influencer", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCampaigns = await Campaign.countDocuments(filter);

    res.json({
      campaigns,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCampaigns / parseInt(limit)),
        totalCampaigns,
      },
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    res
      .status(500)
      .json({ message: "Error fetching campaigns", error: error.message });
  }
};

// Delete or modify campaign
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'delete' | 'suspend' | 'activate'

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    switch (action) {
      case "delete":
        await Campaign.findByIdAndDelete(id);
        break;
      case "suspend":
        campaign.status = "cancelled";
        campaign.adminNote = reason;
        await campaign.save();
        break;
      case "activate":
        campaign.status = "active";
        await campaign.save();
        break;
    }

    res.json({ message: `Campaign ${action}d successfully` });
  } catch (error) {
    console.error("Update campaign error:", error);
    res
      .status(500)
      .json({ message: "Error updating campaign", error: error.message });
  }
};

// 💳 PAYMENT MONITORING

exports.getPaymentLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (type && type !== "all") filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const transactions = await Transaction.find(filter)
      .populate("payer", "name email role")
      .populate("recipient", "name email role")
      .populate("campaign", "title")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalTransactions = await Transaction.countDocuments(filter);

    // Get payment summary
    const paymentSummary = await Transaction.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      transactions,
      summary: paymentSummary,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTransactions / parseInt(limit)),
        totalTransactions,
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res
      .status(500)
      .json({ message: "Error fetching payment logs", error: error.message });
  }
};

// Handle payment disputes or manual actions
exports.handlePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'refund' | 'approve' | 'dispute'

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    switch (action) {
      case "refund":
        transaction.status = "cancelled";
        transaction.adminNotes = `Manual refund: ${reason}`;
        // Here you would integrate with Stripe to process the actual refund
        break;
      case "approve":
        transaction.status = "completed";
        transaction.adminNotes = `Manually approved: ${reason}`;
        break;
      case "dispute":
        transaction.dispute.isDisputed = true;
        transaction.dispute.disputeReason = reason;
        transaction.dispute.disputeDate = new Date();
        transaction.status = "disputed";
        break;
    }

    await transaction.save();

    res.json({
      message: `Payment ${action} processed successfully`,
      transaction,
    });
  } catch (error) {
    console.error("Handle payment error:", error);
    res
      .status(500)
      .json({ message: "Error handling payment", error: error.message });
  }
};

// 🤖 BOT DETECTION

exports.getBotLogs = async (req, res) => {
  try {
    // This would typically integrate with your bot detection system
    // For now, we'll look for suspicious patterns in user data

    const suspiciousUsers = await User.aggregate([
      {
        $match: {
          role: "influencer",
          $or: [
            { "socialMedia.youtube.subscribers": { $gt: 100000 } }, // High follower count
            { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // New accounts
          ],
        },
      },
      {
        $lookup: {
          from: "influencers",
          localField: "_id",
          foreignField: "user",
          as: "profile",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          createdAt: 1,
          "socialMedia.youtube.subscribers": 1,
          "socialMedia.youtube.engagementRate": 1,
          suspicionScore: {
            $add: [
              {
                $cond: [
                  { $gt: ["$socialMedia.youtube.subscribers", 500000] },
                  30,
                  0,
                ],
              },
              {
                $cond: [
                  { $lt: ["$socialMedia.youtube.engagementRate", 0.01] },
                  25,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $gte: [
                      "$createdAt",
                      new Date(Date.now() - 24 * 60 * 60 * 1000),
                    ],
                  },
                  20,
                  0,
                ],
              },
            ],
          },
        },
      },
      { $match: { suspicionScore: { $gte: 20 } } },
      { $sort: { suspicionScore: -1 } },
      { $limit: 50 },
    ]);

    res.json({
      suspiciousAccounts: suspiciousUsers,
      totalFlagged: suspiciousUsers.length,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error("Bot detection error:", error);
    res.status(500).json({
      message: "Error fetching bot detection logs",
      error: error.message,
    });
  }
};

// Take action on suspicious account
exports.handleSuspiciousAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    switch (action) {
      case "verify":
        // Mark as legitimate
        user.botVerificationStatus = "verified";
        break;
      case "flag":
        user.botVerificationStatus = "flagged";
        user.flagReason = reason;
        break;
      case "ban":
        user.isVerified = false;
        user.bannedAt = new Date();
        user.banReason = `Bot detection: ${reason}`;
        break;
    }

    await user.save();

    res.json({ message: `Account ${action} action completed`, user });
  } catch (error) {
    console.error("Handle suspicious account error:", error);
    res.status(500).json({
      message: "Error handling suspicious account",
      error: error.message,
    });
  }
};

// 📜 CONTRACT MANAGEMENT

exports.getContracts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const contracts = await Contract.find(filter)
      .populate("campaign", "title status")
      .populate("brand", "name email")
      .populate("influencer", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalContracts = await Contract.countDocuments(filter);

    res.json({
      contracts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalContracts / parseInt(limit)),
        totalContracts,
      },
    });
  } catch (error) {
    console.error("Get contracts error:", error);
    res
      .status(500)
      .json({ message: "Error fetching contracts", error: error.message });
  }
};

// Handle contract disputes
exports.handleContractDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, resolution } = req.body;

    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    if (contract.disputes && contract.disputes.length > 0) {
      const activeDispute = contract.disputes.find((d) => d.status === "open");
      if (activeDispute) {
        activeDispute.status = "resolved";
        activeDispute.resolution = resolution;
        activeDispute.resolvedAt = new Date();

        if (action === "cancel_contract") {
          contract.status = "cancelled";
        }

        await contract.save();
      }
    }

    res.json({ message: "Contract dispute resolved", contract });
  } catch (error) {
    console.error("Handle contract dispute error:", error);
    res.status(500).json({
      message: "Error handling contract dispute",
      error: error.message,
    });
  }
};

// Legacy function name for compatibility
exports.manageContracts = exports.getContracts;
