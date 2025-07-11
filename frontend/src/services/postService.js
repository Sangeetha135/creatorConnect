import axios from "axios";

const API_URL = "http://localhost:5000/api/posts";

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

const getAllPosts = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log("Fetched posts:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to fetch posts";
  }
};

const createPost = async (postData) => {
  try {
    console.log("Sending post data:", postData);
    const response = await axios.post(API_URL, postData);
    console.log("Created post response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to create post";
  }
};

const toggleLike = async (postId) => {
  try {
    const response = await axios.put(`${API_URL}/${postId}/like`);
    console.log("Toggle like response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error toggling like:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to toggle like";
  }
};
const sharePost = async (postId, platform = "app") => {
  try {
    const response = await axios.post(`${API_URL}/${postId}/share`, {
      platform,
    });
    console.log("Share post response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sharing post:", error.response?.data || error);
    throw error.response?.data?.message || "Failed to share post";
  }
};

export { getAllPosts, createPost, toggleLike, sharePost };
