import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Badge,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  CheckCircleOutline as ReadIcon,
  Check as SentIcon,
  Done as DeliveredIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import axios from "axios";
import io from "socket.io-client";

const Chat = ({ campaignId, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [attachmentAnchor, setAttachmentAnchor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const token = localStorage.getItem("token");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on("userTyping", ({ userId }) => {
      if (userId === otherUser._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [token, otherUser._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `/api/messages/${campaignId}/${otherUser._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data);
        setLoading(false);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching messages:", error);
        setLoading(false);
      }
    };

    if (campaignId && otherUser?._id) {
      fetchMessages();
    }
  }, [campaignId, otherUser, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || loading) return;

    try {
      const formData = new FormData();
      if (newMessage.trim()) {
        formData.append("content", newMessage.trim());
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("receiverId", otherUser._id);
      formData.append("campaignId", campaignId);

      const response = await axios.post("/api/messages", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      setSelectedFile(null);
      setPreviewDialog(false);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = () => {
    if (socket && otherUser?._id) {
      socket.emit("typing", { receiverId: otherUser._id });
    }
  };

  const handleAttachmentClick = (event) => {
    setAttachmentAnchor(event.currentTarget);
  };

  const handleAttachmentClose = () => {
    setAttachmentAnchor(null);
  };

  const handleFileSelect = (type) => {
    handleAttachmentClose();
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewDialog(true);
    }
  };

  const handlePreviewClose = () => {
    setSelectedFile(null);
    setPreviewDialog(false);
  };

  const getMessageStatus = (message) => {
    if (message.read) {
      return <ReadIcon sx={{ fontSize: 16, color: "success.main" }} />;
    } else if (message.delivered) {
      return <DeliveredIcon sx={{ fontSize: 16, color: "primary.main" }} />;
    } else {
      return <SentIcon sx={{ fontSize: 16, color: "text.secondary" }} />;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        height: "800px",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={otherUser.profileImage} alt={otherUser.name} />
          <Box>
            <Typography variant="subtitle1">{otherUser.name}</Typography>
            {isTyping && (
              <Typography variant="caption" color="text.secondary">
                typing...
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <List sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {messages.map((message) => (
          <ListItem
            key={message._id}
            sx={{
              flexDirection:
                message.sender._id === otherUser._id ? "row" : "row-reverse",
              alignItems: "flex-start",
            }}
          >
            <ListItemAvatar>
              <Avatar src={message.sender.profileImage} />
            </ListItemAvatar>
            <Box
              sx={{
                maxWidth: "80%",
                ml: message.sender._id === otherUser._id ? 1 : 0,
                mr: message.sender._id === otherUser._id ? 0 : 1,
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  bgcolor:
                    message.sender._id === otherUser._id
                      ? "grey.100"
                      : "primary.main",
                  color:
                    message.sender._id === otherUser._id
                      ? "text.primary"
                      : "white",
                }}
              >
                {message.fileUrl && (
                  <Box sx={{ mb: 1 }}>
                    {message.fileType?.startsWith("image/") ? (
                      <img
                        src={message.fileUrl}
                        alt="Shared"
                        style={{ maxWidth: "100%", borderRadius: 4 }}
                      />
                    ) : (
                      <Button
                        startIcon={<FileIcon />}
                        variant="outlined"
                        size="small"
                        href={message.fileUrl}
                        target="_blank"
                        sx={{
                          color:
                            message.sender._id === otherUser._id
                              ? "primary.main"
                              : "white",
                          borderColor: "currentcolor",
                        }}
                      >
                        {message.fileName}
                      </Button>
                    )}
                  </Box>
                )}
                {message.content && (
                  <Typography variant="body1">{message.content}</Typography>
                )}
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {format(new Date(message.createdAt), "HH:mm")}
                  </Typography>
                  {message.sender._id !== otherUser._id &&
                    getMessageStatus(message)}
                </Box>
              </Paper>
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <form onSubmit={handleSendMessage}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleAttachmentClick}>
                    <AttachFileIcon />
                  </IconButton>
                  <IconButton
                    type="submit"
                    disabled={!newMessage.trim() && !selectedFile}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx"
      />

      <Menu
        anchorEl={attachmentAnchor}
        open={Boolean(attachmentAnchor)}
        onClose={handleAttachmentClose}
      >
        <MenuItem onClick={() => handleFileSelect("image")}>
          <ImageIcon sx={{ mr: 1 }} /> Image
        </MenuItem>
        <MenuItem onClick={() => handleFileSelect("file")}>
          <FileIcon sx={{ mr: 1 }} /> Document
        </MenuItem>
      </Menu>

      <Dialog
        open={previewDialog}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            width: "1000px",
            maxWidth: "95vw",
          },
        }}
      >
        <DialogTitle>Send File</DialogTitle>
        <DialogContent>
          {selectedFile && selectedFile.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: 300 }}
            />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FileIcon />
              <Typography>{selectedFile?.name}</Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Add a message..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Chat;
