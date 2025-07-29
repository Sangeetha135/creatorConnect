import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import adminService from "../../services/adminService";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: "all",
    status: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionUser, setActionUser] = useState(null);
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers(filters);
      setUsers(Array.isArray(data?.users) ? data.users : []);
      setPagination(data?.pagination || {});
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleUserAction = async (user, action) => {
    setActionUser(user);
    setActionType(action);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    try {
      if (actionType === "suspend" || actionType === "activate") {
        await adminService.suspendUser(
          actionUser._id,
          actionType,
          actionReason
        );
      } else if (actionType === "role_change") {
        await adminService.updateUserRole(actionUser._id, actionReason); // actionReason is the new role
      }
      
      await fetchUsers(); // Refresh the list
      setShowActionModal(false);
      setActionReason("");
      setActionUser(null);
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "admin-badge-completed";
      case "brand":
        return "admin-badge-pending";
      case "influencer":
        return "admin-badge-active";
      default:
        return "admin-badge-inactive";
    }
  };

  const getStatusIcon = (isVerified, suspendedAt) => {
    if (suspendedAt) {
      return <XCircleIcon style={{ width: '20px', height: '20px', color: '#DC2626' }} />;
    }
    return isVerified ? (
      <CheckCircleIcon style={{ width: '20px', height: '20px', color: '#059669' }} />
    ) : (
      <ExclamationTriangleIcon style={{ width: '20px', height: '20px', color: '#D97706' }} />
    );
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="admin-search-container">
        <input
          type="text"
          placeholder="Search users..."
          className="admin-search-input"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
        
        <select
          className="admin-filter-select"
          value={filters.role}
          onChange={(e) => handleFilterChange("role", e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="influencer">Influencers</option>
          <option value="brand">Brands</option>
          <option value="admin">Admins</option>
        </select>

        <select
          className="admin-filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          className="admin-filter-select"
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split("-");
            handleFilterChange("sortBy", sortBy);
            handleFilterChange("sortOrder", sortOrder);
          }}
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="admin-empty-state">
                    <UsersIcon className="admin-empty-state-icon" />
                    <div className="admin-empty-state-title">No users found</div>
                    <div className="admin-empty-state-text">Try adjusting your search or filter criteria</div>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#333' }}>{user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(user.isVerified, user.suspendedAt)}
                      <span className={`admin-badge admin-badge-${
                        user.suspendedAt ? 'inactive' :
                        user.isVerified ? 'active' : 'pending'
                      }`}>
                        {user.suspendedAt ? 'Suspended' :
                         user.isVerified ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: '#666', fontSize: '0.9rem' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ color: '#666', fontSize: '0.9rem' }}>
                    {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {user.suspendedAt ? (
                        <button
                          className="admin-btn admin-btn-success admin-btn-sm"
                          onClick={() => handleUserAction(user, 'activate')}
                        >
                          <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
                          Activate
                        </button>
                      ) : (
                        <button
                          className="admin-btn admin-btn-warning admin-btn-sm"
                          onClick={() => handleUserAction(user, 'suspend')}
                        >
                          <ExclamationTriangleIcon style={{ width: '16px', height: '16px' }} />
                          Suspend
                        </button>
                      )}
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => handleUserAction(user, 'role_change')}
                      >
                        <ShieldCheckIcon style={{ width: '16px', height: '16px' }} />
                        Role
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-pagination-btn"
            disabled={pagination.currentPage <= 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Previous
          </button>
          
          {[...Array(pagination.totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`admin-pagination-btn ${
                pagination.currentPage === index + 1 ? 'active' : ''
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            className="admin-pagination-btn"
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="admin-modal-overlay" onClick={() => setShowActionModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {actionType === 'suspend' ? 'Suspend User' :
                 actionType === 'activate' ? 'Activate User' : 'Change User Role'}
              </h3>
            </div>
            <div className="admin-modal-body">
              <p>
                Are you sure you want to {actionType === 'role_change' ? 'change the role of' : actionType} user <strong>{actionUser?.name}</strong>?
              </p>
              
              {actionType === 'role_change' ? (
                <div className="admin-form-group">
                  <label className="admin-form-label">New Role:</label>
                  <select
                    className="admin-form-select"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                  >
                    <option value="">Select Role</option>
                    <option value="influencer">Influencer</option>
                    <option value="brand">Brand</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ) : (
                <div className="admin-form-group">
                  <label className="admin-form-label">Reason:</label>
                  <textarea
                    className="admin-form-textarea"
                    placeholder="Provide a reason for this action..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowActionModal(false)}
              >
                Cancel
              </button>
              <button
                className={`admin-btn ${
                  actionType === 'suspend' ? 'admin-btn-danger' :
                  actionType === 'activate' ? 'admin-btn-success' : 'admin-btn-primary'
                }`}
                onClick={executeAction}
                disabled={!actionReason}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

      await fetchUsers(); // Refresh the list
      setShowActionModal(false);
      setActionReason("");
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "brand":
        return "bg-blue-100 text-blue-800";
      case "influencer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (isVerified, suspendedAt) => {
    if (suspendedAt) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
    return isVerified ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UsersIcon className="h-6 w-6 text-gray-900" />
          <h2 className="text-xl font-semibold text-gray-900">
            User Management
          </h2>
        </div>
        <div className="text-sm text-gray-500">
          Total: {pagination.totalUsers} users
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="brand">Brand</option>
            <option value="influencer">Influencer</option>
          </select>

          {/* Status Filter */}
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
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
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      {getStatusIcon(user.isVerified, user.suspendedAt)}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                      {user.companyName && (
                        <span className="text-xs text-gray-500">
                          {user.companyName}
                        </span>
                      )}
                      {user.totalCampaigns !== undefined && (
                        <span className="text-xs text-gray-500">
                          {user.totalCampaigns} campaigns
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {user.role !== "admin" && (
                    <>
                      {user.isVerified && !user.suspendedAt ? (
                        <button
                          onClick={() => handleUserAction(user, "suspend")}
                          className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user, "activate")}
                          className="inline-flex items-center px-3 py-1 border border-green-300 text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Activate
                        </button>
                      )}

                      <select
                        className="text-xs border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        value={user.role}
                        onChange={(e) => {
                          setActionUser(user);
                          setActionType("role_change");
                          setActionReason(e.target.value);
                          setShowActionModal(true);
                        }}
                      >
                        <option value="brand">Brand</option>
                        <option value="influencer">Influencer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </>
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
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
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
                    pagination.totalUsers
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.totalUsers}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.currentPage === i + 1
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
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
                {actionType === "suspend"
                  ? "Suspend User"
                  : actionType === "activate"
                  ? "Activate User"
                  : "Change User Role"}
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                User: <strong>{actionUser?.name}</strong> ({actionUser?.email})
              </p>

              {actionType !== "role_change" && (
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
              )}

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
                    actionType === "suspend"
                      ? "bg-red-600 hover:bg-red-700"
                      : actionType === "activate"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
