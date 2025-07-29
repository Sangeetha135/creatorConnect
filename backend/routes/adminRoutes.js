// Admin API routes for managing users, campaigns, reports, payments, contracts
// All routes are protected using isAuthenticated and isAdmin middleware

const express = require("express");
const {
  getAllUsers,
  suspendUser,
  updateUserRole,
  getAnalyticsData,
  getReports,
  handleReport,
  getAllCampaigns,
  updateCampaign,
  getPaymentLogs,
  handlePayment,
  getBotLogs,
  handleSuspiciousAccount,
  getContracts,
  handleContractDispute,
  manageContracts,
} = require("../controllers/adminController");
const { isAuthenticated, isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

// 🔐 User Management
router.get("/users", isAuthenticated, isAdmin, getAllUsers);
router.put("/users/:id/suspend", isAuthenticated, isAdmin, suspendUser);
router.put("/users/:id/role", isAuthenticated, isAdmin, updateUserRole);

// 📊 Analytics Dashboard
router.get("/analytics", isAuthenticated, isAdmin, getAnalyticsData);

// 🚩 Reports Moderation
router.get("/reports", isAuthenticated, isAdmin, getReports);
router.put("/reports/:id/handle", isAuthenticated, isAdmin, handleReport);

// 📁 Campaign Oversight
router.get("/campaigns", isAuthenticated, isAdmin, getAllCampaigns);
router.put("/campaigns/:id/update", isAuthenticated, isAdmin, updateCampaign);

// 💳 Payments
router.get("/payments", isAuthenticated, isAdmin, getPaymentLogs);
router.put("/payments/:id/handle", isAuthenticated, isAdmin, handlePayment);

// 🤖 Bot Detection
router.get("/bot-logs", isAuthenticated, isAdmin, getBotLogs);
router.put(
  "/bot-logs/:id/handle",
  isAuthenticated,
  isAdmin,
  handleSuspiciousAccount
);

// 📜 Contract Management
router.get("/contracts", isAuthenticated, isAdmin, getContracts);
router.put(
  "/contracts/:id/dispute",
  isAuthenticated,
  isAdmin,
  handleContractDispute
);

module.exports = router;
