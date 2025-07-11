import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { fetchCampaigns } from "../features/campaigns/campaignSlice";

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { campaigns, loading, error } = useSelector((state) => state.campaigns);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      dispatch(fetchCampaigns());
    }
  }, [user, navigate, dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Creator Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">YouTube Stats</Typography>
                <Typography>
                  Subscribers: {user?.youtube?.subscriberCount || 0}
                </Typography>
                <Typography>
                  Total Views: {user?.youtube?.totalViews || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Available Campaigns
            </Typography>
            <Grid container spacing={2}>
              {campaigns.map((campaign) => (
                <Grid item xs={12} md={6} key={campaign._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{campaign.title}</Typography>
                      <Typography color="textSecondary">
                        Budget: ${campaign.budget}
                      </Typography>
                      <Typography variant="body2">
                        {campaign.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CreatorDashboard;
