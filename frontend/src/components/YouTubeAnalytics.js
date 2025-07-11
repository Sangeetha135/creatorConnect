import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const YouTubeAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/analytics/youtube", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return null;
  }

  const viewsData = {
    labels: analytics.viewsTrend.labels,
    datasets: [
      {
        label: "Views",
        data: analytics.viewsTrend.data,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const demographicsData = {
    labels: analytics.demographics.ageGroups.map((group) => group.range),
    datasets: [
      {
        label: "Age Distribution",
        data: analytics.demographics.ageGroups.map((group) => group.percentage),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
      },
    ],
  };

  const engagementData = {
    labels: ["Likes", "Comments", "Shares"],
    datasets: [
      {
        label: "Engagement Rate",
        data: [
          analytics.engagement.likes,
          analytics.engagement.comments,
          analytics.engagement.shares,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
        ],
      },
    ],
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        YouTube Channel Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subscribers
              </Typography>
              <Typography variant="h3" color="primary">
                {analytics.subscribers.total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +{analytics.subscribers.change} this{" "}
                {analytics.subscribers.changePeriod}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h3" color="primary">
                {analytics.views.total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +{analytics.views.change.toLocaleString()} this{" "}
                {analytics.views.changePeriod}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Watch Time
              </Typography>
              <Typography variant="h3" color="primary">
                {analytics.watchTime.average} min
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +{analytics.watchTime.change} min this{" "}
                {analytics.watchTime.changePeriod}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Views Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={viewsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Age Demographics
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={demographicsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Engagement Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={engagementData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default YouTubeAnalytics;
