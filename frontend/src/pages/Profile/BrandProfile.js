import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdVerified, MdBusiness, MdLanguage } from "react-icons/md";
import { Box, Typography, Paper, Grid, Avatar, Chip } from "@mui/material";
import api from "../../services/api";
import "./BrandProfile.css";

const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const safeGet = (obj, path, defaultValue = 0) => {
  try {
    const result = path.split(".").reduce((o, key) => (o || {})[key], obj);
    return result !== undefined ? result : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const BrandProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (user?.token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
        }

        const profileResponse = await api.get("/api/users/profile");
        const statsResponse = await api.get(
          `/api/users/campaign-stats/${user._id}`
        );

        const combinedData = {
          ...profileResponse.data,
          campaignStats: {
            totalCampaigns: statsResponse.data.totalCampaigns || 0,
            activeCampaigns: statsResponse.data.activeCampaigns || 0,
            completedCampaigns: statsResponse.data.completedCampaigns || 0,
            pendingCampaigns: statsResponse.data.pendingCampaigns || 0,
            cancelledCampaigns: statsResponse.data.cancelledCampaigns || 0,
            totalInfluencers: statsResponse.data.totalInfluencers || 0,
            totalEarnings: statsResponse.data.totalEarnings || 0,
            successRate: statsResponse.data.successRate || 0,
            totalReach: profileResponse.data.campaignStats?.totalReach || 0,
          },
        };

        setProfileData(combinedData);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile data");
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchProfileData();
    }
  }, [user]);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="brand-profile-container">
      <Paper elevation={3} className="brand-header">
        <Box className="brand-cover"></Box>
        <Box className="brand-info">
          <Avatar
            src={
              profileData?.logoUrl ||
              `https://ui-avatars.com/api/?name=${
                profileData?.companyName || "Brand"
              }&background=random`
            }
            alt={profileData?.companyName}
            className="brand-logo"
          />
          <Box className="brand-details">
            <Box className="brand-name">
              <Typography variant="h4" component="h1">
                {profileData?.companyName}
              </Typography>
              {profileData?.isVerified && (
                <MdVerified className="verified-icon" title="Verified Brand" />
              )}
            </Box>
            <Typography variant="subtitle1" className="brand-industry">
              <MdBusiness /> {profileData?.industry || "Industry not specified"}
            </Typography>
            {profileData?.website && (
              <Typography variant="subtitle1" className="brand-website">
                <MdLanguage />
                <a
                  href={profileData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profileData.website}
                </a>
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3} className="brand-content">
        <Grid item xs={12} md={8}>
          <Paper elevation={2} className="brand-section">
            <Typography variant="h5" component="h2">
              About Us
            </Typography>
            <Typography variant="body1">
              {profileData?.description || "No description available"}
            </Typography>
          </Paper>

          <Paper elevation={2} className="brand-section">
            <Typography variant="h5" component="h2">
              Campaign Statistics
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "primary.light",
                    borderRadius: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <Typography variant="h4">
                    {safeGet(profileData, "campaignStats.totalCampaigns")}
                  </Typography>
                  <Typography variant="body2">Total Campaigns</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "success.light",
                    borderRadius: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <Typography variant="h4">
                    {safeGet(profileData, "campaignStats.completedCampaigns")}
                  </Typography>
                  <Typography variant="body2">Completed Campaigns</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "warning.light",
                    borderRadius: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <Typography variant="h4">
                    {safeGet(profileData, "campaignStats.activeCampaigns")}
                  </Typography>
                  <Typography variant="body2">Active Campaigns</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "info.light",
                    borderRadius: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <Typography variant="h4">
                    {safeGet(profileData, "campaignStats.pendingCampaigns")}
                  </Typography>
                  <Typography variant="body2">Pending Campaigns</Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "secondary.light",
                    borderRadius: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <Typography variant="h4">
                    {safeGet(profileData, "campaignStats.totalInfluencers")}
                  </Typography>
                  <Typography variant="body2">Total Influencers</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "error.light",
                    borderRadius: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <Typography variant="h4">
                    $
                    {formatCurrency(
                      safeGet(profileData, "campaignStats.totalEarnings")
                    )}
                  </Typography>
                  <Typography variant="body2">Total Budget</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "success.dark",
                    borderRadius: 2,
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  <Typography variant="h4">
                    {safeGet(profileData, "campaignStats.successRate")}%
                  </Typography>
                  <Typography variant="body2">Success Rate</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} className="brand-section">
            <Typography variant="h5" component="h2">
              Contact Information
            </Typography>
            <Box className="contact-info">
              <Typography variant="body1">
                <strong>Email:</strong> {profileData?.email}
              </Typography>
              {profileData?.phone && (
                <Typography variant="body1">
                  <strong>Phone:</strong> {profileData.phone}
                </Typography>
              )}
              {profileData?.location && (
                <Typography variant="body1">
                  <strong>Location:</strong> {profileData.location}
                </Typography>
              )}
            </Box>
          </Paper>

          <Paper elevation={2} className="brand-section">
            <Typography variant="h5" component="h2">
              Preferred Categories
            </Typography>
            <Box className="categories-container">
              {(profileData?.preferredCategories || []).map(
                (category, index) => (
                  <Chip
                    key={index}
                    label={category}
                    className="category-chip"
                    variant="outlined"
                  />
                )
              )}
              {(!profileData?.preferredCategories ||
                profileData.preferredCategories.length === 0) && (
                <Typography variant="body2">
                  No preferred categories specified
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default BrandProfile;
