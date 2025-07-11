import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Divider,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import ChatList from "../components/ChatList";
import Chat from "../components/Chat";
import axios from "axios";
import { useSelector } from "react-redux";
import { useUnread } from "../context/UnreadContext";
import io from "socket.io-client";

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [newMessageDialog, setNewMessageDialog] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignUsers, setCampaignUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { decrementMessageCount, fetchUnreadMessageCount } = useUnread();

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    });

    setSocket(newSocket);

    newSocket.on("newMessage", async (data) => {
      if (!selectedChat || data.senderId !== selectedChat._id) {
        await fetchUnreadMessageCount();
      }
    });

    newSocket.on("messagesRead", async () => {
      await fetchUnreadMessageCount();
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [selectedChat, fetchUnreadMessageCount]);

  useEffect(() => {
    if (newMessageDialog) {
      fetchCampaigns();
    }
  }, [newMessageDialog]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/campaigns", {
        params: { status: "active" },
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
    setLoading(false);
  };

  const fetchCampaignUsers = async (campaignId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/campaigns/${campaignId}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: {
          role: user.role === "brand" ? "influencer" : "brand",
        },
      });
      setCampaignUsers(response.data);
    } catch (error) {
      console.error("Error fetching campaign users:", error);
      alert("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (conversation) => {
    setSelectedChat({
      _id: conversation.otherUser._id,
      name: conversation.otherUser.name,
      profileImage: conversation.otherUser.profileImage,
      campaignId: conversation.campaignId,
      campaignTitle: conversation.campaignTitle,
    });

    if (conversation.unreadCount > 0) {
      markMessagesAsRead(conversation.otherUser._id, conversation.campaignId);
    }
  };

  const markMessagesAsRead = async (otherUserId, campaignId) => {
    try {
      await axios.post(
        "/api/messages/mark-read",
        {
          otherUserId,
          campaignId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (socket) {
        socket.emit("markMessagesRead", { otherUserId, campaignId });
      }

      await fetchUnreadMessageCount();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNewMessage = () => {
    setNewMessageDialog(true);
  };

  const handleCloseDialog = () => {
    setNewMessageDialog(false);
    setSelectedCampaign(null);
    setCampaignUsers([]);
  };

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
    fetchCampaignUsers(campaign._id);
  };

  const handleStartChat = (selectedUser) => {
    handleSelectChat({
      otherUser: {
        _id: selectedUser._id,
        name: selectedUser.name,
        profileImage: selectedUser.profileImage,
      },
      campaignId: selectedCampaign._id,
      campaignTitle: selectedCampaign.title,
    });
    handleCloseDialog();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewMessage}
        >
          New Message
        </Button>
      </Box>
      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={1.5}>
          <Paper sx={{ mb: 2, p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small">
                      <FilterListIcon color="action" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
            >
              <Tab label="All" />
              <Tab label="Unread" />
              <Tab label="Active" />
            </Tabs>
          </Paper>
          <ChatList
            onSelectChat={handleSelectChat}
            selectedChat={selectedChat}
            searchQuery={searchQuery}
            filter={
              activeTab === 1 ? "unread" : activeTab === 2 ? "active" : "all"
            }
          />
        </Grid>
        <Grid item xs={12} md={10.5}>
          {selectedChat ? (
            <Box>
              {selectedChat.campaignTitle && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Campaign:
                  </Typography>
                  <Typography variant="body1">
                    {selectedChat.campaignTitle}
                  </Typography>
                </Paper>
              )}
              <Chat
                campaignId={selectedChat.campaignId}
                otherUser={selectedChat}
              />
            </Box>
          ) : (
            <Paper
              sx={{
                height: "800px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.grey[50],
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a conversation to start chatting
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your messages with brands and influencers will appear here
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewMessage}
                sx={{ mt: 2 }}
              >
                Start New Conversation
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Dialog
        open={newMessageDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            width: "1000px",
            maxWidth: "95vw",
          },
        }}
      >
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          {!selectedCampaign ? (
            <>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Select a campaign to start messaging:
              </Typography>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {campaigns.map((campaign) => (
                    <ListItem
                      key={campaign._id}
                      button
                      onClick={() => handleCampaignSelect(campaign)}
                    >
                      <ListItemText
                        primary={campaign.title}
                        secondary={`Created on ${new Date(
                          campaign.createdAt
                        ).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          ) : (
            <>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Select a {user.role === "brand" ? "creator" : "brand"} to
                message:
              </Typography>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : campaignUsers.length > 0 ? (
                <List>
                  {campaignUsers.map((campaignUser) => (
                    <ListItem
                      key={campaignUser._id}
                      button
                      onClick={() => handleStartChat(campaignUser)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={campaignUser.profileImage} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={campaignUser.name}
                        secondary={
                          campaignUser.role === "brand" ? "Brand" : "Creator"
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography color="text.secondary">
                    No {user.role === "brand" ? "creators" : "brands"} found for
                    this campaign
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {selectedCampaign && (
            <Button onClick={() => setSelectedCampaign(null)}>
              Back to Campaigns
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Messages;
