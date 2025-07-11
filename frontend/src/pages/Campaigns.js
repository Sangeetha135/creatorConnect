import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCampaigns } from "../features/campaigns/campaignSlice";
import CreateCampaignButton from "../components/CreateCampaignButton/CreateCampaignButton";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  Paper,
  Container,
  keyframes,
} from "@mui/material";
import {
  Timeline,
  CalendarToday,
  People,
  CheckCircle,
  Cancel,
  Pending,
  Info,
  Campaign as CampaignIcon,
  AttachMoney,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import "./Campaigns.css";
import CampaignDetailsModal from "../components/CampaignDetailsModal";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const Campaigns = () => {
  const dispatch = useDispatch();
  const { campaigns, loading, error } = useSelector((state) => state.campaigns);
  const { user } = useSelector((state) => state.auth);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const theme = useTheme();

  const acceptedCampaigns = [
    {
      _id: "acc1",
      campaignTitle: "Summer Fashion Collection",
      campaignDescription:
        "Promote our new summer collection on your social media.",
      brandName: "Fashion Brand",
      campaignType: "Instagram",
      status: "In Progress",
    },
  ];

  useEffect(() => {
    dispatch(fetchCampaigns({ includeCompleted: true }));
  }, [dispatch]);

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

  const getCampaignStatus = (campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    if (campaign.completed || endDate < now) {
      return "completed";
    } else if (startDate > now) {
      return "upcoming";
    } else if (startDate <= now && endDate >= now) {
      return "active";
    }
    return "unknown";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "info";
      case "active":
        return "success";
      case "completed":
        return "secondary";
      default:
        return "default";
    }
  };

  const renderStatistics = (campaign) => (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            textAlign: "center",
            bgcolor: "background.default",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <Typography variant="h6" color="primary">
            {campaign.statistics?.totalInvitations || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Invites
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            textAlign: "center",
            bgcolor: "success.light",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <Typography variant="h6" color="success.dark">
            {campaign.statistics?.acceptedInvitations || 0}
          </Typography>
          <Typography variant="body2" color="success.dark">
            Accepted
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            textAlign: "center",
            bgcolor: "warning.light",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <Typography variant="h6" color="warning.dark">
            {campaign.statistics?.pendingInvitations || 0}
          </Typography>
          <Typography variant="body2" color="warning.dark">
            Pending
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={3}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            textAlign: "center",
            bgcolor: "error.light",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <Typography variant="h6" color="error.dark">
            {campaign.statistics?.rejectedInvitations || 0}
          </Typography>
          <Typography variant="body2" color="error.dark">
            Rejected
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderInvitedInfluencers = (campaign) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom color="primary">
        Invited Influencers
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {campaign.invitations?.accepted.map((invitation) => (
          <Tooltip
            key={invitation._id}
            title={`${invitation.influencer.name} - Accepted`}
          >
            <Chip
              avatar={<Avatar src={invitation.influencer.profilePicture} />}
              label={invitation.influencer.name}
              color="success"
              variant="outlined"
              size="small"
              sx={{
                "& .MuiChip-label": { fontWeight: 500 },
                borderColor: "success.main",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: theme.shadows[2],
                },
              }}
            />
          </Tooltip>
        ))}
        {campaign.invitations?.pending.map((invitation) => (
          <Tooltip
            key={invitation._id}
            title={`${invitation.influencer.name} - Pending`}
          >
            <Chip
              avatar={<Avatar src={invitation.influencer.profilePicture} />}
              label={invitation.influencer.name}
              color="warning"
              variant="outlined"
              size="small"
              sx={{
                "& .MuiChip-label": { fontWeight: 500 },
                borderColor: "warning.main",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: theme.shadows[2],
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );

  const renderCampaignCard = (campaign) => (
    <Grid item xs={12} md={6} key={campaign._id}>
      <Card
        sx={{
          mb: 3,
          position: "relative",
          borderRadius: 2,
          transition: "all 0.3s ease-in-out",
          animation: `${fadeIn} 0.5s ease-out`,
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[8],
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
            <Box>
              <Typography
                variant="h5"
                component="div"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  animation: `${float} 3s ease-in-out infinite`,
                }}
              >
                {campaign.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {campaign.description}
              </Typography>
            </Box>
            <Chip
              label={campaign.progressStatus || "active"}
              color={getStatusColor(campaign.progressStatus)}
              sx={{
                ml: 2,
                fontWeight: 500,
                "& .MuiChip-label": { px: 2 },
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
          </Box>

          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "background.default",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CampaignIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="body1" fontWeight={500}>
                    Type: {campaign.campaignType}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AttachMoney sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="body1" fontWeight={500}>
                    Budget: ${campaign.budget}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CalendarToday sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="body1" fontWeight={500}>
                    Timeline:{" "}
                    {format(new Date(campaign.startDate), "MMM d, yyyy")} -{" "}
                    {format(new Date(campaign.endDate), "MMM d, yyyy")}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "background.default",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Campaign Progress
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Days Remaining: {campaign.timeline?.daysRemaining || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submission in: {campaign.timeline?.daysUntilSubmission || 0}{" "}
                    days
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    100,
                    ((campaign.timeline?.daysRemaining || 0) /
                      (campaign.timeline?.daysUntilSubmission || 1)) *
                      100
                  )}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "background.paper",
                    "& .MuiLinearProgress-bar": {
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundSize: "200% 200%",
                      animation: `${shimmer} 2s linear infinite`,
                    },
                  }}
                />
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {user?.role === "brand" && (
            <>
              {renderStatistics(campaign)}
              {renderInvitedInfluencers(campaign)}
            </>
          )}

          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            {user?.role === "brand" ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleViewDetails(campaign)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    px: 3,
                    color: "white",
                    backgroundSize: "200% 200%",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      backgroundSize: "200% 200%",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  View Details
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleViewDetails(campaign)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 3,
                  color: "white",
                  backgroundSize: "200% 200%",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundSize: "200% 200%",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  },
                }}
              >
                View Details
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const handleViewDetails = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleCloseModal = () => {
    setSelectedCampaign(null);
  };

  const handleEditCampaign = (campaign) => {
    console.log("Edit campaign:", campaign);
  };

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
          component="h1"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            backgroundSize: "200% 200%",
            animation: `${float} 3s ease-in-out infinite`,
          }}
        >
          {user?.role === "brand" ? "Campaigns" : "My Campaigns"}
        </Typography>
        {user?.role === "brand" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                dispatch(fetchCampaigns({ includeCompleted: true }));
              }}
            >
              Refresh
            </Button>
            <CreateCampaignButton />
          </Box>
        )}
      </Box>
      {campaigns.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No campaigns available. Create your first campaign!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {campaigns.map(renderCampaignCard)}
        </Grid>
      )}
      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          open={!!selectedCampaign}
          onClose={handleCloseModal}
          onEdit={handleEditCampaign}
        />
      )}
    </Container>
  );
};

export default Campaigns;
