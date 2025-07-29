import api from "./api";

const adminService = {
  // User Management
  getAllUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/users?${queryParams}`);
    return response.data;
  },

  suspendUser: async (userId, action, reason) => {
    const response = await api.put(`/api/admin/users/${userId}/suspend`, {
      action, // 'suspend' or 'activate'
      reason,
    });
    return response.data;
  },

  updateUserRole: async (userId, newRole) => {
    const response = await api.put(`/api/admin/users/${userId}/role`, {
      newRole,
    });
    return response.data;
  },

  // Analytics
  getAnalyticsData: async () => {
    const response = await api.get("/api/admin/analytics");
    return response.data;
  },

  // Reports & Moderation
  getReports: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/reports?${queryParams}`);
    return response.data;
  },

  handleReport: async (reportId, action, actionReason) => {
    const response = await api.put(`/api/admin/reports/${reportId}/handle`, {
      action,
      actionReason,
    });
    return response.data;
  },

  // Campaign Management
  getAllCampaigns: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/campaigns?${queryParams}`);
    return response.data;
  },

  updateCampaign: async (campaignId, action, reason) => {
    const response = await api.put(
      `/api/admin/campaigns/${campaignId}/update`,
      {
        action, // 'delete', 'suspend', 'activate'
        reason,
      }
    );
    return response.data;
  },

  // Payment Management
  getPaymentLogs: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/payments?${queryParams}`);
    return response.data;
  },

  handlePayment: async (transactionId, action, reason) => {
    const response = await api.put(
      `/api/admin/payments/${transactionId}/handle`,
      {
        action, // 'refund', 'approve', 'dispute'
        reason,
      }
    );
    return response.data;
  },

  // Bot Detection
  getBotLogs: async () => {
    const response = await api.get("/api/admin/bot-logs");
    return response.data;
  },

  handleSuspiciousAccount: async (userId, action, reason) => {
    const response = await api.put(`/api/admin/bot-logs/${userId}/handle`, {
      action, // 'verify', 'flag', 'ban'
      reason,
    });
    return response.data;
  },

  // Contract Management
  getContracts: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/api/admin/contracts?${queryParams}`);
    return response.data;
  },

  handleContractDispute: async (contractId, action, resolution) => {
    const response = await api.put(
      `/api/admin/contracts/${contractId}/dispute`,
      {
        action,
        resolution,
      }
    );
    return response.data;
  },
};

export default adminService;
