import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  LinearProgress,
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

const YouTubeAnalytics = ({ analytics }) => {
  const theme = useTheme();

  if (!analytics) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          No YouTube analytics available
        </Typography>
      </Box>
    );
  }

  const {
    channelName,
    subscriberCount,
    totalViews,
    totalVideos,
    averageViews,
    demographics,
    analytics: channelAnalytics,
    contentStats,
    lastUpdated,
  } = analytics;

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toLocaleString() || "0";
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Box sx={{ py: 3 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                {channelName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {formatDistanceToNow(new Date(lastUpdated))} ago
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <Chip
                  label={`${formatNumber(subscriberCount)} subscribers`}
                  color="primary"
                />
                <Chip
                  label={`${formatNumber(totalViews)} total views`}
                  color="secondary"
                />
                <Chip
                  label={`${formatNumber(contentStats.totalVideos)} videos`}
                  color="default"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: "center",
              bgcolor: "primary.light",
              color: "primary.dark",
            }}
          >
            <Typography variant="h6">
              {formatNumber(channelAnalytics.viewsLast30Days)}
            </Typography>
            <Typography variant="body2">Views (30 days)</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: "center",
              bgcolor: "secondary.light",
              color: "secondary.dark",
            }}
          >
            <Typography variant="h6">
              {formatNumber(channelAnalytics.subscribersGainedLast30Days)}
            </Typography>
            <Typography variant="body2">New Subscribers (30 days)</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: "center",
              bgcolor: "success.light",
              color: "success.dark",
            }}
          >
            <Typography variant="h6">
              {formatDuration(channelAnalytics.averageViewDuration)}
            </Typography>
            <Typography variant="body2">Avg. View Duration</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: "center",
              bgcolor: "warning.light",
              color: "warning.dark",
            }}
          >
            <Typography variant="h6">
              {channelAnalytics.engagementRateLast30Days.toFixed(2)}%
            </Typography>
            <Typography variant="body2">Engagement Rate</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Age Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demographics.ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="percentage"
                      fill={theme.palette.primary.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gender Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Male",
                          value: demographics.genderDistribution.male,
                        },
                        {
                          name: "Female",
                          value: demographics.genderDistribution.female,
                        },
                        {
                          name: "Other",
                          value: demographics.genderDistribution.other,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {[
                        {
                          name: "Male",
                          value: demographics.genderDistribution.male,
                        },
                        {
                          name: "Female",
                          value: demographics.genderDistribution.female,
                        },
                        {
                          name: "Other",
                          value: demographics.genderDistribution.other,
                        },
                      ].map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Performing Videos
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Likes</TableCell>
                  <TableCell align="right">Comments</TableCell>
                  <TableCell align="right">Published</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {channelAnalytics.topPerformingVideos.map((video) => (
                  <TableRow key={video.videoId}>
                    <TableCell>{video.title}</TableCell>
                    <TableCell align="right">
                      {formatNumber(video.views)}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(video.likes)}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(video.comments)}
                    </TableCell>
                    <TableCell align="right">
                      {formatDistanceToNow(new Date(video.publishedAt))} ago
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Schedule
              </Typography>
              {contentStats.mostPopularUploadDays.map((day) => (
                <Box key={day.day} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">{day.day}</Typography>
                    <Typography variant="body2">
                      {day.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={day.percentage}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Content Types
              </Typography>
              {contentStats.mostPopularVideoTypes.map((type) => (
                <Box key={type.type} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">{type.type}</Typography>
                    <Typography variant="body2">
                      {type.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={type.percentage}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default YouTubeAnalytics;
