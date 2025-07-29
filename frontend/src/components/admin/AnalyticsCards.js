import React from "react";
import {
  UsersIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  MegaphoneIcon,
  CheckCircleIcon,
  ClockIcon,
  FlagIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const AnalyticsCards = ({ analyticsData }) => {
  if (!analyticsData) {
    return (
      <div className="admin-cards-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="admin-stat-card">
            <div className="admin-stat-header">
              <div
                className="admin-stat-icon"
                style={{ background: "#f0f0f0" }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    background: "#ddd",
                    borderRadius: "4px",
                  }}
                ></div>
              </div>
            </div>
            <div
              style={{
                height: "20px",
                background: "#f0f0f0",
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            ></div>
            <div
              style={{
                height: "16px",
                background: "#f0f0f0",
                borderRadius: "4px",
                width: "60%",
              }}
            ></div>
          </div>
        ))}
      </div>
    );
  }

  const { overview, charts, topCampaigns, recentActivity } = analyticsData;

  const statCards = [
    {
      title: "Total Users",
      value: overview.totalUsers,
      icon: UsersIcon,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Brands",
      value: overview.totalBrands,
      icon: BuildingOfficeIcon,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Influencers",
      value: overview.totalInfluencers,
      icon: UserGroupIcon,
      color: "bg-purple-500",
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Active Campaigns",
      value: overview.activeCampaigns,
      icon: MegaphoneIcon,
      color: "bg-yellow-500",
      change: "+5%",
      changeType: "positive",
    },
    {
      title: "Completed Campaigns",
      value: overview.completedCampaigns,
      icon: CheckCircleIcon,
      color: "bg-emerald-500",
      change: "+23%",
      changeType: "positive",
    },
    {
      title: "Pending Reports",
      value: overview.pendingReports,
      icon: FlagIcon,
      color: "bg-red-500",
      change: "-3%",
      changeType: "negative",
    },
    {
      title: "Total Transactions",
      value: overview.totalTransactions,
      icon: CreditCardIcon,
      color: "bg-indigo-500",
      change: "+18%",
      changeType: "positive",
    },
    {
      title: "Platform Revenue",
      value: `$${overview.totalRevenue?.toLocaleString() || 0}`,
      icon: CurrencyDollarIcon,
      color: "bg-pink-500",
      change: "+32%",
      changeType: "positive",
    },
  ];

  return (
    <div>
      {/* Overview Stats */}
      <div className="admin-cards-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="admin-stat-card">
            <div className="admin-stat-header">
              <div className="admin-stat-icon">
                <stat.icon />
              </div>
            </div>
            <h3 className="admin-stat-value">{stat.value}</h3>
            <p className="admin-stat-label">{stat.title}</p>
            <span className={`admin-stat-change ${stat.changeType}`}>
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* User Growth Chart */}
      {charts?.userGrowth && (
        <div className="admin-chart-container">
          <h3 className="admin-chart-title">User Growth</h3>
          <div
            style={{
              height: "256px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            {charts.userGrowth.slice(-12).map((month, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
                    borderRadius: "4px 4px 0 0",
                    width: "100%",
                    height: `${Math.max(
                      (month.users /
                        Math.max(...charts.userGrowth.map((m) => m.users))) *
                        100,
                      5
                    )}%`,
                  }}
                ></div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    marginTop: "8px",
                    transform: "rotate(-45deg)",
                    transformOrigin: "center",
                  }}
                >
                  {month.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Campaigns */}
      {topCampaigns && topCampaigns.length > 0 && (
        <div className="admin-chart-container">
          <h3 className="admin-chart-title">Top Performing Campaigns</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {topCampaigns.slice(0, 5).map((campaign, index) => (
              <div
                key={campaign._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: index < 4 ? "1px solid #f1f1f1" : "none",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "#333",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {campaign.title}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>
                    by {campaign.brand?.name}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "#333",
                      margin: "0 0 4px 0",
                    }}
                  >
                    ${campaign.budget?.toLocaleString()}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>
                    Budget
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {/* New Users */}
          <div className="admin-chart-container">
            <h4 className="admin-chart-title">Recent Users</h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {recentActivity.newUsers?.slice(0, 5).map((user) => (
                <div
                  key={user._id}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      background:
                        "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "#333",
                        margin: "0 0 2px 0",
                      }}
                    >
                      {user.name}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>
                      <span
                        className={`admin-badge admin-badge-${
                          user.role === "brand" ? "pending" : "active"
                        }`}
                      >
                        {user.role}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Campaigns */}
          <div className="admin-chart-container">
            <h4 className="admin-chart-title">Recent Campaigns</h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {recentActivity.newCampaigns?.slice(0, 5).map((campaign) => (
                <div
                  key={campaign._id}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background:
                        campaign.status === "active"
                          ? "#059669"
                          : campaign.status === "pending"
                          ? "#D97706"
                          : "#666",
                    }}
                  ></div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "#333",
                        margin: "0 0 2px 0",
                      }}
                    >
                      {campaign.title}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>
                      by {campaign.brand?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Reports */}
          <div className="admin-chart-container">
            <h4 className="admin-chart-title">Recent Reports</h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {recentActivity.newReports?.slice(0, 5).map((report) => (
                <div
                  key={report._id}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <FlagIcon
                    style={{
                      width: "16px",
                      height: "16px",
                      color:
                        report.severity === "high"
                          ? "#DC2626"
                          : report.severity === "medium"
                          ? "#D97706"
                          : "#666",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "#333",
                        margin: "0 0 2px 0",
                      }}
                    >
                      {report.category}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>
                      by {report.reportedBy?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCards;
