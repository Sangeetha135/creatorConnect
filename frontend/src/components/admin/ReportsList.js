import React, { useState, useEffect } from "react";
import {
  FlagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import adminService from "../../services/adminService";

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    category: "all",
    severity: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [action, setAction] = useState("");
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReports(filters);
      setReports(Array.isArray(data?.reports) ? data.reports : []);
      setPagination(data?.pagination || {});
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
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

  const handleReportAction = (report, actionType) => {
    setSelectedReport(report);
    setAction(actionType);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    try {
      await adminService.handleReport(selectedReport._id, action, actionReason);
      await fetchReports(); // Refresh the list
      setShowActionModal(false);
      setActionReason("");
      setAction("");
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "spam":
      case "fake_account":
        return <ShieldExclamationIcon className="h-5 w-5" />;
      case "harassment":
      case "inappropriate_content":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <FlagIcon className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FlagIcon className="h-6 w-6 text-gray-900" />
          <h2 className="text-xl font-semibold text-gray-900">
            Content Moderation
          </h2>
        </div>
        <div className="text-sm text-gray-500">
          Total: {pagination.totalReports} reports
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Status Filter */}
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          {/* Category Filter */}
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="inappropriate_content">Inappropriate Content</option>
            <option value="fake_account">Fake Account</option>
            <option value="copyright">Copyright</option>
            <option value="fraud">Fraud</option>
            <option value="other">Other</option>
          </select>

          {/* Severity Filter */}
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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
            <option value="severity_desc">High Severity First</option>
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

      {/* Reports List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {reports.map((report) => (
            <li key={report._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className={`p-1 rounded-full ${getSeverityColor(
                        report.severity
                      )}`}
                    >
                      {getCategoryIcon(report.category)}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {report.category.replace("_", " ").toUpperCase()}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                        report.severity
                      )}`}
                    >
                      {report.severity}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Reported By
                      </p>
                      <p className="text-sm text-gray-900">
                        {report.reportedBy?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.reportedBy?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Reported User
                      </p>
                      <p className="text-sm text-gray-900">
                        {report.reportedUser?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.reportedUser?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Report Date
                      </p>
                      <p className="text-sm text-gray-900">
                        {formatDate(report.createdAt)}
                      </p>
                      {report.reportedContent && (
                        <p className="text-xs text-gray-500">
                          Content: {report.reportedContent.contentType}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-500">
                      Description
                    </p>
                    <p className="text-sm text-gray-900">
                      {report.description}
                    </p>
                  </div>

                  {report.adminResponse && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium text-blue-900">
                        Admin Action Taken
                      </p>
                      <p className="text-sm text-blue-800">
                        Action: {report.adminResponse.action?.replace("_", " ")}
                      </p>
                      {report.adminResponse.actionReason && (
                        <p className="text-sm text-blue-800">
                          Reason: {report.adminResponse.actionReason}
                        </p>
                      )}
                      <p className="text-xs text-blue-600">
                        Reviewed by {report.adminResponse.reviewedBy?.name} on{" "}
                        {formatDate(report.adminResponse.reviewedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {report.status === "pending" && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleReportAction(report, "no_action")}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      No Action
                    </button>
                    <button
                      onClick={() => handleReportAction(report, "warning")}
                      className="inline-flex items-center px-3 py-1 border border-yellow-300 text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Warning
                    </button>
                    <button
                      onClick={() =>
                        handleReportAction(report, "content_removal")
                      }
                      className="inline-flex items-center px-3 py-1 border border-orange-300 text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Remove Content
                    </button>
                    <button
                      onClick={() =>
                        handleReportAction(report, "account_suspension")
                      }
                      className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Suspend
                    </button>
                  </div>
                )}
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
                    pagination.totalReports
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{pagination.totalReports}</span>{" "}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Take Action on Report
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Report: <strong>{selectedReport?.category}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Action: <strong>{action?.replace("_", " ")}</strong>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Action
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Explain the reason for this action..."
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Confirm Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsList;
