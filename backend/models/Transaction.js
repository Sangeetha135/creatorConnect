const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    type: {
      type: String,
      enum: [
        "campaign_payment",
        "platform_fee",
        "refund",
        "bonus",
        "withdrawal",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "disputed",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "bank_transfer", "wallet"],
      required: true,
    },
    stripeDetails: {
      paymentIntentId: String,
      chargeId: String,
      customerId: String,
      transferId: String,
    },
    paypalDetails: {
      paymentId: String,
      payerId: String,
    },
    description: String,
    fees: {
      platformFee: { type: Number, default: 0 },
      processingFee: { type: Number, default: 0 },
      totalFees: { type: Number, default: 0 },
    },
    dispute: {
      isDisputed: { type: Boolean, default: false },
      disputeReason: String,
      disputeDate: Date,
      resolution: String,
      resolvedDate: Date,
    },
    adminNotes: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
transactionSchema.index({ payer: 1 });
transactionSchema.index({ recipient: 1 });
transactionSchema.index({ campaign: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
