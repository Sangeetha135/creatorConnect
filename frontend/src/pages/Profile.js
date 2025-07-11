import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import YouTubeAnalytics from "../components/YouTubeAnalytics";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 3 }}>
              <Avatar
                src={profile?.profileImage}
                sx={{ width: 120, height: 120 }}
              />
              <Box flex={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h4">{profile?.name}</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate("/edit-profile")}
                  >
                    Edit Profile
                  </Button>
                </Box>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  {profile?.email}
                </Typography>
                <Box mt={2}>
                  <Chip label={profile?.role} color="primary" sx={{ mr: 1 }} />
                  {profile?.categories?.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      variant="outlined"
                      sx={{ mr: 1, mt: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Bio
                </Typography>
                <Typography paragraph>
                  {profile?.bio || "No bio provided"}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography paragraph>
                  {profile?.location || "No location provided"}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Website
                </Typography>
                <Typography paragraph>
                  {profile?.website || "No website provided"}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Social Media
                </Typography>
                <Box>
                  {profile?.socialLinks?.youtube && (
                    <Typography>
                      YouTube: {profile.socialLinks.youtube}
                    </Typography>
                  )}
                  {profile?.socialLinks?.instagram && (
                    <Typography>
                      Instagram: {profile.socialLinks.instagram}
                    </Typography>
                  )}
                  {profile?.socialLinks?.twitter && (
                    <Typography>
                      Twitter: {profile.socialLinks.twitter}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <YouTubeAnalytics />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;
