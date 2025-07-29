import React, { useState, useEffect } from "react";
import {
  MegaphoneIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  StopIcon,
  PlayIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import adminService from "../../services/adminService";

const CampaignOverview = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionCampaign, setActionCampaign] = useState(null);
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCampaigns(filters);
      setCampaigns(Array.isArray(data?.campaigns) ? data.campaigns : []);
      setPagination(data?.pagination || {});
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleCampaignAction = (campaign, action) => {
    setActionCampaign(campaign);
    setActionType(action);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    try {
      await adminService.updateCampaign(
        actionCampaign._id,
        actionType,
        actionReason
      );
      await fetchCampaigns(); // Refresh the list
      setShowActionModal(false);
      setActionReason("");
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MegaphoneIcon className="h-6 w-6 text-gray-900" />
          <h2 className="text-xl font-semibold text-gray-900">
            Campaign Management
          </h2>
        </div>
        <div className="text-sm text-gray-500">
          Total: {pagination.totalCampaigns} campaigns
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Sort */}
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={`${filters.sortBy}_${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("_");
              handleFilterChange("sortBy", sortBy);
              handleFilterChange("sortOrder", sortOrder);
            }}
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="budget_desc">Highest Budget</option>
            <option value="budget_asc">Lowest Budget</option>
          </select>

          {/* Limit */}
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.limit}
            onChange={(e) =>
              handleFilterChange("limit", parseInt(e.target.value))
            }
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {campaigns.map((campaign) => (
            <li key={campaign._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {campaign.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Brand</p>
                      <p className="text-sm text-gray-900">
                        {campaign.brand?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {campaign.brand?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Influencer
                      </p>
                      <p className="text-sm text-gray-900">
                        {campaign.influencer?.name || "Not assigned"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {campaign.influencer?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Budget
                      </p>
                      <p className="text-sm text-gray-900">
                        ${campaign.budget?.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Created
                      </p>
                      <p className="text-sm text-gray-900">
                        {formatDate(campaign.createdAt)}
                      </p>
                    </div>
                  </div>

                  {campaign.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 truncate max-w-2xl">
                        {campaign.description}
                      </p>
                    </div>
                  )}

                  {campaign.adminNote && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Admin Note:</strong> {campaign.adminNote}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {campaign.status === "active" && (
                    <button
                      onClick={() => handleCampaignAction(campaign, "suspend")}
                      className="inline-flex items-center p-2 border border-red-300 rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Suspend Campaign"
                    >
                      <StopIcon className="h-4 w-4" />
                    </button>
                  )}

                  {(campaign.status === "pending" ||
                    campaign.status === "cancelled") && (
                    <button
                      onClick={() => handleCampaignAction(campaign, "activate")}
                      className="inline-flex items-center p-2 border border-green-300 rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      title="Activate Campaign"
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleCampaignAction(campaign, "delete")}
                    className="inline-flex items-center p-2 border border-red-300 rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    title="Delete Campaign"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * filters.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.currentPage * filters.limit,
                    pagination.totalCampaigns
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{pagination.totalCampaigns}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                  const pageNum = pagination.currentPage - 2 + i;
                  if (pageNum < 1 || pageNum > pagination.totalPages)
                    return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.currentPage === pageNum
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center space-x-2 mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === "delete"
                    ? "Delete Campaign"
                    : actionType === "suspend"
                    ? "Suspend Campaign"
                    : "Activate Campaign"}
                </h3>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Campaign: <strong>{actionCampaign?.title}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter reason for this action..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                    actionType === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : actionType === "suspend"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Confirm {actionType}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignOverview;
