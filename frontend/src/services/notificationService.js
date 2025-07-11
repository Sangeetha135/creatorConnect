import axios from "axios";

const API_URL = "/api/notifications";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getNotifications = async () => {
  try {
    console.log("Fetching notifications from:", API_URL);
    const response = await axios.get(API_URL);
    console.log("Raw notification response:", response);
    console.log("Notification data:", response.data);
    console.log(
      "ALL_INVITATIONS_REJECTED notifications:",
      response.data.filter((n) => n.type === "ALL_INVITATIONS_REJECTED")
    );
    return response.data;
  } catch (error) {
    console.error("Notification fetch error:", error);
    throw error.response?.data?.message || "Failed to fetch notifications";
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`${API_URL}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message || "Failed to mark notification as read"
    );
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await axios.put(`${API_URL}/read-all`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to mark all notifications as read"
    );
  }
};
