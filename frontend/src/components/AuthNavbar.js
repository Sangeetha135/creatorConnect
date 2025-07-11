import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EmailIcon from "@mui/icons-material/Email";
import io from "socket.io-client";
import { useUnread } from "../context/UnreadContext";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

const AuthNavbar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    unreadMessages,
    unreadNotifications,
    fetchUnreadMessageCount,
    fetchUnreadNotificationCount,
  } = useUnread();

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
  }, [user, fetchUnreadMessageCount, fetchUnreadNotificationCount]);

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
    dispatch(logout());
    navigate("/login");
    handleClose();
  };

  const handleProfile = () => {
    navigate("/profile");
    handleClose();
  };

  const handleDashboard = () => {
    navigate("/dashboard");
    handleClose();
  };

  const handleProfileClick = () => {
    handleProfile();
  };

  const handleLogoutClick = () => {
    handleLogout();
  };

  const isMenuOpen = Boolean(anchorEl);

  const handleMenuClose = () => {
    handleClose();
  };

  const renderMobileMenu = (
    <IconButton onClick={handleMenu} sx={{ padding: 0 }}>
      <Avatar
        src={
          user?.profilePictureUrl ||
          `https://ui-avatars.com/api/?name=${
            user?.name || "User"
          }&background=random`
        }
        alt={user?.name}
        sx={{ width: 40, height: 40 }}
      />
    </IconButton>
  );

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
          }}
        >
          Influencer Platform
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          {user?.role === "brand" && (
            <>
              <Button color="inherit" component={Link} to="/campaigns/create">
                Create Campaign
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/campaigns/completed"
              >
                Completed Campaigns
              </Button>
            </>
          )}
          {user?.role === "influencer" ? (
            <>
              <Button color="inherit" component={Link} to="/campaigns">
                Browse Campaigns
              </Button>
              <Button color="inherit" component={Link} to="/campaigns/accepted">
                My Campaigns
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/campaigns/completed"
              >
                Completed Campaigns
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/campaigns">
              Campaigns
            </Button>
          )}

          <IconButton color="inherit" component={Link} to="/messages">
            <Badge badgeContent={unreadMessages} color="error">
              <EmailIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" component={Link} to="/notifications">
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {renderMobileMenu}
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleProfileClick}>
              <IconButton size="small" color="inherit">
                <PersonIcon fontSize="small" />
              </IconButton>
              <p>Profile</p>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <IconButton size="small" color="inherit">
                <LogoutIcon fontSize="small" />
              </IconButton>
              <p>Logout</p>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AuthNavbar;
