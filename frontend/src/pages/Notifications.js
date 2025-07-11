import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  useTheme,
  Divider,
  Chip,
  ButtonGroup,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Link,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService";
import { respondToInvitation } from "../services/invitationService";
import { reviewContent, submitContent } from "../services/contentService";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CampaignIcon from "@mui/icons-material/Campaign";
import ArticleIcon from "@mui/icons-material/Article";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmailIcon from "@mui/icons-material/Email";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ErrorIcon from "@mui/icons-material/Error";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseType, setResponseType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const navigate = useNavigate();
  const [responseDialog, setResponseDialog] = useState({
    open: false,
    type: null,
    notificationId: null,
    message: "",
    action: null,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const count = notifications.filter(
      (notification) => !notification.read
    ).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      console.log("Fetched notifications:", data);

      const rejectionNotifications = data.filter(
        (n) => n.type === "ALL_INVITATIONS_REJECTED"
      );
      console.log("Rejection notifications:", rejectionNotifications);

      if (rejectionNotifications.length > 0) {
        console.log("Rejection notification data structure:");
        rejectionNotifications.forEach((notification, index) => {
          console.log(`Notification ${index + 1}:`, {
            id: notification._id,
            type: notification.type,
            campaignId: notification.data?.campaignId,
            data: notification.data,
          });
        });
      }

      const testNotifications = [...data];

      if (rejectionNotifications.length === 0 && user?.role === "brand") {
        const testRejection = {
          _id: "test-rejection-123",
          type: "ALL_INVITATIONS_REJECTED",
          title: "All Invitations Rejected (Test)",
          message:
            "All invitations for your test campaign have been rejected. You may want to invite more influencers or review your campaign details.",
          read: false,
          createdAt: new Date().toISOString(),
          data: {
            campaignId: "6806ce7a86c3f56597e402f5",
            rejectedCount: 3,
            stats: {
              total: 3,
              accepted: 0,
              rejected: 3,
              pending: 0,
            },
          },
        };
        console.log("Adding test rejection notification:", testRejection);
        console.log(
          "Test notification has campaignId:",
          testRejection.data.campaignId
        );
        testNotifications.push(testRejection);
      }

      setNotifications(testNotifications);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError(
        error.message ||
          "Failed to fetch notifications. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setError(null);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setError(
        error.message ||
          "Failed to mark notification as read. Please try again."
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(
        notifications.map((notification) => ({ ...notification, read: true }))
      );
      setError(null);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      setError(
        error.message ||
          "Failed to mark all notifications as read. Please try again."
      );
    }
  };

  const handleInvitationResponse = async (
    notificationId,
    status,
    message = ""
  ) => {
    try {
      const notification = notifications.find((n) => n._id === notificationId);
      if (!notification) return;

      await respondToInvitation(
        notification.data.invitationId,
        status,
        message
      );
      await handleMarkAsRead(notificationId);
      await fetchNotifications();
      setResponseDialog({
        open: false,
        type: null,
        notificationId: null,
        message: "",
        action: null,
      });
    } catch (error) {
      console.error("Failed to respond to invitation:", error);
      setError(
        error.message || "Failed to respond to invitation. Please try again."
      );
    }
  };

  const handleContentReview = async (notificationId, status) => {
    try {
      const notification = notifications.find((n) => n._id === notificationId);
      if (!notification) return;

      const contentId = notification.data.contentId;

      if (!contentId) {
        throw new Error("Content ID not found in notification data");
      }

      await reviewContent(contentId, status);
      await handleMarkAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to review content:", error);
      setError(error.message || "Failed to review content. Please try again.");
    }
  };

  const openResponseDialog = (type, notificationId, action) => {
    setResponseDialog({
      open: true,
      type,
      notificationId,
      message: "",
      action,
    });
  };

  const handleCloseDialog = () => {
    setResponseDialog({
      open: false,
      type: null,
      notificationId: null,
      message: "",
      action: null,
    });
  };

  const handleViewCampaign = (campaignId, notificationId) => {
    console.log(
      `Attempting to navigate to campaign ${campaignId} from notification ${notificationId}`
    );
    console.log("Campaign ID type:", typeof campaignId);
    console.log("Campaign ID value:", campaignId);

    if (!campaignId) {
      console.error("Campaign ID is missing or invalid");
      return;
    }

    const token = localStorage.getItem("token");

    if (notificationId) {
      console.log("Marking notification as read:", notificationId);
      handleMarkAsRead(notificationId)
        .then(() => console.log("Notification marked as read successfully"))
        .catch((err) =>
          console.error("Error marking notification as read:", err)
        );
    }

    const url = `/campaigns/${campaignId}`;
    console.log("Navigating to URL:", url);

    try {
      navigate(url);
      console.log("Navigation successful");
    } catch (error) {
      console.error("Error during navigation:", error);
    }
  };

  const handleEditCampaign = (campaignId, notificationId) => {
    console.log(
      `Navigating to edit campaign ${campaignId} from notification ${notificationId}`
    );
    if (notificationId) {
      handleMarkAsRead(notificationId);
    }
    navigate(`/campaigns/${campaignId}/edit`);
  };

  const handleFindInfluencers = (notificationId) => {
    console.log(
      `Navigating to influencers from notification ${notificationId}`
    );
    if (notificationId) {
      handleMarkAsRead(notificationId);
    }
    navigate("/influencers");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "CAMPAIGN_INVITATION":
        return <CampaignIcon />;
      case "CONTENT_SUBMITTED":
      case "CONTENT_APPROVED":
      case "CONTENT_REJECTED":
        return <ArticleIcon />;
      case "INVITATION_ACCEPTED":
        return <CheckCircleIcon color="success" />;
      case "INVITATION_REJECTED":
        return <CancelIcon color="error" />;
      case "ALL_INVITATIONS_REJECTED":
        return <ErrorIcon color="error" />;
      case "ALL_INVITATIONS_ACCEPTED":
        return <PeopleIcon color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "CAMPAIGN_INVITATION":
        return theme.palette.primary.main;
      case "CONTENT_SUBMITTED":
        return theme.palette.info.main;
      case "CONTENT_APPROVED":
        return theme.palette.success.main;
      case "CONTENT_REJECTED":
        return theme.palette.error.main;
      case "INVITATION_ACCEPTED":
        return theme.palette.success.main;
      case "INVITATION_REJECTED":
        return theme.palette.error.main;
      case "ALL_INVITATIONS_REJECTED":
        return theme.palette.error.main;
      case "ALL_INVITATIONS_ACCEPTED":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const renderNotificationActions = (notification) => {
    if (notification.read) return null;

    switch (notification.type) {
      case "CAMPAIGN_INVITATION":
        return (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={() =>
                openResponseDialog("invitation", notification._id, "accept")
              }
            >
              Accept
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<CancelIcon />}
              onClick={() =>
                openResponseDialog("invitation", notification._id, "reject")
              }
            >
              Decline
            </Button>
          </Stack>
        );
      case "ALL_INVITATIONS_REJECTED":
        return (
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 2, justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              size="small"
              color="primary"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleMarkAsRead(notification._id)}
              sx={{
                borderRadius: 2,
                px: 2,
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              Mark as Read
            </Button>
          </Stack>
        );
      case "CONTENT_SUBMITTED":
        return (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleContentReview(notification._id, "approved")}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<CancelIcon />}
              onClick={() => handleContentReview(notification._id, "rejected")}
            >
              Reject
            </Button>
            <Button
              variant="outlined"
              size="small"
              component="a"
              href={notification.data.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Content
            </Button>
          </Stack>
        );
      default:
        return null;
    }
  };

  const renderNotificationDetails = (notification) => {
    switch (notification.type) {
      case "CAMPAIGN_INVITATION":
        return (
          <Box sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <MonetizationOnIcon color="primary" />
              <Typography variant="body2">
                Compensation: ${notification.data.compensation}
              </Typography>
            </Stack>
          </Box>
        );
      case "ALL_INVITATIONS_REJECTED":
        return (
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                p: 3,
                bgcolor: "rgba(244, 67, 54, 0.08)",
                borderRadius: 2,
                mb: 2,
                border: "1px solid rgba(244, 67, 54, 0.2)",
                boxShadow: "0 2px 8px rgba(244, 67, 54, 0.15)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <ErrorIcon color="error" sx={{ mr: 1.5, fontSize: 28 }} />
                <Typography
                  variant="subtitle1"
                  color="error.dark"
                  fontWeight="600"
                >
                  All Invitations Rejected
                </Typography>
              </Box>
              <Typography
                variant="body1"
                color="text.primary"
                sx={{ ml: 4.5, mb: 1 }}
              >
                All <strong>{notification.data.rejectedCount}</strong>{" "}
                invitations for this campaign have been rejected.
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 4.5 }}
              >
                You may want to invite more influencers or review your campaign
                details.
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="medium"
                  color="primary"
                  fullWidth
                  startIcon={<CampaignIcon />}
                  sx={{
                    py: 1,
                    fontWeight: 500,
                    borderRadius: 2,
                    boxShadow: 2,
                    "&:hover": {
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => {
                    handleViewCampaign(
                      notification.data.campaignId,
                      notification._id
                    );
                  }}
                >
                  View Campaign Details
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      case "CONTENT_SUBMITTED":
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Campaign: {notification.data.campaignTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submitted by: {notification.data.influencerName}
            </Typography>
            {notification.data.contentUrl && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Content URL:
                </Typography>
                <Link
                  href={notification.data.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "block",
                    wordBreak: "break-all",
                    color: theme.palette.primary.main,
                  }}
                >
                  {notification.data.contentUrl}
                </Link>
              </Box>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading notifications...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

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
        <Box>
          <Typography variant="h4" gutterBottom>
            Notifications
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user?.role === "brand"
              ? "Stay updated with campaign responses and content submissions"
              : "Stay updated with your campaign invitations and content reviews"}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            onClick={handleMarkAllAsRead}
            startIcon={<CheckCircleIcon />}
          >
            Mark all as read
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {notifications.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <NotificationsIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  No notifications yet
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          notifications.map((notification) => (
            <Grid item xs={12} key={notification._id}>
              <Card
                sx={{
                  opacity: notification.read ? 0.8 : 1,
                  transition: "all 0.3s ease-in-out",
                  borderRadius: 2,
                  boxShadow: notification.read ? 1 : 3,
                  borderLeft:
                    notification.type === "ALL_INVITATIONS_REJECTED"
                      ? `4px solid ${theme.palette.error.main}`
                      : `4px solid ${getNotificationColor(notification.type)}`,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Box
                      sx={{
                        color: getNotificationColor(notification.type),
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6">
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.read ? "Read" : "New"}
                          size="small"
                          color={notification.read ? "default" : "primary"}
                          variant={notification.read ? "outlined" : "filled"}
                        />
                      </Box>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        paragraph
                      >
                        {notification.message}
                      </Typography>
                      {renderNotificationDetails(notification)}
                      {renderNotificationActions(notification)}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 2, display: "block" }}
                      >
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    {!notification.read && (
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(notification._id)}
                        sx={{
                          color: "primary.main",
                          "&:hover": {
                            backgroundColor: "primary.light",
                            color: "white",
                          },
                        }}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={responseDialog.open} onClose={handleCloseDialog}>
        <DialogTitle>
          {responseDialog.type === "invitation"
            ? `${
                responseDialog.action === "accept" ? "Accept" : "Decline"
              } Campaign Invitation`
            : `${
                responseDialog.action === "approve" ? "Approve" : "Reject"
              } Content`}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={
              responseDialog.type === "invitation"
                ? "Response Message (Optional)"
                : "Feedback"
            }
            fullWidth
            multiline
            rows={4}
            value={responseDialog.message}
            onChange={(e) =>
              setResponseDialog({ ...responseDialog, message: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => {
              if (responseDialog.type === "invitation") {
                handleInvitationResponse(
                  responseDialog.notificationId,
                  responseDialog.action === "accept" ? "accepted" : "rejected",
                  responseDialog.message
                );
              } else {
                handleContentReview(
                  responseDialog.notificationId,
                  responseDialog.action === "approve" ? "approved" : "rejected"
                );
              }
            }}
            variant="contained"
            color={
              responseDialog.action === "accept" ||
              responseDialog.action === "approve"
                ? "success"
                : "error"
            }
          >
            {responseDialog.action === "accept" ||
            responseDialog.action === "approve"
              ? "Confirm"
              : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Notifications;
