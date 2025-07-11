import axios from "axios";

const API_URL = "http://localhost:3000/api/content";

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

export const submitContent = async (campaignId, contentData) => {
  try {
    const response = await axios.post(`${API_URL}/submit`, {
      campaignId,
      ...contentData,
    });
    return response.data;
  } catch (error) {
    console.error("Submit content error:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to submit content";
  }
};

export const reviewContent = async (contentId, status) => {
  try {
    const response = await axios.put(`${API_URL}/${contentId}/review`, {
      status: status.toString(),
    });
    return response.data;
  } catch (error) {
    console.error("Review content error:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to review content";
  }
};

export const getContentById = async (contentId) => {
  try {
    const response = await axios.get(`${API_URL}/${contentId}`);
    return response.data;
  } catch (error) {
    console.error("Get content error:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to fetch content";
  }
};
