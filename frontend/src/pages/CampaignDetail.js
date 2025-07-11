import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Paper,
} from "@mui/material";
import {
  CalendarToday,
  AttachMoney,
  Campaign as CampaignIcon,
  Group as GroupIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Fetching campaign with ID:", id);

    if (!id) {
      console.error("Campaign ID is missing or invalid");
      setError("Campaign ID is missing or invalid");
      setLoading(false);
      return;
    }

    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        console.log(`Making API request to: /api/campaigns/${id}`);
        const response = await axios.get(`/api/campaigns/${id}`, config);
        console.log("Campaign details fetched:", response.data);

        if (!response.data) {
          throw new Error("Campaign not found or no data returned");
        }

        setCampaign(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching campaign:", err);
        setError(
          err.response?.data?.message || "Failed to fetch campaign details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography>Loading campaign details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/campaigns")}
            sx={{ mt: 2 }}
          >
            Go Back to Campaigns
          </Button>
        </Box>
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Campaign not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/campaigns")}
            sx={{ mt: 2 }}
          >
            Go Back to Campaigns
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          {campaign.title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Chip
            label={campaign.status === "active" ? "Active" : campaign.status}
            color={campaign.status === "active" ? "success" : "default"}
            sx={{ mr: 2 }}
          />
          <Typography variant="subtitle1" color="text.secondary">
            Created by:{" "}
            {campaign.brand?.name ||
              campaign.brand?.companyName ||
              "Unknown Brand"}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Description
            </Typography>
            <Typography paragraph>{campaign.description}</Typography>

            <Typography variant="h6" gutterBottom>
              Campaign Goals
            </Typography>
            <Box sx={{ mb: 2 }}>
              {campaign.campaignGoals?.map((goal, index) => (
                <Chip key={index} label={goal} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>

            <Typography variant="h6" gutterBottom>
              Platforms
            </Typography>
            <Box sx={{ mb: 2 }}>
              {campaign.platforms?.map((platform, index) => (
                <Chip key={index} label={platform} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>

            <Typography variant="h6" gutterBottom>
              Deliverables
            </Typography>
            <Box sx={{ mb: 2 }}>
              {campaign.deliverables?.map((deliverable, index) => (
                <Chip key={index} label={deliverable} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Details
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Campaign Type
              </Typography>
              <Typography gutterBottom>{campaign.campaignType}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Budget
              </Typography>
              <Typography gutterBottom>${campaign.budget}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Timeline
              </Typography>
              <Typography gutterBottom>
                Start: {formatDate(campaign.startDate)}
              </Typography>
              <Typography gutterBottom>
                End: {formatDate(campaign.endDate)}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Content Submission Deadline
              </Typography>
              <Typography gutterBottom>
                {formatDate(campaign.contentSubmissionDeadline)}
              </Typography>
            </Box>
          </Paper>

          <Paper elevation={2} className="brand-section">
            <Typography variant="h5" component="h2">
              Campaign Timeline
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Content Submission Deadline
              </Typography>
              <Typography gutterBottom>
                {formatDate(campaign.contentSubmissionDeadline)}
              </Typography>
            </Box>
          </Paper>

          {user?.role === "brand" && campaign.brand?._id === user?._id && (
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(`/campaigns/${campaign._id}/suggestions`)}
            >
              Find Influencers
            </Button>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CampaignDetail;
