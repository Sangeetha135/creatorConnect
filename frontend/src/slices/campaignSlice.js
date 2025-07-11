import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export const updateCampaignProgress = createAsyncThunk(
  "campaigns/updateProgress",
  async ({ campaignId, currentStep, completed }, { rejectWithValue }) => {
    try {
      console.log("Updating campaign progress:", {
        campaignId,
        currentStep,
        completed,
      });
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/campaigns/${campaignId}/progress`,
        { currentStep, completed },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Campaign progress updated successfully:", response.data);
      window.location.reload();

      return response.data;
    } catch (error) {
      console.error("Error updating campaign progress:", {
        error,
        url: `${API_BASE_URL}/api/campaigns/${campaignId}/progress`,
        status: error.response?.status,
        data: error.response?.data,
      });
      return rejectWithValue({
        message:
          error.response?.data?.message || "Failed to update campaign progress",
        error: error.response?.data || error.message,
      });
    }
  }
);

const campaignSlice = createSlice({
  name: "campaigns",
  initialState: {
    campaigns: [],
    currentCampaign: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateCampaignProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCampaignProgress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.campaigns.findIndex(
          (campaign) => campaign._id === action.payload._id
        );
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        if (state.currentCampaign?._id === action.payload._id) {
          state.currentCampaign = action.payload;
        }
      })
      .addCase(updateCampaignProgress.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update campaign progress";
        console.error("Campaign progress update failed:", action.payload);
      });
  },
});

export const { clearError } = campaignSlice.actions;
export default campaignSlice.reducer;
