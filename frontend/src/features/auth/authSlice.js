import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import authService from "../../services/authService";
import axios from "../../utils/axiosConfig";

const user = JSON.parse(localStorage.getItem("user"));

export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post("/api/users/login", userData);
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        if (response.data.token) {
          authService.setToken(response.data.token);
        }
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const registerBrand = createAsyncThunk(
  "auth/registerBrand",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users/register/brand", userData);
      if (response.data) {
        if (response.data.token) {
          authService.setToken(response.data.token);
        }
        return response.data;
      }
    } catch (error) {
      console.error("Registration error details:", error.response?.data);
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Registration failed. Please try again.");
    }
  }
);

export const registerInfluencer = createAsyncThunk(
  "auth/registerInfluencer",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/api/users/register/influencer",
        userData
      );
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          authService.setToken(response.data.token);
        }
        return response.data;
      }
    } catch (error) {
      console.error("Registration error details:", error.response?.data);
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Registration failed. Please try again.");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users/verify-email", {
        email,
        code,
      });
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          authService.setToken(response.data.token);
        }
        return response.data;
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Failed to verify email");
    }
  }
);

export const resendVerificationCode = createAsyncThunk(
  "auth/resendVerificationCode",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users/resend-verification", {
        email,
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Failed to resend verification code");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.clear();
  authService.setToken(null);
});
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: user || null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(registerBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = authService.getToken();
        state.error = null;
      })
      .addCase(registerBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })
      .addCase(registerInfluencer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerInfluencer.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.error = null;
        state.isVerified = false;
      })
      .addCase(registerInfluencer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isVerified = true;
        state.user = action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendVerificationCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationCode.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendVerificationCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to resend code";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
