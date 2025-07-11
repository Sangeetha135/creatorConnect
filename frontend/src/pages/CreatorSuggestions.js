import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  IconButton,
  Collapse,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationOnIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Campaign as CampaignIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

import {
  getCreatorSuggestions,
  getMatchScoreBreakdown,
} from "../services/creatorSuggestionService";
import { sendInvitation } from "../services/invitationService";
import MatchScoreBreakdown from "../components/MatchScoreBreakdown";

const CreatorSuggestions = () => {
  const location = useLocation();
  const { id: campaignId } = useParams();
  const [suggestedCreators, setSuggestedCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [error, setError] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [invitationDialog, setInvitationDialog] = useState({
    open: false,
    creator: null,
    message: "",
    compensation: "",
    sending: false,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/campaigns/${campaignId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch campaign details");
        }

        const campaignData = await response.json();
        setCampaign(campaignData);

        if (campaignData.campaignRequirements) {
          const creators = await getCreatorSuggestions(
            campaignData.campaignRequirements
          );
          setSuggestedCreators(creators);
        } else {
          setError("No campaign requirements found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num;
  };

  const handleExpandClick = (creatorId) => {
    setExpandedCard(expandedCard === creatorId ? null : creatorId);
  };

  const handleContactCreator = (creator) => {
    const defaultMessage = `Hi ${creator.name},

I'm reaching out regarding our campaign "${
      campaign.title
    }". Based on your content and audience, we believe you would be a perfect fit for this collaboration.

Campaign Details:
${campaign.description}

Requirements:
${campaign.requirements || "To be discussed"}

We would love to work with you on this campaign.

Looking forward to your response!`;

    setInvitationDialog({
      open: true,
      creator,
      message: defaultMessage,
      compensation: campaign.budget || "",
      sending: false,
      error: null,
    });
  };

  const handleCloseDialog = () => {
    setInvitationDialog({
      ...invitationDialog,
      open: false,
      error: null,
    });
  };

  const handleSendInvitation = async () => {
    const { creator, message, compensation } = invitationDialog;
    if (!message.trim() || !compensation) {
      setInvitationDialog({
        ...invitationDialog,
        error: "Please fill in all fields",
      });
      return;
    }

    setInvitationDialog({
      ...invitationDialog,
      sending: true,
      error: null,
    });

    try {
      await sendInvitation(
        campaignId,
        creator.id,
        message,
        parseFloat(compensation)
      );

      setInvitationDialog({
        open: false,
        creator: null,
        message: "",
        compensation: "",
        sending: false,
        error: null,
      });

      setSuggestedCreators((prevCreators) =>
        prevCreators.map((c) =>
          c.id === creator.id ? { ...c, invitationSent: true } : c
        )
      );
    } catch (error) {
      setInvitationDialog({
        ...invitationDialog,
        sending: false,
        error: error.message || "Failed to send invitation",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {campaign && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {campaign.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            {campaign.description}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AttachMoneyIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Budget</Typography>
                  </Box>
                  <Typography variant="body1">${campaign.budget}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CampaignIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Type</Typography>
                  </Box>
                  <Typography variant="body1">
                    {campaign.campaignType}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Timeline</Typography>
                  </Box>
                  <Typography variant="body2">
                    {new Date(campaign.timeline.startDate).toLocaleDateString()}{" "}
                    -{new Date(campaign.timeline.endDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AssignmentIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Deliverables</Typography>
                  </Box>
                  <Typography variant="body1">
                    {campaign.numberOfDeliverables} items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Campaign Requirements
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {campaign.campaignRequirements.category || "Any"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Minimum Subscribers
                  </Typography>
                  <Typography variant="body1">
                    {campaign.campaignRequirements.minSubscribers?.toLocaleString() ||
                      "Any"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Minimum Average Views
                  </Typography>
                  <Typography variant="body1">
                    {campaign.campaignRequirements.minAverageViews?.toLocaleString() ||
                      "Any"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Platforms
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              {campaign.platforms.map((platform) => (
                <Chip
                  key={platform}
                  label={platform}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {campaign.contentGuidelines && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Content Guidelines
              </Typography>
              <Grid container spacing={2}>
                {campaign.contentGuidelines.dosAndDonts && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Do's and Don'ts
                        </Typography>
                        <Typography variant="body2">
                          {campaign.contentGuidelines.dosAndDonts}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {campaign.contentGuidelines.hashtagsMentions && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Required Hashtags and Mentions
                        </Typography>
                        <Typography variant="body2">
                          {campaign.contentGuidelines.hashtagsMentions}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Suggested Creators
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ width: "100%", mt: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {suggestedCreators.map((creator) => (
            <Grid item xs={12} md={6} key={creator.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                    transition: "all 0.3s",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: "12px",
                    px: 2,
                    py: 0.5,
                  }}
                >
                  {creator.matchScore}% Match
                </Box>

                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={creator.avatar}
                      sx={{ width: 64, height: 64, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6">{creator.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {creator.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="body2">
                        {formatNumber(creator.subscribers)} subscribers
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <VisibilityIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="body2">
                        {formatNumber(creator.avgViews)} avg. views
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LocationOnIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="body2">
                        {creator.location}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Platforms
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {creator.platforms.map((platform) => (
                        <Chip
                          key={platform}
                          label={platform}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleContactCreator(creator)}
                      disabled={creator.invitationSent}
                      sx={{ flex: 1, mr: 1 }}
                    >
                      {creator.invitationSent
                        ? "Invitation Sent"
                        : "Contact Creator"}
                    </Button>
                    <IconButton
                      onClick={() => handleExpandClick(creator.id)}
                      sx={{
                        transform:
                          expandedCard === creator.id
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                    >
                      {expandedCard === creator.id ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </Box>

                  <Collapse in={expandedCard === creator.id}>
                    <MatchScoreBreakdown
                      breakdown={getMatchScoreBreakdown(
                        creator,
                        campaign.campaignRequirements
                      )}
                    />
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={invitationDialog.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Contact {invitationDialog.creator?.name}</DialogTitle>
        <DialogContent>
          {invitationDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {invitationDialog.error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            multiline
            rows={8}
            value={invitationDialog.message}
            onChange={(e) =>
              setInvitationDialog({
                ...invitationDialog,
                message: e.target.value,
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Compensation ($)"
            type="number"
            fullWidth
            value={invitationDialog.compensation}
            onChange={(e) =>
              setInvitationDialog({
                ...invitationDialog,
                compensation: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSendInvitation}
            variant="contained"
            disabled={invitationDialog.sending}
          >
            {invitationDialog.sending ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreatorSuggestions;
