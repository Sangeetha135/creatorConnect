import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import io from "socket.io-client";

const UnreadContext = createContext();

export const UnreadProvider = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const newSocket = io("http://localhost:5000", {
        auth: { token },
      });

      setSocket(newSocket);

      newSocket.on("newMessage", () => {
        fetchUnreadMessageCount();
      });

      newSocket.on("messagesRead", () => {
        fetchUnreadMessageCount();
      });

      newSocket.on("newNotification", () => {
        fetchUnreadNotificationCount();
      });

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, []);

  const fetchUnreadMessageCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return 0;

      const response = await axios.get("/api/messages/unread-counts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const totalUnread = Object.values(response.data).reduce(
        (a, b) => a + b,
        0
      );
      setUnreadMessages(totalUnread);
      return totalUnread;
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      return 0;
    }
  }, []);

  const fetchUnreadNotificationCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return 0;

      const response = await axios.get("/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadNotifications(response.data.count);
      return response.data.count;
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      return 0;
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchUnreadMessageCount();
      fetchUnreadNotificationCount();
    }
  }, [fetchUnreadMessageCount, fetchUnreadNotificationCount]);

  const decrementMessageCount = useCallback(() => {
    setUnreadMessages((prev) => Math.max(0, prev - 1));
  }, []);

  const decrementNotificationCount = useCallback(() => {
    setUnreadNotifications((prev) => Math.max(0, prev - 1));
  }, []);

  const value = {
    unreadMessages,
    unreadNotifications,
    fetchUnreadMessageCount,
    fetchUnreadNotificationCount,
    decrementMessageCount,
    decrementNotificationCount,
    setUnreadMessages,
    setUnreadNotifications,
    socket,
  };

  return (
    <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>
  );
};

export const useUnread = () => {
  const context = useContext(UnreadContext);
  if (!context) {
    throw new Error("useUnread must be used within an UnreadProvider");
  }
  return context;
};
