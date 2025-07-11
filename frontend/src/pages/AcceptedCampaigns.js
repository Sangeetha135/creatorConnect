import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCampaigns } from "../features/campaigns/campaignSlice";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  CalendarToday,
  AttachMoney,
  Upload as UploadIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import CampaignDetailsModal from "../components/CampaignDetailsModal";
import ContentSubmissionModal from "../components/ContentSubmissionModal";

const AcceptedCampaigns = () => {
  const dispatch = useDispatch();
  const { campaigns, loading, error } = useSelector((state) => state.campaigns);
  const { user } = useSelector((state) => state.auth);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [contentModal, setContentModal] = useState({
    open: false,
    campaign: null,
  });

  useEffect(() => {
    dispatch(fetchCampaigns({ status: "accepted" }));
  }, [dispatch]);

  useEffect(() => {
    console.log("Current user:", user);
    console.log("All campaigns:", campaigns);
  }, [user, campaigns]);

  const acceptedCampaigns = campaigns;

  useEffect(() => {
    console.log("Accepted campaigns:", acceptedCampaigns);
  }, [acceptedCampaigns]);

  const handleViewDetails = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleCloseModal = () => {
    setSelectedCampaign(null);
  };

  const handleSubmitContent = (campaign) => {
    setContentModal({ open: true, campaign });
  };

  const handleCloseContentModal = () => {
    setContentModal({ open: false, campaign: null });
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: "error.main" }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  const renderCampaignCard = (campaign) => (
    <Card key={campaign._id} sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="div">
            {campaign.title}
          </Typography>
          <Box>
            <Chip
              label={campaign.status}
              color={campaign.status === "active" ? "success" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label={campaign.userInvitation ? "Invited" : "Applied"}
              color="primary"
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {campaign.description}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <AttachMoney sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="body2">
                Budget: ${campaign.budget}
                {campaign.userInvitation && (
                  <span style={{ marginLeft: "8px", color: "green" }}>
                    (Your compensation: ${campaign.userInvitation.compensation})
                  </span>
                )}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CalendarToday sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="body2">
                Deadline:{" "}
                {format(
                  new Date(campaign.contentSubmissionDeadline),
                  "MMM d, yyyy"
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 1, bgcolor: "background.paper", borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Content Requirements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {campaign.contentGuidelines?.general?.guidelines ||
                  campaign.contentGuidelines?.dosAndDonts?.join(", ") ||
                  "No specific guidelines provided"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadIcon />}
            onClick={() => handleSubmitContent(campaign)}
          >
            Submit Content
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Accepted Campaigns
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your active campaign collaborations and submit content
        </Typography>
      </Box>

      {acceptedCampaigns.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            You haven't been accepted to any campaigns yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {acceptedCampaigns.map((campaign) => (
            <Grid item xs={12} key={campaign._id}>
              {renderCampaignCard(campaign)}
            </Grid>
          ))}
        </Grid>
      )}

      <CampaignDetailsModal
        open={Boolean(selectedCampaign)}
        onClose={handleCloseModal}
        campaign={selectedCampaign}
      />

      <ContentSubmissionModal
        open={contentModal.open}
        onClose={handleCloseContentModal}
        campaign={contentModal.campaign}
      />
    </Container>
  );
};

export default AcceptedCampaigns;
