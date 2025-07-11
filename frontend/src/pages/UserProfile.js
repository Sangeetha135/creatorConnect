import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Tab,
  Tabs,
  Button,
  Link,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import LanguageIcon from "@mui/icons-material/Language";
import LinkIcon from "@mui/icons-material/Link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <text
        x={x}
        y={y}
        fill="#333333"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 15}
        fill="#666666"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="11"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

const renderYouTubeStats = (youtube) => {
  if (!youtube) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight="500" sx={{ mb: 3 }}>
        YouTube Channel Statistics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(33, 150, 243, 0.25)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                Subscribers
              </Typography>
              <Typography variant="h4" fontWeight="600">
                {youtube.subscriberCount?.toLocaleString() || "0"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: "linear-gradient(45deg, #4CAF50 30%, #81C784 90%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(76, 175, 80, 0.25)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                Total Views
              </Typography>
              <Typography variant="h4" fontWeight="600">
                {youtube.totalViews?.toLocaleString() || "0"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: "linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(255, 152, 0, 0.25)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                Engagement Rate
              </Typography>
              <Typography variant="h4" fontWeight="600">
                {(youtube.engagementRate || 0).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const renderAnalyticsCharts = (analytics) => {
  if (!analytics?.monthlyStats?.length) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="500" gutterBottom>
            Monthly Performance
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ height: 350, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.monthlyStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: "#e0e0e0" }}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#8884d8"
                  tickLine={false}
                  axisLine={{ stroke: "#e0e0e0" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#82ca9d"
                  tickLine={false}
                  axisLine={{ stroke: "#e0e0e0" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    border: "none",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 15 }}
                  iconType="circle"
                  iconSize={10}
                />
                <Bar
                  yAxisId="left"
                  dataKey="views"
                  name="Views"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="engagement"
                  name="Engagement"
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const renderDemographics = (demographics) => {
  if (!demographics) return null;

  const ageData = Object.entries(demographics.ageGroups || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const locationData = Object.entries(demographics.locations || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <p
            style={{ margin: 0, fontWeight: 500 }}
          >{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="500" gutterBottom>
            Audience Demographics
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 2,
                  height: "380px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #f2f2f2",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="500"
                  gutterBottom
                  align="center"
                >
                  Age Distribution
                </Typography>
                <Box sx={{ flex: 1, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ageData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={renderCustomizedLabel}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ageData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        formatter={(value, entry, index) => (
                          <span
                            style={{
                              color: "#333333",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            {value}
                          </span>
                        )}
                        iconSize={10}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: 15 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 2,
                  height: "380px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #f2f2f2",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="500"
                  gutterBottom
                  align="center"
                >
                  Geographic Distribution
                </Typography>
                <Box sx={{ flex: 1, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={renderCustomizedLabel}
                        outerRadius={110}
                        fill="#82ca9d"
                        dataKey="value"
                      >
                        {locationData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        formatter={(value, entry, index) => (
                          <span
                            style={{
                              color: "#333333",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            {value}
                          </span>
                        )}
                        iconSize={10}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: 15 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

const renderCampaignStats = (campaignStats) => {
  console.log("Rendering campaign stats:", campaignStats);
  if (!campaignStats) {
    console.log("No campaign stats available");
    return null;
  }

  const normalizedStats = {
    "Total Campaigns": campaignStats.total || campaignStats.totalCampaigns || 0,
    "Active Campaigns":
      campaignStats.active || campaignStats.activeCampaigns || 0,
    "Completed Campaigns":
      campaignStats.completed || campaignStats.completedCampaigns || 0,
    "Success Rate": `${
      campaignStats.successRate ||
      (campaignStats.completedCampaigns && campaignStats.totalCampaigns
        ? (
            (campaignStats.completedCampaigns / campaignStats.totalCampaigns) *
            100
          ).toFixed(1)
        : 0)
    }%`,
    "Total Earnings": `$${(campaignStats.totalEarnings || 0).toLocaleString()}`,
  };

  const cardColors = [
    {
      bg: "linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)",
      shadow: "rgba(63, 81, 181, 0.25)",
    },
    {
      bg: "linear-gradient(45deg, #f44336 30%, #e57373 90%)",
      shadow: "rgba(244, 67, 54, 0.25)",
    },
    {
      bg: "linear-gradient(45deg, #009688 30%, #4db6ac 90%)",
      shadow: "rgba(0, 150, 136, 0.25)",
    },
    {
      bg: "linear-gradient(45deg, #673ab7 30%, #9575cd 90%)",
      shadow: "rgba(103, 58, 183, 0.25)",
    },
    {
      bg: "linear-gradient(45deg, #e91e63 30%, #f48fb1 90%)",
      shadow: "rgba(233, 30, 99, 0.25)",
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight="500" sx={{ mb: 3 }}>
        Campaign Statistics
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(normalizedStats).map(([label, value], index) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            <Card
              sx={{
                borderRadius: 2,
                background: cardColors[index].bg,
                color: "white",
                boxShadow: `0 4px 20px ${cardColors[index].shadow}`,
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                  {label}
                </Typography>
                <Typography variant="h4" fontWeight="600">
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const { userId } = useParams();
  const location = useLocation();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Current user:", currentUser);
        console.log("Target userId:", userId);

        setLoading(true);
        const isOwnProfile = location.pathname === "/profile";
        const targetUserId = isOwnProfile ? currentUser?._id : userId;

        console.log("Fetching profile for userId:", targetUserId);
        const response = await api.get(`/api/users/profile/${targetUserId}`);
        console.log("Profile API response:", response.data);

        console.log("Fetching campaign stats for userId:", targetUserId);
        const statsResponse = await api.get(
          `/api/users/campaign-stats/${targetUserId}`
        );
        console.log("Campaign stats API response:", statsResponse.data);

        const profileData = {
          ...response.data,
          campaignStats: statsResponse.data,
        };

        console.log("Final profile data being set:", profileData);
        setProfile(profileData);
        setError(null);
      } catch (err) {
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch profile. Please try again later.";
        console.error("Error message:", errorMessage);
        setError(errorMessage);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId || location.pathname === "/profile") {
      fetchProfile();
    }
  }, [userId, location.pathname, currentUser]);

  console.log("Current profile state:", profile);
  console.log("Current loading state:", loading);
  console.log("Current error state:", error);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">Profile not found</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "flex-start" },
            mb: 4,
          }}
        >
          <Avatar
            src={profile.profilePicture}
            sx={{
              width: { xs: 100, sm: 120 },
              height: { xs: 100, sm: 120 },
              mb: { xs: 2, sm: 0 },
              mr: { xs: 0, sm: 4 },
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {profile.role === "brand" ? (
              <BusinessIcon fontSize="large" />
            ) : (
              <PersonIcon fontSize="large" />
            )}
          </Avatar>
          <Box
            sx={{
              textAlign: { xs: "center", sm: "left" },
              mb: { xs: 2, sm: 0 },
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="600">
              {profile.name}
            </Typography>
            <Chip
              label={profile.role === "brand" ? "Brand" : "Influencer"}
              sx={{
                my: 1,
                bgcolor:
                  profile.role === "brand" ? "secondary.main" : "primary.main",
                color: "white",
                fontWeight: 500,
              }}
            />
            {profile.role === "brand" && profile.companyName && (
              <Typography variant="h6" color="text.secondary">
                {profile.companyName}
              </Typography>
            )}
            {profile.role === "influencer" && profile.youtube?.channelName && (
              <Typography variant="h6" color="text.secondary">
                {profile.youtube.channelName}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                fontWeight: 500,
                fontSize: "1rem",
                textTransform: "none",
              },
            }}
          >
            <Tab label="Profile" value="profile" />
            {profile.role === "influencer" && (
              <Tab label="Analytics" value="analytics" />
            )}
          </Tabs>
        </Box>

        {activeTab === "profile" ? (
          <Grid container spacing={3}>
            {profile.role === "brand" ? (
              <>
                {profile.website && (
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        border: "1px solid #f2f2f2",
                      }}
                    >
                      <Typography variant="h6" fontWeight="500" gutterBottom>
                        Website
                      </Typography>
                      <Link
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "primary.main",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        <LanguageIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                        <Typography variant="body1">
                          {profile.website}
                        </Typography>
                      </Link>
                    </Card>
                  </Grid>
                )}
                <Grid item xs={12}>
                  {renderCampaignStats(profile.campaignStats)}
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      border: "1px solid #f2f2f2",
                    }}
                  >
                    <Typography variant="h6" fontWeight="500" gutterBottom>
                      Bio
                    </Typography>
                    <Typography color="text.secondary">
                      {profile.bio || "No bio available"}
                    </Typography>
                  </Card>
                </Grid>
                {profile.categories && profile.categories.length > 0 && (
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        border: "1px solid #f2f2f2",
                      }}
                    >
                      <Typography variant="h6" fontWeight="500" gutterBottom>
                        Categories
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {profile.categories.map((category, index) => (
                          <Chip
                            key={index}
                            label={category}
                            sx={{
                              fontWeight: 500,
                              bgcolor: "rgba(63, 81, 181, 0.1)",
                              color: "primary.main",
                            }}
                          />
                        ))}
                      </Box>
                    </Card>
                  </Grid>
                )}
                {profile.location && (
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        border: "1px solid #f2f2f2",
                      }}
                    >
                      <Typography variant="h6" fontWeight="500" gutterBottom>
                        Location
                      </Typography>
                      <Typography>{profile.location}</Typography>
                    </Card>
                  </Grid>
                )}
                <Grid item xs={12}>
                  {renderCampaignStats(profile.campaignStats)}
                </Grid>
              </>
            )}
          </Grid>
        ) : (
          <Box>
            {renderYouTubeStats(profile.youtube)}
            {renderAnalyticsCharts(profile.youtube?.analytics)}
            {renderDemographics(profile.youtube?.demographics)}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default UserProfile;
