import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  ChartBarIcon,
  FlagIcon,
  MegaphoneIcon,
  CreditCardIcon,
  ShieldExclamationIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// Import Admin Components
import UserTable from "../components/admin/UserTable";
import AnalyticsCards from "../components/admin/AnalyticsCards";
import ReportsList from "../components/admin/ReportsList";
import CampaignOverview from "../components/admin/CampaignOverview";
import PaymentsTable from "../components/admin/PaymentsTable";
import BotDetectionLog from "../components/admin/BotDetectionLog";
import ContractManager from "../components/admin/ContractManager";

import adminService from "../services/adminService";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { name: "Analytics", icon: ChartBarIcon, component: AnalyticsCards },
    { name: "Users", icon: UsersIcon, component: UserTable },
    { name: "Campaigns", icon: MegaphoneIcon, component: CampaignOverview },
    { name: "Reports", icon: FlagIcon, component: ReportsList },
    { name: "Payments", icon: CreditCardIcon, component: PaymentsTable },
    {
      name: "Bot Detection",
      icon: ShieldExclamationIcon,
      component: BotDetectionLog,
    },
    { name: "Contracts", icon: DocumentTextIcon, component: ContractManager },
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const data = await adminService.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
      </div>
    );
  }

  const ActiveComponent = tabs[selectedIndex].component;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage users, campaigns, payments, and platform integrity
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="admin-content">
        {/* Tab Navigation */}
        <div className="admin-tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              className={`admin-tab ${selectedIndex === index ? "active" : ""}`}
              onClick={() => setSelectedIndex(index)}
            >
              <tab.icon className="admin-tab-icon" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="admin-tab-panel admin-fade-in">
          <ActiveComponent
            analyticsData={analyticsData}
            refreshAnalytics={fetchAnalyticsData}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
