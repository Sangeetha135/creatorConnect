import React, { useState, useEffect } from "react";
import {
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import adminService from "../../services/adminService";

const PaymentsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    type: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [action, setAction] = useState("");
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPaymentLogs(filters);
      setTransactions(
        Array.isArray(data?.transactions) ? data.transactions : []
      );
      setSummary(Array.isArray(data?.summary) ? data.summary : []);
      setPagination(data?.pagination || {});
    } catch (error) {
      console.error("Error fetching payments:", error);
      setTransactions([]);
      setSummary([]);
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

  const handlePaymentAction = (transaction, actionType) => {
    setSelectedTransaction(transaction);
    setAction(actionType);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    try {
      await adminService.handlePayment(
        selectedTransaction._id,
        action,
        actionReason
      );
      await fetchPayments(); // Refresh the list
      setShowActionModal(false);
      setActionReason("");
      setAction("");
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "disputed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "campaign_payment":
        return "bg-blue-100 text-blue-800";
      case "platform_fee":
        return "bg-green-100 text-green-800";
      case "refund":
        return "bg-red-100 text-red-800";
      case "bonus":
        return "bg-purple-100 text-purple-800";
      case "withdrawal":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "failed":
      case "cancelled":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "disputed":
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <CreditCardIcon className="h-5 w-5 text-gray-500" />;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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
          <CreditCardIcon className="h-6 w-6 text-gray-900" />
          <h2 className="text-xl font-semibold text-gray-900">
            Payment Management
          </h2>
        </div>
        <div className="text-sm text-gray-500">
          Total: {pagination.totalTransactions} transactions
        </div>
      </div>

      {/* Summary Cards */}
      {summary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {summary.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase">
                    {item._id || "Unknown"}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {item.count}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.totalAmount)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getStatusColor(item._id)}`}>
                  {getStatusIcon(item._id)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
          </select>

          {/* Type Filter */}
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="campaign_payment">Campaign Payment</option>
            <option value="platform_fee">Platform Fee</option>
            <option value="refund">Refund</option>
            <option value="bonus">Bonus</option>
            <option value="withdrawal">Withdrawal</option>
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
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
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

      {/* Transactions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <li key={transaction._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(transaction.status)}
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          transaction.type
                        )}`}
                      >
                        {transaction.type.replace("_", " ")}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">From</p>
                      <p className="text-sm text-gray-900">
                        {transaction.payer?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.payer?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">To</p>
                      <p className="text-sm text-gray-900">
                        {transaction.recipient?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.recipient?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Payment Method
                      </p>
                      <p className="text-sm text-gray-900">
                        {transaction.paymentMethod}
                      </p>
                      {transaction.campaign && (
                        <p className="text-xs text-gray-500">
                          Campaign: {transaction.campaign.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(transaction.createdAt)}
                      </p>
                      {transaction.fees?.totalFees > 0 && (
                        <p className="text-xs text-gray-500">
                          Fees: {formatCurrency(transaction.fees.totalFees)}
                        </p>
                      )}
                    </div>
                  </div>

                  {transaction.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {transaction.description}
                      </p>
                    </div>
                  )}

                  {transaction.dispute?.isDisputed && (
                    <div className="mt-2 p-2 bg-orange-50 rounded-md">
                      <p className="text-sm text-orange-800">
                        <strong>Disputed:</strong>{" "}
                        {transaction.dispute.disputeReason}
                      </p>
                      {transaction.dispute.resolution && (
                        <p className="text-sm text-orange-700">
                          <strong>Resolution:</strong>{" "}
                          {transaction.dispute.resolution}
                        </p>
                      )}
                    </div>
                  )}

                  {transaction.adminNotes && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Admin Notes:</strong> {transaction.adminNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {transaction.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handlePaymentAction(transaction, "approve")
                        }
                        className="inline-flex items-center px-3 py-1 border border-green-300 text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handlePaymentAction(transaction, "refund")
                        }
                        className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Refund
                      </button>
                    </>
                  )}

                  {(transaction.status === "completed" ||
                    transaction.status === "processing") &&
                    !transaction.dispute?.isDisputed && (
                      <button
                        onClick={() =>
                          handlePaymentAction(transaction, "dispute")
                        }
                        className="inline-flex items-center px-3 py-1 border border-orange-300 text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        Mark Disputed
                      </button>
                    )}
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
                    pagination.totalTransactions
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {pagination.totalTransactions}
                </span>{" "}
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
                Payment Action
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Transaction:{" "}
                  <strong>{formatCurrency(selectedTransaction?.amount)}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Action: <strong>{action}</strong>
                </p>
              </div>

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
                    action === "refund"
                      ? "bg-red-600 hover:bg-red-700"
                      : action === "dispute"
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Confirm {action}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTable;
