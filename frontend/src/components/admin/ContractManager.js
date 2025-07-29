import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import adminService from "../../services/adminService";

const ContractManager = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [disputeAction, setDisputeAction] = useState("");
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    fetchContracts();
  }, [filters]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getContracts(filters);
      setContracts(data.contracts);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching contracts:", error);
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

  const handleDisputeAction = (contract) => {
    setSelectedContract(contract);
    setShowDisputeModal(true);
  };

  const executeDisputeAction = async () => {
    try {
      await adminService.handleContractDispute(
        selectedContract._id,
        disputeAction,
        resolution
      );
      await fetchContracts(); // Refresh the list
      setShowDisputeModal(false);
      setDisputeAction("");
      setResolution("");
    } catch (error) {
      console.error("Error executing dispute action:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTemplateColor = (type) => {
    switch (type) {
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "custom":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "signed":
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "disputed":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case "cancelled":
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const hasActiveDispute = (contract) => {
    return (
      contract.disputes && contract.disputes.some((d) => d.status === "open")
    );
  };

  const getCompletedMilestones = (milestones) => {
    if (!milestones) return 0;
    return milestones.filter((m) => m.completed).length;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-6 w-6 text-gray-900" />
          <h2 className="text-xl font-semibold text-gray-900">
            Contract Management
          </h2>
        </div>
        <div className="text-sm text-gray-500">
          Total: {pagination.totalContracts} contracts
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
            <option value="signed">Signed</option>
            <option value="completed">Completed</option>
            <option value="disputed">Disputed</option>
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
            <option value="status_asc">Status A-Z</option>
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

      {/* Contracts List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {contracts.map((contract) => (
            <li key={contract._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(contract.status)}
                    <h3 className="text-lg font-medium text-gray-900">
                      {contract.campaign?.title || "Deleted Campaign"}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        contract.status
                      )}`}
                    >
                      {contract.status}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTemplateColor(
                        contract.templateType
                      )}`}
                    >
                      {contract.templateType}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Brand</p>
                      <p className="text-sm text-gray-900">
                        {contract.brand?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contract.brand?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Influencer
                      </p>
                      <p className="text-sm text-gray-900">
                        {contract.influencer?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contract.influencer?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Compensation
                      </p>
                      <p className="text-sm text-gray-900">
                        {formatCurrency(
                          contract.terms?.compensation?.amount || 0
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contract.terms?.compensation?.paymentSchedule}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Created
                      </p>
                      <p className="text-sm text-gray-900">
                        {formatDate(contract.createdAt)}
                      </p>
                      {contract.terms?.timeline && (
                        <p className="text-xs text-gray-500">
                          Ends: {formatDate(contract.terms.timeline.endDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timeline and Milestones */}
                  {contract.terms?.timeline?.milestones &&
                    contract.terms.timeline.milestones.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-500">
                            Milestones Progress
                          </p>
                          <span className="text-xs text-gray-500">
                            {getCompletedMilestones(
                              contract.terms.timeline.milestones
                            )}
                            /{contract.terms.timeline.milestones.length}{" "}
                            completed
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (getCompletedMilestones(
                                  contract.terms.timeline.milestones
                                ) /
                                  contract.terms.timeline.milestones.length) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                  {/* Signatures */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Signatures
                    </p>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        {contract.signatures?.brand?.signed ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ClockIcon className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          Brand:{" "}
                          {contract.signatures?.brand?.signed
                            ? "Signed"
                            : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {contract.signatures?.influencer?.signed ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ClockIcon className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          Influencer:{" "}
                          {contract.signatures?.influencer?.signed
                            ? "Signed"
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables */}
                  {contract.terms?.deliverables &&
                    contract.terms.deliverables.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Deliverables
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {contract.terms.deliverables
                            .slice(0, 3)
                            .map((deliverable, index) => (
                              <li key={index} className="flex items-start">
                                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                                {deliverable}
                              </li>
                            ))}
                          {contract.terms.deliverables.length > 3 && (
                            <li className="text-xs text-gray-500">
                              +{contract.terms.deliverables.length - 3} more
                              deliverables
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Disputes */}
                  {contract.disputes && contract.disputes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {contract.disputes.map((dispute, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-md ${
                            dispute.status === "open"
                              ? "bg-red-50 border border-red-200"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Dispute #{index + 1}
                                <span
                                  className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    dispute.status === "open"
                                      ? "bg-red-100 text-red-800"
                                      : dispute.status === "resolved"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {dispute.status}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {dispute.description}
                              </p>
                              {dispute.resolution && (
                                <p className="text-sm text-green-700 mt-2">
                                  <strong>Resolution:</strong>{" "}
                                  {dispute.resolution}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Raised on {formatDate(dispute.raisedAt)}
                                {dispute.resolvedAt &&
                                  ` • Resolved on ${formatDate(
                                    dispute.resolvedAt
                                  )}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Admin Notes */}
                  {contract.adminNotes && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Admin Notes:</strong> {contract.adminNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  {hasActiveDispute(contract) && (
                    <button
                      onClick={() => handleDisputeAction(contract)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      Resolve Dispute
                    </button>
                  )}

                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
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
                    pagination.totalContracts
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{pagination.totalContracts}</span>{" "}
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

      {/* Dispute Resolution Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resolve Contract Dispute
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Contract: <strong>{selectedContract?.campaign?.title}</strong>
                </p>
                {selectedContract?.disputes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Dispute:</strong>{" "}
                      {
                        selectedContract.disputes.find(
                          (d) => d.status === "open"
                        )?.description
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={disputeAction}
                  onChange={(e) => setDisputeAction(e.target.value)}
                >
                  <option value="">Select action...</option>
                  <option value="resolve">Resolve in favor of brand</option>
                  <option value="resolve_influencer">
                    Resolve in favor of influencer
                  </option>
                  <option value="cancel_contract">Cancel contract</option>
                  <option value="mediate">Require mediation</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Details
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Provide detailed resolution and reasoning..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDisputeAction}
                  disabled={!disputeAction || !resolution}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Resolve Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManager;
