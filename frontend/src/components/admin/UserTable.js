import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
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
      return (
        <XCircleIcon
          style={{ width: "20px", height: "20px", color: "#DC2626" }}
        />
      );
    }
    return isVerified ? (
      <CheckCircleIcon
        style={{ width: "20px", height: "20px", color: "#059669" }}
      />
    ) : (
      <ExclamationTriangleIcon
        style={{ width: "20px", height: "20px", color: "#D97706" }}
      />
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
                    <div className="admin-empty-state-title">
                      No users found
                    </div>
                    <div className="admin-empty-state-text">
                      Try adjusting your search or filter criteria
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "600",
                          fontSize: "1rem",
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: "500", color: "#333" }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {getStatusIcon(user.isVerified, user.suspendedAt)}
                      <span
                        className={`admin-badge admin-badge-${
                          user.suspendedAt
                            ? "inactive"
                            : user.isVerified
                            ? "active"
                            : "pending"
                        }`}
                      >
                        {user.suspendedAt
                          ? "Suspended"
                          : user.isVerified
                          ? "Active"
                          : "Pending"}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: "#666", fontSize: "0.9rem" }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ color: "#666", fontSize: "0.9rem" }}>
                    {user.lastActive
                      ? new Date(user.lastActive).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {user.suspendedAt ? (
                        <button
                          className="admin-btn admin-btn-success admin-btn-sm"
                          onClick={() => handleUserAction(user, "activate")}
                        >
                          <CheckCircleIcon
                            style={{ width: "16px", height: "16px" }}
                          />
                          Activate
                        </button>
                      ) : (
                        <button
                          className="admin-btn admin-btn-warning admin-btn-sm"
                          onClick={() => handleUserAction(user, "suspend")}
                        >
                          <ExclamationTriangleIcon
                            style={{ width: "16px", height: "16px" }}
                          />
                          Suspend
                        </button>
                      )}
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => handleUserAction(user, "role_change")}
                      >
                        <ShieldCheckIcon
                          style={{ width: "16px", height: "16px" }}
                        />
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
                pagination.currentPage === index + 1 ? "active" : ""
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
        <div
          className="admin-modal-overlay"
          onClick={() => setShowActionModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {actionType === "suspend"
                  ? "Suspend User"
                  : actionType === "activate"
                  ? "Activate User"
                  : "Change User Role"}
              </h3>
            </div>
            <div className="admin-modal-body">
              <p>
                Are you sure you want to{" "}
                {actionType === "role_change"
                  ? "change the role of"
                  : actionType}{" "}
                user <strong>{actionUser?.name}</strong>?
              </p>

              {actionType === "role_change" ? (
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
                  actionType === "suspend"
                    ? "admin-btn-danger"
                    : actionType === "activate"
                    ? "admin-btn-success"
                    : "admin-btn-primary"
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
};

export default UserTable;
