const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportedContent: {
      contentType: {
        type: String,
        enum: ["post", "campaign", "message", "profile"],
      },
      contentId: mongoose.Schema.Types.ObjectId,
      contentUrl: String,
    },
    category: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "inappropriate_content",
        "fake_account",
        "copyright",
        "fraud",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "dismissed"],
      default: "pending",
    },
    adminResponse: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      action: {
        type: String,
        enum: [
          "no_action",
          "warning",
          "content_removal",
          "account_suspension",
          "account_ban",
        ],
      },
      actionReason: String,
      reviewedAt: Date,
    },
    evidence: [
      {
        type: String, // URLs to screenshots or other evidence
        description: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ severity: 1 });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
