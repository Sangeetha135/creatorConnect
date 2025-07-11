import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import campaignReducer from "../features/campaigns/campaignSlice";

const loadState = () => {
  try {
    const serializedState = localStorage.getItem("auth");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("auth", serializedState);
  } catch (err) {
    console.error("Error saving state:", err);
  }
};

const preloadedState = {
  auth: loadState(),
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    campaigns: campaignReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  saveState(store.getState().auth);
});
