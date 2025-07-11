import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import CampaignForm from "../components/CampaignForm/CampaignForm";
import { createCampaign, reset } from "../features/campaigns/campaignSlice";
import axios from "../utils/axiosConfig";
import "./CreateCampaign.css";

const CreateCampaign = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.campaigns);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      console.log("Campaign created successfully, navigating...");
      navigate("/campaigns");
      dispatch(reset());
    }
  }, [success, navigate, dispatch]);

  useEffect(() => {
    console.log("Campaign state updated:", { loading, error, success });
  }, [loading, error, success]);

  const handleSubmit = async (formData) => {
    if (!user) {
      console.log("No user found, please log in");
      navigate("/login");
      return;
    }

    console.log("Handling form submission in CreateCampaign");
    console.log("Current user:", user);

    try {
      const campaignData = {};
      for (let [key, value] of formData.entries()) {
        try {
          campaignData[key] = JSON.parse(value);
        } catch {
          campaignData[key] = value;
        }
      }

      campaignData.brand = user._id;

      console.log("Sending campaign data:", campaignData);

      const response = await axios.post("/api/campaigns", campaignData);

      console.log("Campaign created successfully:", response.data);

      const requirements = campaignData.requirements;
      const platforms = campaignData.platforms;

      navigate(`/campaigns/${response.data._id}/suggestions`, {
        state: {
          campaignRequirements: {
            category: requirements.preferredCreatorCategory || "",
            minSubscribers: parseInt(requirements.minSubscribers) || 0,
            minAverageViews: parseInt(requirements.minViews) || 0,
            platforms: platforms || [],
            location: requirements.locationTargeting || "",
          },
        },
      });
    } catch (error) {
      console.error(
        "Error creating campaign:",
        error.response?.data || error.message
      );

      dispatch(reset());
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Create New Campaign
        </Typography>
        {error && (
          <div className="error-message">Error creating campaign: {error}</div>
        )}
        {loading ? (
          <div className="loading-spinner">Creating campaign...</div>
        ) : (
          <CampaignForm onSubmit={handleSubmit} />
        )}
      </Box>
    </Container>
  );
};

export default CreateCampaign;
