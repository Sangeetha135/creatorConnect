import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosConfig";
import CampaignForm from "../../components/CampaignForm/CampaignForm";

export const createCampaign = createAsyncThunk(
  "campaigns/create",
  async (campaignData, thunkAPI) => {
    try {
      console.log("createCampaign thunk started");
      const state = thunkAPI.getState();
      const user = state.auth.user;

      if (!user || !user.token) {
        console.error("Authentication error: No token found");
        throw new Error("No authentication token found");
      }

      console.log("User authenticated:", user.email);
      console.log("Setting up request config...");

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      console.log("Making API request to create campaign...");
      const response = await axios.post("/api/campaigns", campaignData, config);
      console.log("Campaign created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Campaign creation error:", error);
      console.error("Error response:", error.response?.data);
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchCampaigns = createAsyncThunk(
  "campaigns/fetchAll",
  async (params = {}, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const user = state.auth.user;

      if (!user || !user.token) {
        throw new Error("No authentication token found");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: {
          ...params,
          includeCompleted: params.includeCompleted || false,
        },
      };

      const response = await axios.get("/api/campaigns", config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const applyToCampaign = createAsyncThunk(
  "campaigns/apply",
  async (campaignId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `/api/campaigns/${campaignId}/apply`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const campaignSlice = createSlice({
  name: "campaigns",
  initialState: {
    campaigns: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    reset: (state) => {
      console.log("Resetting campaign state");
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCampaign.pending, (state) => {
        console.log("createCampaign.pending");
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        console.log("createCampaign.fulfilled:", action.payload);
        state.loading = false;
        state.success = true;
        state.campaigns.push(action.payload);
      })
      .addCase(createCampaign.rejected, (state, action) => {
        console.log("createCampaign.rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(applyToCampaign.fulfilled, (state) => {
        state.success = true;
      });
  },
});

export const { reset } = campaignSlice.actions;
export default campaignSlice.reducer;
