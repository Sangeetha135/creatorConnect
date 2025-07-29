import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/Login";
import RegisterChoice from "./pages/Register/RegisterChoice";
import BrandRegister from "./pages/BrandRegister";
import InfluencerRegister from "./pages/Register/InfluencerRegister";
import VerifyEmail from "./pages/VerifyEmail";
import BrandDashboard from "./pages/BrandDashboard";
import CreatorDashboard from "./pages/CreatorDashboard";
import PrivateRoute from "./components/PrivateRoute";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import Home from "./pages/Home";
import Profile from "./pages/Profile/Profile";
import UserProfile from "./pages/UserProfile";
import AuthNavbar from "./components/AuthNavbar";
import GuestNavbar from "./components/GuestNavbar";
import DashBoard from "./pages/DashBoard";
import CreatorSuggestions from "./pages/CreatorSuggestions";
import Notifications from "./pages/Notifications";
import AcceptedCampaigns from "./pages/AcceptedCampaigns";
import LandingPage from "./pages/LandingPage";
import BrowseCampaigns from "./pages/BrowseCampaigns";
import Messages from "./pages/Messages";
import { UnreadProvider } from "./context/UnreadContext";
import CompletedCampaigns from "./pages/CompletedCampaigns";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CampaignDetail from "./pages/CampaignDetail";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import Unauthorized from "./pages/Unauthorized";

const theme = createTheme();

function AppContent() {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <UnreadProvider>
        <Router>
          {user ? <AuthNavbar /> : <GuestNavbar />}
          <div style={{ paddingTop: "60px" }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterChoice />} />
              <Route path="/register/brand" element={<BrandRegister />} />
              <Route
                path="/register/influencer"
                element={<InfluencerRegister />}
              />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/youtube-success" element={<InfluencerRegister />} />
              <Route path="/youtube-error" element={<InfluencerRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route path="/profile/:userId" element={<UserProfile />} />

              <Route
                path="/brand/dashboard"
                element={
                  <PrivateRoute>
                    <BrandDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/creator/dashboard"
                element={
                  <PrivateRoute>
                    <CreatorDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardRouter />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/create" element={<CreateCampaign />} />
              <Route
                path="/campaigns/accepted"
                element={
                  <PrivateRoute>
                    <AcceptedCampaigns />
                  </PrivateRoute>
                }
              />
              <Route
                path="/campaigns/completed"
                element={<CompletedCampaigns />}
              />
              <Route
                path="/campaigns/:id/suggestions"
                element={
                  <PrivateRoute>
                    <CreatorSuggestions />
                  </PrivateRoute>
                }
              />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <Notifications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/browse-campaigns"
                element={
                  <PrivateRoute>
                    <BrowseCampaigns />
                  </PrivateRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <Messages />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </UnreadProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === "influencer") {
    return <Navigate to="/creator/dashboard" replace />;
  }
  if (user?.role === "brand") {
    return <Navigate to="/brand/dashboard" replace />;
  }
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default App;
