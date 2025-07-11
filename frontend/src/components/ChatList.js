import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondary,
  Avatar,
  Typography,
  Badge,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  CheckCircleOutline as ReadIcon,
  RadioButtonUnchecked as UnreadIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material";
import { format, isToday, isYesterday } from "date-fns";
import axios from "axios";

const ChatList = ({ onSelectChat, selectedChat, searchQuery, filter }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get("/api/messages/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await axios.get("/api/messages/unread-counts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCounts(response.data);
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };

    fetchUnreadCounts();
  }, [token]);

  const formatMessageDate = (date) => {
    if (isToday(new Date(date))) {
      return format(new Date(date), "HH:mm");
    } else if (isYesterday(new Date(date))) {
      return "Yesterday";
    } else {
      return format(new Date(date), "MMM d");
    }
  };

  const filteredConversations = conversations
    .filter((conversation) => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          conversation.otherUser.name.toLowerCase().includes(searchLower) ||
          conversation.campaignTitle?.toLowerCase().includes(searchLower) ||
          conversation.lastMessage?.content.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter((conversation) => {
      switch (filter) {
        case "unread":
          return unreadCounts[conversation._id] > 0;
        case "active":
          return conversation.isActive;
        default:
          return true;
      }
    });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ height: "600px", overflow: "auto" }}>
      <List>
        {filteredConversations.map((conversation) => (
          <ListItem
            key={conversation._id}
            button
            onClick={() => onSelectChat(conversation)}
            selected={selectedChat?._id === conversation.otherUser._id}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "primary.light",
                "&:hover": {
                  backgroundColor: "primary.light",
                },
              },
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <ListItemAvatar>
              <Badge
                color="error"
                badgeContent={unreadCounts[conversation._id] || 0}
                invisible={!unreadCounts[conversation._id]}
              >
                <Avatar
                  src={conversation.otherUser.profileImage}
                  alt={conversation.otherUser.name}
                />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {conversation.otherUser.name}
                  </Typography>
                  {conversation.campaignTitle && (
                    <Chip
                      icon={<CampaignIcon sx={{ fontSize: 16 }} />}
                      label={conversation.campaignTitle}
                      size="small"
                      variant="outlined"
                      sx={{ maxWidth: 120 }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {conversation.lastMessage?.read ? (
                    <ReadIcon sx={{ fontSize: 12, color: "success.main" }} />
                  ) : (
                    <UnreadIcon
                      sx={{ fontSize: 12, color: "text.secondary" }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ flex: 1 }}
                  >
                    {conversation.lastMessage?.content || "No messages yet"}
                  </Typography>
                </Box>
              }
            />
            {conversation.lastMessage && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ minWidth: 50, textAlign: "right" }}
              >
                {formatMessageDate(conversation.lastMessage.createdAt)}
              </Typography>
            )}
          </ListItem>
        ))}
        {filteredConversations.length === 0 && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? "No conversations match your search"
                : filter === "unread"
                ? "No unread messages"
                : filter === "active"
                ? "No active conversations"
                : "No conversations yet"}
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
};

export default ChatList;
