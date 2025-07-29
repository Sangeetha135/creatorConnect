import React, { useState, useEffect } from "react";
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import adminService from "../../services/adminService";

const BotDetectionLog = () => {
  const [suspiciousAccounts, setSuspiciousAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [action, setAction] = useState("");
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    fetchBotLogs();
  }, []);

  const fetchBotLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBotLogs();
      setSuspiciousAccounts(
        Array.isArray(data?.suspiciousAccounts) ? data.suspiciousAccounts : []
      );
      setLastUpdated(data?.lastUpdated);
    } catch (error) {
      console.error("Error fetching bot logs:", error);
      setSuspiciousAccounts([]);
      setLastUpdated(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountAction = (account, actionType) => {
    setSelectedAccount(account);
    setAction(actionType);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    try {
      await adminService.handleSuspiciousAccount(
        selectedAccount._id,
        action,
        actionReason
      );
      await fetchBotLogs(); // Refresh the list
      setShowActionModal(false);
      setActionReason("");
      setAction("");
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  const getSuspicionLevel = (score) => {
    if (score >= 70)
      return {
        level: "Critical",
        color: "bg-red-100 text-red-800",
        icon: "text-red-500",
      };
    if (score >= 50)
      return {
        level: "High",
        color: "bg-orange-100 text-orange-800",
        icon: "text-orange-500",
      };
    if (score >= 30)
      return {
        level: "Medium",
        color: "bg-yellow-100 text-yellow-800",
        icon: "text-yellow-500",
      };
    return {
      level: "Low",
      color: "bg-blue-100 text-blue-800",
      icon: "text-blue-500",
    };
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
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
          <ShieldExclamationIcon className="h-6 w-6 text-gray-900" />
          <h2 className="text-xl font-semibold text-gray-900">Bot Detection</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchBotLogs}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh Scan
          </button>
          <div className="text-sm text-gray-500">
            {suspiciousAccounts.length} flagged accounts
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Bot Detection System
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Accounts are flagged based on suspicious patterns including:
              </p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>
                  Unusually high follower counts with low engagement rates
                </li>
                <li>Recently created accounts with immediate high activity</li>
                <li>Irregular posting patterns and content quality</li>
                <li>Suspicious social media metrics</li>
              </ul>
              {lastUpdated && (
                <p className="mt-2 text-xs">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suspicious Accounts */}
      {suspiciousAccounts.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No suspicious accounts detected
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            All accounts appear to be legitimate based on current detection
            criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {suspiciousAccounts.map((account) => {
              const suspicion = getSuspicionLevel(account.suspicionScore);
              return (
                <li key={account._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-lg font-medium text-gray-900 truncate">
                              {account.name}
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${suspicion.color}`}
                            >
                              {suspicion.level} Risk
                            </span>
                            <span className="text-sm font-medium text-gray-600">
                              Score: {account.suspicionScore}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {account.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Account Created
                          </p>
                          <p className="text-sm text-gray-900">
                            {formatDate(account.createdAt)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.floor(
                              (Date.now() - new Date(account.createdAt)) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            days ago
                          </p>
                        </div>

                        {account.socialMedia?.youtube && (
                          <>
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                YouTube Subscribers
                              </p>
                              <p className="text-sm text-gray-900">
                                {formatNumber(
                                  account.socialMedia.youtube.subscribers
                                )}
                              </p>
                              {account.socialMedia.youtube.subscribers >
                                500000 && (
                                <p className="text-xs text-red-500">
                                  ⚠ High follower count
                                </p>
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Engagement Rate
                              </p>
                              <p className="text-sm text-gray-900">
                                {(
                                  account.socialMedia.youtube.engagementRate *
                                    100 || 0
                                ).toFixed(2)}
                                %
                              </p>
                              {account.socialMedia.youtube.engagementRate <
                                0.01 && (
                                <p className="text-xs text-red-500">
                                  ⚠ Low engagement
                                </p>
                              )}
                            </div>
                          </>
                        )}

                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Risk Factors
                          </p>
                          <div className="space-y-1">
                            {account.socialMedia?.youtube?.subscribers >
                              500000 && (
                              <p className="text-xs text-red-600">
                                • High follower count
                              </p>
                            )}
                            {account.socialMedia?.youtube?.engagementRate <
                              0.01 && (
                              <p className="text-xs text-red-600">
                                • Low engagement rate
                              </p>
                            )}
                            {Date.now() - new Date(account.createdAt) <
                              24 * 60 * 60 * 1000 && (
                              <p className="text-xs text-red-600">
                                • New account
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {account.flagReason && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Previous Flag:</strong> {account.flagReason}
                          </p>
                        </div>
                      )}

                      {account.botVerificationStatus && (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              account.botVerificationStatus === "verified"
                                ? "bg-green-100 text-green-800"
                                : account.botVerificationStatus === "flagged"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {account.botVerificationStatus}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {account.botVerificationStatus !== "verified" && (
                        <button
                          onClick={() => handleAccountAction(account, "verify")}
                          className="inline-flex items-center px-3 py-1 border border-green-300 text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Verify
                        </button>
                      )}

                      {account.botVerificationStatus !== "flagged" && (
                        <button
                          onClick={() => handleAccountAction(account, "flag")}
                          className="inline-flex items-center px-3 py-1 border border-yellow-300 text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          Flag
                        </button>
                      )}

                      <button
                        onClick={() => handleAccountAction(account, "ban")}
                        className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Ban
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {action === "verify"
                  ? "Verify Account"
                  : action === "flag"
                  ? "Flag Account"
                  : "Ban Account"}
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Account: <strong>{selectedAccount?.name}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Suspicion Score:{" "}
                  <strong>{selectedAccount?.suspicionScore}</strong>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {action === "verify" ? "Verification Notes" : "Reason"}
                </label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={
                    action === "verify"
                      ? "Why is this account legitimate?"
                      : action === "flag"
                      ? "Why is this account suspicious?"
                      : "Reason for banning this account..."
                  }
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
                    action === "verify"
                      ? "bg-green-600 hover:bg-green-700"
                      : action === "flag"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-red-600 hover:bg-red-700"
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

export default BotDetectionLog;
