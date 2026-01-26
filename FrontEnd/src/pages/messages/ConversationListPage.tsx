import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import { conversationService } from "../../service/conversationService";
import type { ConversationResponse } from "../../service/conversationService";
import { useToast } from "../../hooks/useToast";
import { formatDate } from "../../libs/dateUtils";
import ChatBox from "../../components/chat/ChatBox";
import { useAuthStore } from "../../store/authStore";

import { webSocketService } from "../../service/webSocketService";

const ConversationListPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useToast();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ConversationResponse[]>(
    [],
  );
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const currentUserId = user?.userId || 0;
  const currentUserType: "STUDENT" | "INSTRUCTOR" = user?.roles?.includes(
    "INSTRUCTOR",
  )
    ? "INSTRUCTOR"
    : "STUDENT";

  const fetchConversations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await conversationService.getMyConversations(0, 20, {
        keyword: searchTerm || undefined,
      });

      if (response && response.data) {
        setConversations(response.data);
        // Auto-select first conversation if none selected
        if (!selectedConversation && response.data.length > 0) {
          setSelectedConversation(response.data[0]);
        }
      }
    } catch (error: any) {
      if (!silent) {
        enqueueSnackbar(error.message || "Lỗi khi tải conversations", {
          variant: "error",
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [searchTerm, currentUserType]);

  useEffect(() => {
    if (user?.userId) {
      if (!webSocketService.isConnected()) {
        webSocketService.connect(user.userId.toString());
      }

      const handleNotification = (notif: any) => {
        // If it's a message notification, refresh the list silently
        if (notif.type === "INFO") {
          fetchConversations(true);
        }
      };

      webSocketService.addNotificationListener(handleNotification);
      return () => {
        webSocketService.removeNotificationListener(handleNotification);
      };
    }
  }, [user?.userId]);

  const getUnreadCount = (conversation: ConversationResponse) => {
    return currentUserType === "STUDENT"
      ? conversation.studentUnreadCount
      : conversation.instructorUnreadCount;
  };

  const getOtherUserName = (conversation: ConversationResponse) => {
    return currentUserType === "STUDENT"
      ? conversation.instructorName
      : conversation.studentName;
  };

  const getLastMessagePreview = (conversation: ConversationResponse) => {
    if (!conversation.lastMessageContent && !conversation.lastMessageIsImage) {
      return "Chưa có tin nhắn";
    }

    const content =
      conversation.lastMessageIsImage &&
      (!conversation.lastMessageContent ||
        conversation.lastMessageContent.trim() === "")
        ? "[Hình ảnh]"
        : conversation.lastMessageContent;

    // Check if current user sent the last message
    const isOwnMessage =
      currentUserType === "STUDENT"
        ? conversation.lastMessageSenderType === "STUDENT"
        : conversation.lastMessageSenderType === "INSTRUCTOR";

    if (isOwnMessage) {
      return `Bạn: ${content}`;
    } else {
      const senderName =
        currentUserType === "STUDENT"
          ? conversation.instructorName
          : conversation.studentName;
      return `${senderName}: ${content}`;
    }
  };

  const getOtherUserAvatar = (conversation: ConversationResponse) => {
    return currentUserType === "STUDENT"
      ? conversation.instructorAvatar
      : conversation.studentAvatar;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        sx={{
          height: "calc(100vh - 130px)",
          display: "flex",
          gap: 0,
          bgcolor: "white",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Sidebar - Conversation List */}
        <Box
          sx={{
            width: { xs: "100%", md: 380 },
            display: { xs: selectedConversation ? "none" : "flex", md: "flex" },
            flexDirection: "column",
            borderRight: 1,
            borderColor: "divider",
          }}
        >
          {/* Header */}
          <Box sx={{ p: 3, bgcolor: "primary.main", color: "white" }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <ChatIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Tin nhắn
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {conversations.length} cuộc trò chuyện
                </Typography>
              </Box>
            </Stack>

            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "white" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  borderRadius: "12px",
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  "& fieldset": {
                    borderColor: "transparent",
                  },
                  "&:hover fieldset": {
                    borderColor: alpha(theme.palette.common.white, 0.3),
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                },
              }}
            />
          </Box>

          {/* Conversation List */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : conversations.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <ChatIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Chưa có cuộc trò chuyện nào
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {conversations.map((conversation, index) => {
                  const unreadCount = getUnreadCount(conversation);
                  const isSelected =
                    selectedConversation?.conversationId ===
                    conversation.conversationId;

                  return (
                    <Box key={conversation.conversationId}>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={isSelected}
                          onClick={() => setSelectedConversation(conversation)}
                          sx={{
                            py: 2,
                            px: 2,
                            "&.Mui-selected": {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              borderLeft: 4,
                              borderColor: "primary.main",
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              badgeContent={unreadCount}
                              color="error"
                              overlap="circular"
                            >
                              <Avatar
                                src={getOtherUserAvatar(conversation)}
                                alt={getOtherUserName(conversation)}
                              >
                                {getOtherUserName(conversation).charAt(0)}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={unreadCount > 0 ? 700 : 600}
                                  noWrap
                                >
                                  {getOtherUserName(conversation)}
                                </Typography>
                                {conversation.lastMessageAt && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formatDate(conversation.lastMessageAt)}
                                  </Typography>
                                )}
                              </Stack>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "block",
                                    mb: 0.5,
                                  }}
                                >
                                  {conversation.courseName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  noWrap
                                  sx={{
                                    fontWeight: unreadCount > 0 ? 600 : 400,
                                  }}
                                >
                                  {getLastMessagePreview(conversation)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < conversations.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </Box>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>

        {/* Main Chat Area */}
        <Box
          sx={{
            flex: 1,
            display: { xs: selectedConversation ? "flex" : "none", md: "flex" },
            flexDirection: "column",
            bgcolor: "grey.50",
          }}
        >
          {selectedConversation ? (
            <Box
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "white",
                  borderBottom: 1,
                  borderColor: "divider",
                  boxShadow: 1,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={getOtherUserAvatar(selectedConversation)}
                    alt={getOtherUserName(selectedConversation)}
                  >
                    {getOtherUserName(selectedConversation).charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {getOtherUserName(selectedConversation)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedConversation.courseName}
                    </Typography>
                  </Box>
                  {selectedConversation.isLocked && (
                    <Chip label="Đã khóa" size="small" color="error" />
                  )}
                </Stack>
              </Box>

              {/* Chat Box */}
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <ChatBox
                  conversationId={selectedConversation.conversationId}
                  currentUserId={currentUserId}
                  currentUserType={currentUserType}
                  onMessageSent={() => fetchConversations(true)}
                />
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                p: 3,
                textAlign: "center",
              }}
            >
              <ChatIcon sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={1}>
                Chọn một cuộc trò chuyện
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ConversationListPage;
