import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import api from "../services/api";
import authService from "../services/authService";

const YouTubeAuth = ({ onAuthComplete }) => {
  const [loading, setLoading] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [authUrl, setAuthUrl] = useState("");
  const [youtubeError, setYoutubeError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      console.error("No authentication token found");
      navigate("/login");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const youtubeDataStr = urlParams.get("youtubeData");
    const error = urlParams.get("error");

    if (error) {
      console.error("YouTube auth error:", error);
      setLoading(false);
      setYoutubeError(`YouTube authorization failed: ${error}`);
      return;
    }

    if (youtubeDataStr) {
      try {
        const youtubeData = JSON.parse(decodeURIComponent(youtubeDataStr));
        onAuthComplete(youtubeData);
        sessionStorage.setItem("registrationStep", "3");

        navigate("/register/influencer", {
          state: {
            youtubeData,
            activeStep: 2,
          },
        });
      } catch (error) {
        console.error("Error processing YouTube data:", error);
        setLoading(false);
        setYoutubeError("Failed to process YouTube data");
      }
    }
  }, [location, onAuthComplete, navigate]);

  const handleAuth = async () => {
    try {
      setLoading(true);
      setYoutubeError("");
      const token = authService.getToken();
      console.log("Token before YouTube auth:", token);

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await api.get("/api/auth/youtube/auth-url", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("YouTube auth response:", response.data);

      if (!response.data.authUrl) {
        throw new Error("No auth URL received from server");
      }

      setAuthUrl(response.data.authUrl);
      setConsentOpen(true);
    } catch (error) {
      console.error("Error in handleAuth:", error);
      setLoading(false);
      if (error.response?.status === 401) {
        setYoutubeError("Please verify your email before connecting YouTube.");
      } else {
        setYoutubeError(
          error.message || "Failed to connect to YouTube. Please try again."
        );
      }
    }
  };

  const handleConsent = () => {
    setConsentOpen(false);
    localStorage.setItem("awaitingYouTubeAuth", "true");
    localStorage.setItem("returnUrl", window.location.href);
    window.location.href = authUrl;
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Button
        variant="contained"
        color="error"
        onClick={handleAuth}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Connect YouTube Channel"}
      </Button>

      {youtubeError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {youtubeError}
        </Alert>
      )}

      <Dialog open={consentOpen} onClose={() => setConsentOpen(false)}>
        <DialogTitle>YouTube Connection Consent</DialogTitle>
        <DialogContent>
          <Typography>
            You will be redirected to YouTube to authorize access to your
            channel data. This allows us to display your channel statistics and
            verify your identity.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConsentOpen(false)}>Cancel</Button>
          <Button onClick={handleConsent} color="primary" variant="contained">
            Continue to YouTube
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default YouTubeAuth;
