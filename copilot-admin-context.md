// Project: Influencer Marketing Platform Admin Panel
// Tech Stack: MERN (MongoDB, Express.js, React.js, Node.js)
// Description:
// This admin dashboard is part of a larger influencer marketing platform that connects brands with social media creators (YouTube/Instagram).
// The admin panel should allow system administrators to manage users, oversee campaigns, monitor payments, and maintain platform integrity.
// Backend should use Express.js with role-based route protection (admin-only access), and the frontend should be built with React.js (can use libraries like React Router, Axios, Tailwind or Material UI).
// MongoDB will store user, campaign, report, and transaction data. Use JWT authentication for access control.

// 🔐 Feature 1: User Management
// - Fetch and display all users (creators, brands, admins) with filters
// - Add controls to activate/deactivate/suspend users
// - Allow role update between creator, brand, admin
// - Show user activity: login timestamps, campaigns joined

// 📊 Feature 2: Platform Analytics Dashboard
// - Display stats: total users, active campaigns, completed campaigns
// - Show charts for user engagement trends
// - Highlight top creators and high-performing campaigns

// 🚩 Feature 3: Reports & Moderation
// - View flagged content and user-generated reports
// - Admin actions: warn user, delete content, suspend account

// 📁 Feature 4: Campaign Oversight
// - List all campaigns with status: active, upcoming, completed
// - Edit/delete fraudulent campaigns
// - View performance data: clicks, views, engagement metrics

// 💳 Feature 5: Payment Monitoring (Stripe Integration)
// - Display all transactions and payouts
// - Track payment disputes
// - Trigger manual refunds or payouts if required

// 🤖 Feature 6: Fake Follower & Bot Detection Logs
// - View accounts flagged for suspicious activity
// - Allow admin to confirm, warn, or ban such users

// 📜 Feature 7: Contract & Agreement Management
// - Upload/edit standard contract templates
// - Track agreement status per campaign
// - View and resolve disputes over contracts

// Goal: Implement protected routes, dynamic React components for each module, and connect them using Express API endpoints.
// Use MongoDB models for Users, Campaigns, Reports, Contracts, and Transactions.

# Project Overview

An influencer marketing platform connecting brands and creators using the MERN stack. Users include creators and brand accounts. Features include campaign creation, analytics, Stripe payments, messaging, and AI-based matching.

# Goal

Add a complete admin panel (React frontend + Express.js backend) with role-based access control. Admins should be able to:

1. View/manage users (roles, status)
2. View analytics dashboard
3. Moderate reports
4. Oversee campaigns
5. View payment logs and resolve disputes
6. Handle bot detection logs
7. Manage contracts and agreements

# Tech Stack

- MongoDB (Mongoose models)
- Express.js (API endpoints)
- React.js (admin panel UI)
- Node.js
- JWT for authentication
- Role-based access middleware (`isAdmin`)

# Existing Structure

- `routes/` contains user and campaign routes
- `models/` contains Mongoose schemas (User, Campaign, Report, Brand, Content, Influencer, Invitation, Message, Notification,Post)
- `client/` contains React components for brands and creators

# Admin Panel File Structure

## 🔧 Backend

- `routes/adminRoutes.js`: Defines all admin-related routes with isAdmin middleware.
- `controllers/adminController.js`: Handles all business logic for users, campaigns, reports, analytics, etc.
- `middleware/isAdmin.js`: Protects routes with admin-only access.
- `models/Contract.js`: (New) Mongoose model to store campaign agreements.
- `/api/admin/*`: Base path for all admin APIs.

## 🎨 Frontend (React)

- `src/pages/AdminDashboard.jsx`: Main dashboard entry point
- `src/components/admin/UserTable.jsx`: Displays and manages all users
- `src/components/admin/CampaignOverview.jsx`: Shows all campaigns
- `src/components/admin/AnalyticsCards.jsx`: Summary stats and insights
- `src/components/admin/ReportsList.jsx`: Moderate flagged content
- `src/components/admin/PaymentsTable.jsx`: Display and handle Stripe transactions
- `src/components/admin/ContractManager.jsx`: View and manage legal agreements
- `src/components/admin/BotDetectionLog.jsx`: See and act on suspicious accounts
- `src/routes/ProtectedAdminRoute.jsx`: Handles role-based admin-only routing
- `src/pages/Unauthorized.jsx`: Access denied screen for non-admins
