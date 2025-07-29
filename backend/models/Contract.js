const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "signed", "completed", "disputed", "cancelled"],
      default: "pending",
    },
    templateType: {
      type: String,
      enum: ["standard", "premium", "custom"],
      default: "standard",
    },
    terms: {
      deliverables: [String],
      timeline: {
        startDate: Date,
        endDate: Date,
        milestones: [
          {
            description: String,
            dueDate: Date,
            completed: { type: Boolean, default: false },
          },
        ],
      },
      compensation: {
        amount: { type: Number, required: true },
        paymentSchedule: {
          type: String,
          enum: ["upfront", "milestone", "completion"],
          default: "completion",
        },
        bonusStructure: String,
      },
      intellectualProperty: {
        usage: String,
        duration: String,
        exclusivity: { type: Boolean, default: false },
      },
      cancellationPolicy: String,
    },
    signatures: {
      brand: {
        signed: { type: Boolean, default: false },
        signedAt: Date,
        signedBy: String,
      },
      influencer: {
        signed: { type: Boolean, default: false },
        signedAt: Date,
        signedBy: String,
      },
    },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    disputes: [
      {
        description: String,
        raisedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        raisedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["open", "resolved", "escalated"],
          default: "open",
        },
        resolution: String,
        resolvedAt: Date,
      },
    ],
    adminNotes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
contractSchema.index({ campaign: 1 });
contractSchema.index({ brand: 1, influencer: 1 });
contractSchema.index({ status: 1 });

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;
