import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  conversationService,
  messageService,
} from "../../service/conversationService";
import type {
  ConversationResponse,
  MessageResponse,
} from "../../service/conversationService";
import { useToast } from "../../hooks/useToast";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../libs/dateUtils";

import { webSocketService } from "../../service/webSocketService";

const MessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<ConversationResponse[]>(
    [],
  );
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [sending, setSending] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConvForMenu, setSelectedConvForMenu] = useState<number | null>(
    null,
  );
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  // Connect WebSocket and handle notifications
  useEffect(() => {
    if (user?.userId) {
      if (!webSocketService.isConnected()) {
        webSocketService.connect(user.userId.toString());
      }

      const handleNotification = (notif: any) => {
        if (notif.type === "INFO") {
          loadConversations();
        }
      };

      webSocketService.addNotificationListener(handleNotification);
      return () => {
        webSocketService.removeNotificationListener(handleNotification);
      };
    }
  }, [user?.userId]);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation, true);

      // Subscribe to live messages
      webSocketService.subscribeToConversation(
        selectedConversation,
        (message: MessageResponse) => {
          console.log("📨 WebSocket message received:", {
            id: message.messageId,
            createdAt: message.createdAt,
            content: message.content?.substring(0, 30),
          });

          setMessages((prev) => {
            // Check for duplicate
            if (prev.some((m) => m.messageId === message.messageId)) {
              console.log("⚠️ Duplicate message, skipping");
              return prev;
            }
            // Add new message and sort
            const updated = [...prev, message];
            const sorted = updated.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
            console.log(
              "✅ Message added & sorted. Total:",
              sorted.length,
              "Last message:",
              sorted[sorted.length - 1]?.createdAt,
            );
            return sorted;
          });

          // Scroll to bottom when receiving new message
          setShouldScrollToBottom(true);

          if (message.senderId !== user?.userId) {
            conversationService
              .markAsRead(selectedConversation)
              .catch(() => {});
          }
        },
      );
    }

    return () => {
      if (selectedConversation) {
        webSocketService.unsubscribeFromConversation(selectedConversation);
      }
    };
  }, [selectedConversation, user?.userId]);

  // Only scroll to bottom when flag is set (new message or initial load)
  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await conversationService.getMyConversations(0, 20, {
        archived: showArchived,
        keyword: searchQuery || undefined,
      });
      setConversations(response.data || []);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      enqueueSnackbar(error.message || "Lỗi khi tải danh sách tin nhắn", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (
    conversationId: number,
    reset: boolean = true,
  ) => {
    if (reset) {
      setLoadingMessages(true);
      setCurrentPage(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const pageToLoad = reset ? 0 : currentPage + 1;
      const response = await messageService.getMessages(
        conversationId,
        pageToLoad,
        50,
      );

      const incomingMessages = response.data || [];

      console.log("🔍 DEBUG - Incoming messages from API:", {
        count: incomingMessages.length,
        first: incomingMessages[0]?.createdAt,
        last: incomingMessages[incomingMessages.length - 1]?.createdAt,
        sample: incomingMessages.slice(0, 3).map((m) => ({
          id: m.messageId,
          createdAt: m.createdAt,
          content: m.content?.substring(0, 20),
        })),
      });

      // Force sort ASC (oldest first) regardless of backend order to ensure consistency
      const sortedMessages = [...incomingMessages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      console.log("📊 After sort ASC:", {
        count: sortedMessages.length,
        first: sortedMessages[0]?.createdAt,
        last: sortedMessages[sortedMessages.length - 1]?.createdAt,
      });

      setMessages((prev) => {
        if (reset) {
          // Initial load
          console.log("✅ RESET: Setting messages to sorted array");
          return sortedMessages;
        } else {
          // Load more (older messages) - prepend to beginning
          // Deduplicate: remove any messages already in prev
          const existingIds = new Set(prev.map((m) => m.messageId));
          const newMessages = sortedMessages.filter(
            (m) => !existingIds.has(m.messageId),
          );
          console.log(
            "➕ PAGINATION: Prepending",
            newMessages.length,
            "older messages",
          );
          // Since both are sorted ASC, and newMessages are chronologically before prev
          // merging them like this preserves order: [Older..., Newer...]
          return [...newMessages, ...prev];
        }
      });

      setHasMore((response.data?.length || 0) === 50);
      if (!reset) {
        setCurrentPage(pageToLoad);
      }

      // Mark as read and scroll to bottom only on initial load
      if (reset) {
        await conversationService.markAsRead(conversationId);
        setShouldScrollToBottom(true);
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
      enqueueSnackbar(error.message || "Lỗi khi tải tin nhắn", {
        variant: "error",
      });
    } finally {
      setLoadingMessages(false);
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await messageService.sendMessage({
        conversationId: selectedConversation,
        content: messageInput.trim(),
      });
      setMessageInput("");

      // WebSocket will handle adding the message to the list
      // Wait a bit for backend to update conversation before refreshing list
      setTimeout(() => {
        loadConversations();
      }, 300);

      // Scroll to bottom when sending message
      setShouldScrollToBottom(true);
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi khi gửi tin nhắn", {
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const handleArchiveConversation = async (
    conversationId: number,
    archive: boolean,
  ) => {
    try {
      await conversationService.archiveConversation(conversationId, archive);
      enqueueSnackbar(
        archive ? "Đã lưu trữ cuộc trò chuyện" : "Đã bỏ lưu trữ",
        { variant: "success" },
      );
      await loadConversations();
      handleMenuClose();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Có lỗi xảy ra", { variant: "error" });
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    convId: number,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedConvForMenu(convId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConvForMenu(null);
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.instructorName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedConvData = conversations.find(
    (c) => c.conversationId === selectedConversation,
  );

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        height: "calc(100vh - 100px)",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, height: "100%" }}>
        {/* Conversation List */}
        <Paper
          elevation={3}
          sx={{
            width: 380,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2.5,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <Typography variant="h5" fontWeight={700} gutterBottom>
              💬 Tin nhắn
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "white" }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "&::placeholder": { color: "rgba(255,255,255,0.7)" },
                },
              }}
            />
          </Box>

          {/* Tabs */}
          <Box
            sx={{ display: "flex", borderBottom: 1, borderColor: "divider" }}
          >
            <Box
              onClick={() => setShowArchived(false)}
              sx={{
                flex: 1,
                py: 1.5,
                textAlign: "center",
                cursor: "pointer",
                fontWeight: 600,
                borderBottom: !showArchived ? 3 : 0,
                borderColor: "primary.main",
                color: !showArchived ? "primary.main" : "text.secondary",
                transition: "all 0.3s",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              Hoạt động ({conversations.filter((c) => !c.isArchived).length})
            </Box>
            <Box
              onClick={() => setShowArchived(true)}
              sx={{
                flex: 1,
                py: 1.5,
                textAlign: "center",
                cursor: "pointer",
                fontWeight: 600,
                borderBottom: showArchived ? 3 : 0,
                borderColor: "primary.main",
                color: showArchived ? "primary.main" : "text.secondary",
                transition: "all 0.3s",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              Lưu trữ ({conversations.filter((c) => c.isArchived).length})
            </Box>
          </Box>

          {/* Conversation List */}
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredConversations.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                <Typography>Không có cuộc trò chuyện nào</Typography>
              </Box>
            ) : (
              filteredConversations.map((conv) => (
                <Box
                  key={conv.conversationId}
                  onClick={() => setSelectedConversation(conv.conversationId)}
                  sx={{
                    p: 2,
                    display: "flex",
                    gap: 2,
                    cursor: "pointer",
                    bgcolor:
                      selectedConversation === conv.conversationId
                        ? "action.selected"
                        : "transparent",
                    borderLeft:
                      selectedConversation === conv.conversationId ? 4 : 0,
                    borderColor: "primary.main",
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Badge
                    badgeContent={conv.studentUnreadCount}
                    color="error"
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  >
                    <Avatar
                      src={conv.instructorAvatar}
                      alt={conv.instructorName}
                      sx={{ width: 56, height: 56 }}
                    >
                      {conv.instructorName.charAt(0)}
                    </Avatar>
                  </Badge>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {conv.instructorName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {conv.lastMessageAt
                          ? formatDistanceToNow(new Date(conv.lastMessageAt), {
                              addSuffix: true,
                              locale: vi,
                            })
                          : ""}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{
                        display: "block",
                        mb: 0.5,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      📚 {conv.courseName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: conv.studentUnreadCount > 0 ? 600 : 400,
                      }}
                    >
                      {conv.lastMessageContent || conv.lastMessageIsImage ? (
                        <>
                          {conv.lastMessageSenderType === "INSTRUCTOR" && (
                            <Typography
                              component="span"
                              sx={{ fontWeight: 600, color: "primary.main" }}
                            >
                              {conv.instructorName}:{" "}
                            </Typography>
                          )}
                          {conv.lastMessageSenderType === "STUDENT" && (
                            <Typography
                              component="span"
                              sx={{ fontWeight: 600 }}
                            >
                              Bạn:{" "}
                            </Typography>
                          )}
                          {conv.lastMessageIsImage &&
                          (!conv.lastMessageContent ||
                            conv.lastMessageContent.trim() === "")
                            ? "[Hình ảnh]"
                            : conv.lastMessageContent}
                        </>
                      ) : (
                        "Chưa có tin nhắn"
                      )}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, conv.conversationId);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))
            )}
          </Box>
        </Paper>

        {/* Chat Window */}
        {selectedConversation ? (
          <Paper
            elevation={3}
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderBottom: 1,
                borderColor: "divider",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <Avatar
                src={selectedConvData?.instructorAvatar}
                alt={selectedConvData?.instructorName}
                sx={{ width: 48, height: 48 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                  {selectedConvData?.instructorName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  📚 {selectedConvData?.courseName}
                </Typography>
              </Box>
              <Tooltip title="Tùy chọn">
                <IconButton sx={{ color: "white" }}>
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Messages Area */}
            <Box
              onScroll={(e) => {
                const target = e.currentTarget;
                if (
                  target.scrollTop === 0 &&
                  hasMore &&
                  !loadingMore &&
                  !loadingMessages &&
                  selectedConversation
                ) {
                  loadMessages(selectedConversation, false);
                }
              }}
              sx={{
                flexGrow: 1,
                p: 3,
                overflow: "auto",
                bgcolor: "#f5f7fa",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            >
              {loadingMessages ? (
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
              ) : messages.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Chưa có tin nhắn nào
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
                  </Typography>
                </Box>
              ) : (
                <>
                  {loadingMore && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                    >
                      <CircularProgress size={24} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        Đang tải thêm tin nhắn...
                      </Typography>
                    </Box>
                  )}
                  {(() => {
                    // Deduplicate messages before rendering
                    const uniqueMessages = Array.from(
                      new Map(
                        messages.map((msg) => [msg.messageId, msg]),
                      ).values(),
                    );

                    return uniqueMessages.map((msg, index) => {
                      const isOwn = msg.senderId === user?.userId;
                      const showAvatar =
                        index === 0 ||
                        uniqueMessages[index - 1].senderType !== msg.senderType;

                      return (
                        <Box
                          key={msg.messageId}
                          sx={{
                            display: "flex",
                            justifyContent: isOwn ? "flex-end" : "flex-start",
                            mb: 2,
                            gap: 1,
                          }}
                        >
                          {!isOwn && (
                            <Avatar
                              src={msg.senderAvatar}
                              sx={{
                                width: 32,
                                height: 32,
                                visibility: showAvatar ? "visible" : "hidden",
                              }}
                            >
                              {msg.senderName.charAt(0)}
                            </Avatar>
                          )}
                          <Box
                            sx={{
                              maxWidth: "70%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isOwn ? "flex-end" : "flex-start",
                            }}
                          >
                            {showAvatar && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ mb: 0.5, px: 1 }}
                              >
                                {msg.senderName}
                              </Typography>
                            )}
                            <Paper
                              elevation={1}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: isOwn ? "primary.main" : "white",
                                color: isOwn ? "white" : "text.primary",
                                borderTopLeftRadius:
                                  !isOwn && showAvatar ? 0 : 16,
                                borderTopRightRadius:
                                  isOwn && showAvatar ? 0 : 16,
                              }}
                            >
                              {msg.imageUrl && (
                                <Box
                                  component="img"
                                  src={msg.imageUrl}
                                  onClick={() =>
                                    window.open(msg.imageUrl, "_blank")
                                  }
                                  sx={{
                                    width: "100%",
                                    maxWidth: 300,
                                    borderRadius: 1,
                                    mb: msg.content ? 1 : 0,
                                    cursor: "pointer",
                                    display: "block",
                                  }}
                                />
                              )}
                              {msg.content && (
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "pre-wrap" }}
                                >
                                  {msg.content}
                                </Typography>
                              )}
                            </Paper>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 0.5, px: 1 }}
                            >
                              {formatDate(msg.createdAt)}
                              {msg.isRead && isOwn && " • Đã đọc"}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    });
                  })()}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "white",
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                <Tooltip title="Đính kèm file">
                  <IconButton size="small" color="primary">
                    <AttachFileIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Emoji">
                  <IconButton size="small" color="primary">
                    <EmojiIcon />
                  </IconButton>
                </Tooltip>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Nhập tin nhắn..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                    "&:disabled": { bgcolor: "action.disabledBackground" },
                  }}
                >
                  {sending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <SendIcon />
                  )}
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={3}
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              bgcolor: "#f5f7fa",
            }}
          >
            <Box sx={{ textAlign: "center", color: "text.secondary" }}>
              <Typography variant="h5" gutterBottom>
                💬
              </Typography>
              <Typography variant="h6">
                Chọn một cuộc trò chuyện để bắt đầu
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedConvForMenu) {
              handleArchiveConversation(selectedConvForMenu, !showArchived);
            }
          }}
        >
          {showArchived ? (
            <>
              <UnarchiveIcon fontSize="small" sx={{ mr: 1 }} />
              Bỏ lưu trữ
            </>
          ) : (
            <>
              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
              Lưu trữ
            </>
          )}
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default MessagesPage;
