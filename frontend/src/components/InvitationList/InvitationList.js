import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
} from "@mui/material";
import {
  getInvitations,
  respondToInvitation,
} from "../../services/invitationService";

const InvitationList = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseDialog, setResponseDialog] = useState({
    open: false,
    invitation: null,
    message: "",
    sending: false,
    error: null,
  });

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const data = await getInvitations();
      setInvitations(data);
    } catch (error) {
      setError("Failed to fetch invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (invitation, status) => {
    setResponseDialog({
      open: true,
      invitation,
      status,
      message: "",
      sending: false,
      error: null,
    });
  };

  const handleCloseDialog = () => {
    setResponseDialog({
      ...responseDialog,
      open: false,
      error: null,
    });
  };

  const handleSubmitResponse = async () => {
    const { invitation, status, message } = responseDialog;

    setResponseDialog({
      ...responseDialog,
      sending: true,
      error: null,
    });

    try {
      await respondToInvitation(invitation._id, status, message);

      setInvitations((prevInvitations) =>
        prevInvitations.map((inv) =>
          inv._id === invitation._id
            ? { ...inv, status, responseMessage: message }
            : inv
        )
      );

      setResponseDialog({
        open: false,
        invitation: null,
        message: "",
        sending: false,
        error: null,
      });
    } catch (error) {
      setResponseDialog({
        ...responseDialog,
        sending: false,
        error: error.message || "Failed to respond to invitation",
      });
    }
  };

  if (loading) {
    return <Typography>Loading invitations...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Campaign Invitations
      </Typography>

      <Grid container spacing={2}>
        {invitations.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="textSecondary">No invitations yet</Typography>
          </Grid>
        ) : (
          invitations.map((invitation) => (
            <Grid item xs={12} key={invitation._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {invitation.campaign.title}
                  </Typography>

                  <Typography color="textSecondary" gutterBottom>
                    From: {invitation.brand.name}
                  </Typography>

                  <Typography variant="body2" paragraph>
                    {invitation.message}
                  </Typography>

                  <Typography color="primary" gutterBottom>
                    Compensation: ${invitation.compensation}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    {invitation.status === "pending" ? (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleRespond(invitation, "accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRespond(invitation, "rejected")}
                        >
                          Decline
                        </Button>
                      </Box>
                    ) : (
                      <Typography
                        color={
                          invitation.status === "accepted"
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        Status:{" "}
                        {invitation.status.charAt(0).toUpperCase() +
                          invitation.status.slice(1)}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog
        open={responseDialog.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {responseDialog.status === "accepted" ? "Accept" : "Decline"}{" "}
          Invitation
        </DialogTitle>
        <DialogContent>
          {responseDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {responseDialog.error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Message (Optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={responseDialog.message}
            onChange={(e) =>
              setResponseDialog({
                ...responseDialog,
                message: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitResponse}
            variant="contained"
            color={responseDialog.status === "accepted" ? "primary" : "error"}
            disabled={responseDialog.sending}
          >
            {responseDialog.sending ? "Sending..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvitationList;
