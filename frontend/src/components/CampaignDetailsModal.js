import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  IconButton,
  Grid,
  Divider,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  CheckCircle,
  PendingActions,
  Block,
  Campaign as CampaignIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Done as DoneIcon,
  Add as AddIcon,
  Send as SendIcon,
  Upload as UploadIcon,
  Star as StarIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayCircleOutline as ActiveIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateCampaignProgress } from "../slices/campaignSlice";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 1000,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflow: "auto",
};

const CampaignDetailsModal = ({ open, onClose, campaign, onEdit }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isInfluencer = user?.role === "influencer";
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle color="success" />;
      case "active":
        return <ActiveIcon color="primary" />;
      case "pending":
        return <PendingIcon color="disabled" />;
      default:
        return null;
    }
  };

  const getCurrentStep = () => {
    if (campaign?.progress?.completion?.status === "completed")
      return "completion";
    if (
      campaign?.progress?.content?.status === "completed" ||
      campaign?.progress?.content?.status === "active"
    )
      return "content";
    if (
      campaign?.progress?.invitations?.status === "completed" ||
      campaign?.progress?.invitations?.status === "active"
    )
      return "invitations";
    return "creation";
  };

  const handleNextStep = async () => {
    const currentStep = getCurrentStep();

    try {
      await dispatch(
        updateCampaignProgress({
          campaignId: campaign._id,
          currentStep,
          completed: true,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error updating campaign progress:", error);
    }
  };

  const handleStepAction = async (action) => {
    switch (action) {
      case "invite":
        await updateCampaignProgress("invitations", false);
        navigate(`/campaigns/${campaign?._id}/suggestions`);
        break;
      case "review":
        navigate("/review-applications", {
          state: { campaignId: campaign?._id },
        });
        break;
      case "content":
        await updateCampaignProgress("content", false);
        navigate("/content-management", {
          state: { campaignId: campaign?._id },
        });
        break;
      case "complete":
        setConfirmationAction("complete");
        setConfirmationOpen(true);
        break;
      default:
        break;
    }
  };

  const handleConfirmation = async () => {
    try {
      if (confirmationAction === "complete") {
        await dispatch(
          updateCampaignProgress({
            campaignId: campaign._id,
            currentStep: "completion",
            completed: true,
          })
        ).unwrap();
      }
      setConfirmationOpen(false);
    } catch (error) {
      console.error("Error completing campaign:", error);
    }
  };

  const getStepStatus = (step) => {
    if (!campaign?.progress) {
      if (step === "creation") return "completed";
      if (step === "invitations") return "active";
      return "pending";
    }

    const status = campaign.progress[step]?.status;

    if (
      step === "invitations" &&
      !status &&
      campaign.progress?.creation?.status === "completed"
    ) {
      return "active";
    }

    return status || "pending";
  };

  const steps = [
    {
      label: "Campaign Creation",
      description: "Initial campaign setup with basic details and requirements",
      status: getStepStatus("creation"),
      icon: <CampaignIcon />,
      date: formatDate(campaign?.createdAt),
      actions: [],
    },
    {
      label: "Influencer Invitations",
      description: "Find and invite suitable content creators",
      status: getStepStatus("invitations"),
      icon: <GroupIcon />,
      stats: {
        total: campaign?.statistics?.totalInvitations || 0,
        accepted: campaign?.statistics?.acceptedInvitations || 0,
        pending: campaign?.statistics?.pendingInvitations || 0,
        rejected: campaign?.statistics?.rejectedInvitations || 0,
      },
      actions: [
        {
          label: "Find Creators",
          icon: <AddIcon />,
          onClick: () => handleStepAction("invite"),
          disabled: getStepStatus("completion") === "completed",
        },
        {
          label: "Review Applications",
          icon: <AssessmentIcon />,
          onClick: () => handleStepAction("review"),
          disabled: getStepStatus("completion") === "completed",
        },
      ],
    },
    {
      label: "Content Creation",
      description: "Influencers create and submit content",
      status: getStepStatus("content"),
      icon: <AssessmentIcon />,
      deadline: campaign?.contentSubmissionDeadline,
      actions: [],
    },
    {
      label: "Campaign Completion",
      description: "Review content and campaign results",
      status: getStepStatus("completion"),
      icon: <DoneIcon />,
      actions: [
        {
          label: "Complete Campaign",
          icon: <StarIcon />,
          onClick: () => handleStepAction("complete"),
          disabled:
            getStepStatus("completion") === "completed" ||
            getStepStatus("content") !== "completed",
        },
      ],
    },
  ];

  const renderStepContent = (step, index) => {
    const content = (() => {
      switch (index) {
        case 0:
          return (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Created on {step.date}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Campaign Type</Typography>
                  <Typography>
                    {campaign?.campaignType || "Not specified"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Budget</Typography>
                  <Typography>${campaign?.budget || 0}</Typography>
                </Grid>
              </Grid>
            </Box>
          );
        case 1:
          return (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6">{step.stats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="success.main">
                      {step.stats.accepted}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accepted
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="warning.main">
                      {step.stats.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="error.main">
                      {step.stats.rejected}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rejected
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          );
        case 2:
          return (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Submission Deadline: {formatDate(step.deadline)}
              </Typography>
            </Box>
          );
        case 3:
          return (
            <Box>
              <Typography variant="body2" color="text.secondary">
                {campaign?.progressStatus === "completed"
                  ? "Campaign has been completed successfully."
                  : "Campaign will be marked as completed once all content is submitted and approved."}
              </Typography>
            </Box>
          );
        default:
          return null;
      }
    })();

    return (
      <Box>
        {content}
        {step.actions && (
          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            {step.actions.map((action, actionIndex) => (
              <Button
                key={actionIndex}
                variant="contained"
                startIcon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                size="small"
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  const renderInfluencerView = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Brand
                </Typography>
                <Typography gutterBottom>
                  {campaign?.brand?.name || campaign?.brand?.companyName}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Campaign Type
                </Typography>
                <Typography gutterBottom>{campaign?.campaignType}</Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Budget
                </Typography>
                <Typography gutterBottom>
                  ${campaign?.budget}
                  {campaign?.userInvitation && (
                    <Chip
                      label={`Your Compensation: $${campaign.userInvitation.compensation}`}
                      color="success"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Timeline
                </Typography>
                <Typography gutterBottom>
                  Start: {formatDate(campaign?.startDate)}
                  <br />
                  End: {formatDate(campaign?.endDate)}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Content Submission Deadline
                </Typography>
                <Typography gutterBottom>
                  {formatDate(campaign?.contentSubmissionDeadline)}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={campaign?.status}
                  color={campaign?.status === "active" ? "success" : "default"}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Deliverables & Requirements
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Platforms
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {campaign?.platforms?.map((platform, index) => (
                    <Chip key={index} label={platform} />
                  ))}
                </Box>

                <Typography variant="subtitle2" color="text.secondary">
                  Deliverables
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {campaign?.deliverables?.map((deliverable, index) => (
                    <Chip key={index} label={deliverable} />
                  ))}
                </Box>

                <Typography variant="subtitle2" color="text.secondary">
                  Number of Deliverables
                </Typography>
                <Typography gutterBottom>
                  {campaign?.numberOfDeliverables}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Campaign Goals
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {campaign?.campaignGoals?.map((goal, index) => (
                    <Chip key={index} label={goal} />
                  ))}
                </Box>

                <Typography variant="subtitle2" color="text.secondary">
                  KPIs
                </Typography>
                <Typography gutterBottom>
                  {campaign?.kpis || "Not specified"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Content Guidelines
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Hashtags & Mentions
                </Typography>
                <Typography gutterBottom>
                  {campaign?.contentGuidelines?.hashtagsMentions ||
                    "Not specified"}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Dos and Don'ts
                </Typography>
                <Typography gutterBottom>
                  {campaign?.contentGuidelines?.dosAndDonts || "Not specified"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reference Links
                </Typography>
                {campaign?.contentGuidelines?.referenceLinks ? (
                  <Box component="ul" sx={{ mt: 0 }}>
                    {campaign.contentGuidelines.referenceLinks
                      .split("\n")
                      .map((link, index) => (
                        <li key={index}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                  </Box>
                ) : (
                  <Typography>No reference links provided</Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {campaign?.campaignAssets && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Campaign Assets
              </Typography>
              <Button
                variant="outlined"
                href={campaign.campaignAssets}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Campaign Assets
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="campaign-details-modal"
    >
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2">
            {campaign?.title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          {campaign?.description}
        </Typography>

        {isInfluencer ? (
          renderInfluencerView()
        ) : (
          <>
            <Stepper orientation="vertical">
              {steps.map((step, index) => (
                <Step key={index} active={step.status === "active"}>
                  <StepLabel
                    StepIconComponent={() => getStepIcon(step.status)}
                    optional={
                      <Typography variant="caption">
                        {step.status.charAt(0).toUpperCase() +
                          step.status.slice(1)}
                      </Typography>
                    }
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {step.icon}
                      <Typography sx={{ ml: 1 }}>{step.label}</Typography>
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {step.description}
                    </Typography>
                    {renderStepContent(step, index)}
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {getCurrentStep() !== "completion" &&
              campaign?.progress?.completion?.status !== "completed" && (
                <Box
                  sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNextStep}
                    endIcon={<ActiveIcon />}
                  >
                    Move to Next Step
                  </Button>
                </Box>
              )}
          </>
        )}

        <Dialog
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
        >
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to mark this campaign as complete? This
              action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmationOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmation}
              variant="contained"
              color="primary"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
};

export default CampaignDetailsModal;
