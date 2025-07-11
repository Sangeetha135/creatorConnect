import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EmailIcon from "@mui/icons-material/Email";
import io from "socket.io-client";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000", {
        auth: { token: localStorage.getItem("token") },
      });

      setSocket(newSocket);

      newSocket.on("newMessage", () => {
        fetchUnreadMessageCount();
      });

      newSocket.on("newNotification", () => {
        fetchUnreadNotificationCount();
      });

      fetchUnreadMessageCount();
      fetchUnreadNotificationCount();

      return () => newSocket.disconnect();
    }
  }, [user]);

  const fetchUnreadMessageCount = async () => {
    try {
      const response = await axios.get("/api/messages/unread-counts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const totalUnread = Object.values(response.data).reduce(
        (a, b) => a + b,
        0
      );
      setUnreadMessages(totalUnread);
    } catch (error) {
      console.error("Error fetching unread message count:", error);
    }
  };

  const fetchUnreadNotificationCount = async () => {
    try {
      const response = await axios.get("/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUnreadNotifications(response.data.count);
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            INFLUENCER
          </Typography>

          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            {user && (
              <>
                <Button
                  component={Link}
                  to="/dashboard"
                  sx={{ color: "white", display: "block", mx: 1 }}
                >
                  Dashboard
                </Button>
                {user.role === "brand" ? (
                  <Button
                    component={Link}
                    to="/campaigns"
                    sx={{ color: "white", display: "block", mx: 1 }}
                  >
                    My Campaigns
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to="/browse-campaigns"
                    sx={{ color: "white", display: "block", mx: 1 }}
                  >
                    Browse Campaigns
                  </Button>
                )}
              </>
            )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <IconButton
                  component={Link}
                  to="/messages"
                  sx={{ color: "white", mr: 2 }}
                >
                  <Badge badgeContent={unreadMessages} color="error">
                    <EmailIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  component={Link}
                  to="/notifications"
                  sx={{ color: "white", mr: 2 }}
                >
                  <Badge badgeContent={unreadNotifications} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                  <Avatar alt={user.name} src={user.profileImage} />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleClose}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button component={Link} to="/login" sx={{ color: "white" }}>
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
