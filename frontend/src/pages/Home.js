import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "./Home.css";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Avatar,
  Chip,
  Snackbar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  getAllPosts,
  createPost,
  toggleLike,
  sharePost,
} from "../services/postService";
import SearchBar from "../components/Search/SearchBar.jsx";
import axios from "axios";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DeleteIcon from "@mui/icons-material/Delete";

const fontAwesomeScript = document.createElement("link");
fontAwesomeScript.rel = "stylesheet";
fontAwesomeScript.href =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
document.head.appendChild(fontAwesomeScript);

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState([]);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [currentMediaUrl, setCurrentMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [activeTab, setActiveTab] = useState("all");
  const [filterLoading, setFilterLoading] = useState(false);
  const [shareMenuAnchorEl, setShareMenuAnchorEl] = useState(null);
  const [currentSharePostId, setCurrentSharePostId] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
  });

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    setSidebarLoading(true);
    try {
      const usersResponse = await axios.get("/api/users/suggested", {
        params: {
          role: user?.role === "brand" ? "influencer" : "brand",
          limit: 3,
        },
      });
      setSuggestedUsers(usersResponse.data || []);

      const hashtagsResponse = await axios.get("/api/posts/trending-hashtags");
      setTrendingHashtags(hashtagsResponse.data || []);

      if (user?.role === "influencer") {
        const campaignsResponse = await axios.get("/api/campaigns", {
          params: { status: "upcoming", limit: 3 },
        });
        setUpcomingCampaigns(campaignsResponse.data || []);
      }
    } catch (err) {
      console.error("Error fetching sidebar data:", err);
    } finally {
      setSidebarLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getAllPosts();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setFilterLoading(true);
    setActiveTab(tab);
    try {
      const data = await getAllPosts();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
    } finally {
      setFilterLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (activeTab === "all") return posts;
    return posts.filter(
      (post) =>
        post.user?.role === (activeTab === "brands" ? "brand" : "influencer")
    );
  }, [posts, activeTab]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newPostContent.trim() && mediaUrls.length === 0) {
        setError("Please add some content or media to your post");
        return;
      }

      const postData = {
        content: newPostContent,
        media: mediaUrls,
      };

      const newPost = await createPost(postData);
      setPosts((prevPosts) => [newPost, ...prevPosts]);

      setNewPostContent("");
      setMediaUrls([]);
      setShowMediaInput(false);
      setCurrentMediaUrl("");
      setMediaType("image");
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to create post");
    }
  };

  const handleLike = async (postId) => {
    try {
      const updatedPost = await toggleLike(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (err) {
      setError(err.message || "Failed to toggle like");
    }
  };

  const handleShareClick = (event, postId) => {
    setCurrentSharePostId(postId);
    setShareMenuAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareMenuAnchorEl(null);
    setCurrentSharePostId(null);
  };

  const handleShare = async (platform) => {
    try {
      if (!currentSharePostId) return;

      await sharePost(currentSharePostId, platform);

      if (platform === "copy") {
        const postUrl = `${window.location.origin}/posts/${currentSharePostId}`;
        navigator.clipboard.writeText(postUrl);
        setNotification({ open: true, message: "Link copied to clipboard!" });
      } else {
        setNotification({ open: true, message: `Shared on ${platform}!` });
      }

      handleShareClose();
    } catch (err) {
      setError(err.message || "Failed to share post");
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatVideoUrl = (url) => {
    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId;
        if (url.includes("youtu.be")) {
          videoId = url.split("youtu.be/")[1]?.split("?")[0];
        } else if (url.includes("youtube.com/watch")) {
          videoId = new URL(url).searchParams.get("v");
        } else if (url.includes("youtube.com/embed/")) {
          videoId = url.split("embed/")[1]?.split("?")[0];
        }

        if (!videoId) {
          throw new Error("Invalid YouTube URL");
        }
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (url.includes("vimeo.com")) {
        const vimeoId = url
          .split("vimeo.com/")[1]
          ?.split("?")[0]
          ?.split("/")[0];
        if (!vimeoId) {
          throw new Error("Invalid Vimeo URL");
        }
        return `https://player.vimeo.com/video/${vimeoId}`;
      }

      if (url.includes("/embed/")) {
        return url;
      }

      throw new Error("Please use a YouTube or Vimeo URL");
    } catch (error) {
      throw new Error(error.message || "Invalid video URL format");
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const addMediaUrl = () => {
    if (currentMediaUrl.trim()) {
      try {
        let formattedUrl = currentMediaUrl.trim();
        console.log("Processing URL:", formattedUrl);

        if (mediaType === "video") {
          try {
            formattedUrl = formatVideoUrl(formattedUrl);
            console.log("Formatted video URL:", formattedUrl);
          } catch (error) {
            console.error("Video URL formatting error:", error);
            setError(error.message);
            return;
          }
        } else {
          if (!isValidUrl(formattedUrl)) {
            setError("Invalid image URL");
            return;
          }
        }

        console.log("Adding media URL:", {
          url: formattedUrl,
          type: mediaType,
        });
        setMediaUrls((prev) => [
          ...prev,
          { url: formattedUrl, type: mediaType },
        ]);
        setCurrentMediaUrl("");
        setError(null);
      } catch (error) {
        console.error("Add media error:", error);
        setError(error.message || "Invalid URL format");
      }
    }
  };

  const removeMediaUrl = (indexToRemove) => {
    setMediaUrls(mediaUrls.filter((_, index) => index !== indexToRemove));
  };

  const toggleMediaInput = (type) => {
    setMediaType(type);
    setShowMediaInput((prev) => !prev);
    if (showMediaInput && mediaType === type) {
      setCurrentMediaUrl("");
    }
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/posts/${postToDelete._id}`);
      setPosts(posts.filter((p) => p._id !== postToDelete._id));
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete post");
    }
  };

  if (loading && !posts.length) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mt: 2, mb: 6 }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}
        >
          Find Brands and Creators
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Connect with brands and creators that match your interests
        </Typography>
        <Box sx={{ maxWidth: "800px", mx: "auto" }}>
          <SearchBar />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Paper
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <button
                className={`filter-btn ${activeTab === "all" ? "active" : ""}`}
                onClick={() => handleTabChange("all")}
                disabled={filterLoading}
              >
                <i className="fas fa-globe"></i> All Posts
              </button>
              <button
                className={`filter-btn ${
                  activeTab === "brands" ? "active" : ""
                }`}
                onClick={() => handleTabChange("brands")}
                disabled={filterLoading}
              >
                <i className="fas fa-building"></i> Brands
              </button>
              <button
                className={`filter-btn ${
                  activeTab === "influencers" ? "active" : ""
                }`}
                onClick={() => handleTabChange("influencers")}
                disabled={filterLoading}
              >
                <i className="fas fa-star"></i> Influencers
              </button>
            </Box>
          </Paper>

          <Paper
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
            className="create-post"
          >
            <div className="post-header">
              <img
                src={
                  user?.profilePictureUrl ||
                  `https://ui-avatars.com/api/?name=${
                    user?.name || "User"
                  }&background=random`
                }
                alt={user?.name}
                className="user-avatar"
              />
              <div className="post-meta">
                <h4>{user?.name}</h4>
                <span className={`role-badge ${user?.role}`}>{user?.role}</span>
              </div>
            </div>
            <form onSubmit={handlePostSubmit} className="post-form">
              <textarea
                placeholder={
                  user?.role === "brand"
                    ? "Share updates about your brand or campaigns..."
                    : "Share your content or experiences..."
                }
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="post-input"
                rows={3}
              />
              {showMediaInput && (
                <div className="media-input-container">
                  <input
                    type="url"
                    placeholder={`Enter ${mediaType} URL...`}
                    value={currentMediaUrl}
                    onChange={(e) => setCurrentMediaUrl(e.target.value)}
                    className="media-input"
                  />
                  <button
                    type="button"
                    onClick={addMediaUrl}
                    className="add-media-btn"
                  >
                    Add {mediaType}
                  </button>
                </div>
              )}
              {mediaUrls.length > 0 && (
                <div className="media-previews">
                  {mediaUrls.map((media, index) => (
                    <div key={index} className="media-preview">
                      {media.type === "image" ? (
                        <img src={media.url} alt="Preview" />
                      ) : (
                        <iframe
                          src={media.url}
                          title={`Video preview ${index + 1}`}
                          frameBorder="0"
                          allowFullScreen
                        />
                      )}
                      <button
                        type="button"
                        className="remove-media"
                        onClick={() => removeMediaUrl(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="post-actions">
                <div className="media-buttons">
                  <button
                    type="button"
                    className={`media-btn ${
                      showMediaInput && mediaType === "image" ? "active" : ""
                    }`}
                    onClick={() => toggleMediaInput("image")}
                  >
                    <i className="fas fa-image"></i>
                  </button>
                  <button
                    type="button"
                    className={`media-btn ${
                      showMediaInput && mediaType === "video" ? "active" : ""
                    }`}
                    onClick={() => toggleMediaInput("video")}
                  >
                    <i className="fas fa-video"></i>
                  </button>
                </div>
                <div className="action-buttons">
                  {user?.role === "brand" && (
                    <Link to="/campaigns/create" className="campaign-btn">
                      <i className="fas fa-bullhorn"></i>
                      Create Campaign
                    </Link>
                  )}
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={!newPostContent.trim() && mediaUrls.length === 0}
                  >
                    Post
                  </button>
                </div>
              </div>
            </form>
          </Paper>

          {loading || filterLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
            </Box>
          ) : filteredPosts.length === 0 ? (
            <Paper
              sx={{
                p: 2.5,
                textAlign: "center",
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No posts found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {activeTab === "all"
                  ? "Be the first to create a post!"
                  : `No posts from ${
                      activeTab === "brands" ? "brands" : "influencers"
                    } yet.`}
              </Typography>
            </Paper>
          ) : (
            filteredPosts.map((post) => (
              <Paper
                key={post._id}
                sx={{
                  p: 2.5,
                  mb: 2.5,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
                className="post-card"
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Box
                    className="post-author"
                    component={Link}
                    to={`/profile/${post.user?._id}`}
                    sx={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      src={
                        post.user?.profilePictureUrl ||
                        `https://ui-avatars.com/api/?name=${
                          post.user?.name || "User"
                        }&background=random`
                      }
                      alt={post.user?.name}
                      sx={{ width: 40, height: 40, mr: 1.5 }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, lineHeight: 1.2 }}
                      >
                        {post.user?.name}
                      </Typography>
                      <Chip
                        label={
                          post.user?.role === "brand"
                            ? "🏢 Brand"
                            : "⭐ Creator"
                        }
                        size="small"
                        sx={{
                          height: 20,
                          backgroundColor:
                            post.user?.role === "brand"
                              ? "rgba(25, 118, 210, 0.1)"
                              : "rgba(220, 0, 78, 0.1)",
                          color:
                            post.user?.role === "brand" ? "#1976d2" : "#c2185b",
                          fontSize: "0.7rem",
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                    {post.user?._id === user._id && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(post)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ mb: 1.5, whiteSpace: "pre-wrap" }}
                >
                  {post.content}
                </Typography>

                {post.media && post.media.length > 0 && (
                  <Box
                    sx={{
                      mt: 1.5,
                      mb: 1.5,
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Grid container spacing={1}>
                      {post.media.map((media, index) => (
                        <Grid
                          item
                          xs={post.media.length > 1 ? 6 : 12}
                          key={index}
                        >
                          <Box
                            sx={{
                              borderRadius: 1,
                              overflow: "hidden",
                              height:
                                media.type === "image"
                                  ? post.media.length > 1
                                    ? 200
                                    : 300
                                  : post.media.length > 1
                                  ? 180
                                  : 280,
                              position: "relative",
                            }}
                          >
                            {media.type === "image" ? (
                              <img
                                src={media.url}
                                alt="Post content"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <iframe
                                src={media.url}
                                title="Video content"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ width: "100%", height: "100%" }}
                              />
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <IconButton
                      onClick={() => handleLike(post._id)}
                      size="small"
                      color={
                        post.likes?.includes(user._id) ? "error" : "default"
                      }
                    >
                      {post.likes?.includes(user._id) ? (
                        <i
                          className="fas fa-heart"
                          style={{ color: "#f44336", fontSize: "1.2rem" }}
                        ></i>
                      ) : (
                        <i
                          className="far fa-heart"
                          style={{ fontSize: "1.2rem" }}
                        ></i>
                      )}
                    </IconButton>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ ml: 0.5, color: "text.secondary" }}
                    >
                      {post.likes?.length || 0}
                    </Typography>
                  </Box>

                  <Box>
                    <IconButton
                      onClick={(e) => handleShareClick(e, post._id)}
                      size="small"
                    >
                      <i
                        className="fas fa-share-alt"
                        style={{ fontSize: "1.2rem" }}
                      ></i>
                    </IconButton>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ ml: 0.5, color: "text.secondary" }}
                    >
                      {post.shares || 0}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))
          )}
        </Grid>
      </Grid>

      <Menu
        anchorEl={shareMenuAnchorEl}
        open={Boolean(shareMenuAnchorEl)}
        onClose={handleShareClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: 2,
            "& .MuiMenuItem-root": {
              py: 1,
            },
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ px: 2, py: 1, fontWeight: 600, color: "text.secondary" }}
        >
          Share via
        </Typography>
        <MenuItem onClick={() => handleShare("copy")} sx={{ gap: 1.5 }}>
          <ContentCopyIcon fontSize="small" sx={{ color: "#555" }} />
          Copy link
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleShare("facebook")} sx={{ gap: 1.5 }}>
          <FacebookIcon fontSize="small" sx={{ color: "#3b5998" }} />
          Facebook
        </MenuItem>
        <MenuItem onClick={() => handleShare("twitter")} sx={{ gap: 1.5 }}>
          <TwitterIcon fontSize="small" sx={{ color: "#1DA1F2" }} />
          Twitter
        </MenuItem>
        <MenuItem onClick={() => handleShare("linkedin")} sx={{ gap: 1.5 }}>
          <LinkedInIcon fontSize="small" sx={{ color: "#0e76a8" }} />
          LinkedIn
        </MenuItem>
        <MenuItem onClick={() => handleShare("whatsapp")} sx={{ gap: 1.5 }}>
          <WhatsAppIcon fontSize="small" sx={{ color: "#25D366" }} />
          WhatsApp
        </MenuItem>
      </Menu>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={closeNotification}
        message={notification.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;
