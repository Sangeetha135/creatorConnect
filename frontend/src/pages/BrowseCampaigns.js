import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const BrowseCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get("/api/campaigns/browse", {
        params: {
          includeCompleted: true,
        },
      });
      const campaignsWithAppliedFlag = response.data.map((campaign) => ({
        ...campaign,
        hasApplied: campaign.applications?.some(
          (app) =>
            app.influencer === user._id &&
            (app.status === "pending" || app.status === "accepted")
        ),
      }));
      setCampaigns(campaignsWithAppliedFlag);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching campaigns");
      setLoading(false);
    }
  };

  const handleApplyNow = async (campaignId) => {
    try {
      await axios.post(`/api/campaigns/${campaignId}/apply`);
      fetchCampaigns();
      setSnackbar({
        open: true,
        message: "Application submitted successfully!",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error applying to campaign",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return theme.palette.success.main;
      case "upcoming":
        return theme.palette.primary.main;
      case "completed":
        return theme.palette.info.main;
      case "draft":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getCampaignStatus = (campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    if (endDate < now) {
      return "completed";
    } else if (startDate > now) {
      return "upcoming";
    } else if (startDate <= now && endDate >= now) {
      return "active";
    }
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "primary.main",
          }}
        >
          Browse Campaigns
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchCampaigns}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </Box>

      {campaigns.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No campaigns available at the moment.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {campaigns.map((campaign) => {
            const status = getCampaignStatus(campaign);
            const isActive = status === "active";

            return (
              <Grid item xs={12} md={6} lg={4} key={campaign._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    opacity: status === "completed" ? 0.8 : 1,
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {campaign.title}
                      </Typography>
                      <Chip
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(status),
                          color: "white",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {campaign.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Budget: ${campaign.budget}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start Date:{" "}
                        {new Date(campaign.startDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        End Date:{" "}
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ mt: "auto", p: 2, pt: 0 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setOpenDialog(true);
                      }}
                    >
                      View Details
                    </Button>
                    {isActive && !campaign.hasApplied && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleApplyNow(campaign._id)}
                        disabled={status === "completed"}
                      >
                        Apply Now
                      </Button>
                    )}
                    {campaign.hasApplied && (
                      <Chip
                        label="Applied"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCampaign && (
          <DialogContent>
            <Typography variant="h5" gutterBottom>
              {selectedCampaign.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {selectedCampaign.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Campaign Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Budget: ${selectedCampaign.budget}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Start Date:{" "}
                    {new Date(selectedCampaign.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    End Date:{" "}
                    {new Date(selectedCampaign.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    Requirements: {selectedCampaign.requirements}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BrowseCampaigns;
