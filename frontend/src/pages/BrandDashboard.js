import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import CreateCampaignButton from "../components/CreateCampaignButton/CreateCampaignButton";
import "./BrandDashboard.css";

const BrandDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="brand-dashboard">
      <div className="dashboard-header">
        <h1>Brand Dashboard</h1>
        <CreateCampaignButton />
      </div>
      <div className="dashboard-content">
        <Container>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              Brand Dashboard
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Welcome back, {user?.name}!
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Company Details</Typography>
                    <Typography>Company: {user?.companyName}</Typography>
                    <Typography>Industry: {user?.industry}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </div>
    </div>
  );
};

export default BrandDashboard;
