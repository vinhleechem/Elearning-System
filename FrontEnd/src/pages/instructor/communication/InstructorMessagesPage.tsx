import {
  Box,
  TextField,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  Badge,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Stack,
  InputBase,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SendIcon from "@mui/icons-material/Send";
import { Image as ImageIcon, Close as CloseIcon } from "@mui/icons-material";
import { fileUploadService } from "../../../service/fileUploadService";
import {
  conversationService,
  messageService,
} from "../../../service/conversationService";
import type {
  ConversationResponse,
  MessageResponse,
} from "../../../service/conversationService";
import { useToast } from "../../../hooks/useToast";
import { useAuthStore } from "../../../store/authStore";
import { formatChatTime } from "../../../libs/dateUtils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { courseService } from "../../../service/courseService";
import type { PublicCourseResponse } from "../../../service/courseService";
import { webSocketService } from "../../../service/webSocketService";

const InstructorMessagesPage = () => {
  const { user, tokens } = useAuthStore();
  const { enqueueSnackbar } = useToast();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnread, setShowUnread] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [conversations, setConversations] = useState<ConversationResponse[]>(
    [],
  );
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [courses, setCourses] = useState<PublicCourseResponse[]>([]);

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup preview URL on unmount
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  useEffect(() => {
    loadInstructorCourses();
  }, []);

  useEffect(() => {
    loadConversations();
  }, [sortOrder, searchTerm, showUnread, selectedCourseId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        enqueueSnackbar("Chỉ hỗ trợ định dạng ảnh", { variant: "error" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar("Dung lượng ảnh phải nhỏ hơn 5MB", {
          variant: "error",
        });
        return;
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setSelectedImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith("image/")) {
        e.preventDefault();
        if (file.size > 5 * 1024 * 1024) {
          enqueueSnackbar("Dung lượng ảnh phải nhỏ hơn 5MB", {
            variant: "error",
          });
          return;
        }
        setSelectedImage(file);
        setPreviewImage(URL.createObjectURL(file));
      }
    }
  };

  useEffect(() => {
    if (user?.userId) {
      if (!webSocketService.isConnected()) {
        webSocketService.connect(user.userId.toString());
      }

      const handleNotification = (notif: any) => {
        if (notif.type === "INFO") {
          // Filter: only process if notification is for current user
          if (notif.userId && notif.userId !== user.userId) {
            return; // Ignore notifications for other users
          }
          refreshConversations(); // Use silent refresh instead of loadConversations
        }
      };

      webSocketService.addNotificationListener(handleNotification);
      return () => {
        webSocketService.removeNotificationListener(handleNotification);
      };
    }
  }, [user?.userId]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);

      webSocketService.subscribeToConversation(
        selectedConversation,
        (message: MessageResponse) => {
          setMessages((prev) => {
            // Check for duplicate
            if (prev.some((m) => m.messageId === message.messageId))
              return prev;
            // Add new message and sort
            const updated = [...prev, message];
            return updated.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
          });

          // Scroll to bottom when receiving new message
          setShouldScrollToBottom(true);

          if (message.senderId !== user?.userId) {
            conversationService
              .markAsRead(selectedConversation)
              .then(() => {
                // Dispatch custom event to notify sidebar to update badge
                window.dispatchEvent(new Event("conversation:markAsRead"));
              })
              .catch(() => {});
            // Refresh conversation list when receiving message from student (silent)
            refreshConversations();
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
    if (messagesContainerRef.current) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const loadInstructorCourses = async () => {
    try {
      const token = tokens?.accessToken;
      if (!token) return;

      const response = await courseService.getMyCourses({
        page: 0,
        size: 100,
        token,
      });

      setCourses(response.data || []);
    } catch (error: any) {
      console.error("Error loading courses:", error);
    }
  };

  const handleConversationClick = async (conversationId: number) => {
    setSelectedConversation(conversationId);

    // Mark as read and notify sidebar immediately
    const conversation = conversations.find(
      (c) => c.conversationId === conversationId,
    );
    if (conversation && conversation.instructorUnreadCount > 0) {
      try {
        await conversationService.markAsRead(conversationId);
        // Dispatch event to update sidebar badge instantly
        window.dispatchEvent(new Event("conversation:markAsRead"));
        // Refresh conversation list to update UI
        refreshConversations();
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await conversationService.getMyConversations(0, 50, {
        keyword: searchTerm || undefined,
        courseId: selectedCourseId || undefined,
      });

      let filtered = response.data || [];

      if (showUnread) {
        filtered = filtered.filter((c) => c.instructorUnreadCount > 0);
      }

      filtered.sort((a, b) => {
        const dateA = new Date(a.lastMessageAt || a.createdAt).getTime();
        const dateB = new Date(b.lastMessageAt || b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });

      setConversations(filtered);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      enqueueSnackbar(error.message || "Lỗi khi tải conversations", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Silent refresh without showing loading spinner
  const refreshConversations = async () => {
    try {
      const response = await conversationService.getMyConversations(0, 50, {
        keyword: searchTerm || undefined,
        courseId: selectedCourseId || undefined,
      });

      let filtered = response.data || [];

      if (showUnread) {
        filtered = filtered.filter((c) => c.instructorUnreadCount > 0);
      }

      filtered.sort((a, b) => {
        const dateA = new Date(a.lastMessageAt || a.createdAt).getTime();
        const dateB = new Date(b.lastMessageAt || b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });

      setConversations(filtered);
    } catch (error: any) {
      console.error("Error refreshing conversations:", error);
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

      // Backend returns DESC, sort to ASC for display
      const sortedMessages = [...incomingMessages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      setMessages((prev) => {
        if (reset) {
          return sortedMessages;
        } else {
          // Pagination: prepend older messages
          const existingIds = new Set(prev.map((m) => m.messageId));
          const newMessages = sortedMessages.filter(
            (m) => !existingIds.has(m.messageId),
          );
          return [...newMessages, ...prev];
        }
      });

      setHasMore((response.data?.length || 0) === 50);
      if (!reset) {
        setCurrentPage(pageToLoad);
      }

      if (reset) {
        await conversationService.markAsRead(conversationId);
        await loadConversations();
        // Scroll to bottom only on initial load
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
    if ((!messageInput.trim() && !selectedImage) || !selectedConversation)
      return;

    setSending(true);
    try {
      let imageUrl = undefined;

      // Upload image if selected
      if (selectedImage) {
        try {
          imageUrl = await fileUploadService.uploadFile(selectedImage);
        } catch (uploadError) {
          console.error("Upload failed", uploadError);
          enqueueSnackbar("Không thể tải ảnh lên", { variant: "error" });
          setSending(false);
          return;
        }
      }

      await messageService.sendMessage({
        conversationId: selectedConversation,
        content: messageInput.trim(),
        imageUrl,
      });

      // WebSocket will handle adding the message to the list
      setMessageInput("");
      clearImage();

      // Update last message in conversation list
      loadConversations();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi khi gửi tin nhắn", {
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const selectedConvData = conversations.find(
    (c) => c.conversationId === selectedConversation,
  );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        gap: 2,
        p: 2.5,
        bgcolor: "#f8f9fb",
      }}
    >
      {/* Conversation List */}
      <Paper
        elevation={0}
        sx={{
          width: 360,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "white",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: "#2563eb",
            color: "white",
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            💬 Tin nhắn
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& input::placeholder": {
                  color: "rgba(255,255,255,0.7)",
                  opacity: 1,
                },
                "& input": {
                  color: "white",
                },
              },
            }}
          />
        </Box>

        {/* Filters */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: "#f8fafc",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack spacing={2}>
            {/* Row 1: Course Filter */}
            <Box>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mb: 1,
                  display: "block",
                }}
              >
                Khóa học
              </Typography>
              <Select
                value={selectedCourseId || "all"}
                onChange={(e) =>
                  setSelectedCourseId(
                    e.target.value === "all" ? null : Number(e.target.value),
                  )
                }
                fullWidth
                size="small"
                sx={{
                  bgcolor: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "divider",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <MenuItem value="all">
                  <Typography variant="body2">📚 Tất cả khóa học</Typography>
                </MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.courseId} value={course.courseId}>
                    <Typography variant="body2" noWrap>
                      {course.title}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* Row 2: Filters and Sort */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={showUnread}
                    onChange={(e) => setShowUnread(e.target.checked)}
                    sx={{
                      color: "primary.main",
                      "&.Mui-checked": {
                        color: "primary.main",
                      },
                      p: 0.5, // Reduce padding inside checkbox
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Chưa đọc
                  </Typography>
                }
                sx={{ mr: 0, ml: -0.5 }} // Adjust margin to alignment
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Sắp xếp:
                </Typography>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{
                    minWidth: 120, // Reduced from 140
                    bgcolor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "divider",
                    },
                    fontSize: "0.875rem",
                  }}
                >
                  <MenuItem value="newest">
                    <Typography variant="body2">Mới nhất</Typography>
                  </MenuItem>
                  <MenuItem value="oldest">
                    <Typography variant="body2">Cũ nhất</Typography>
                  </MenuItem>
                </Select>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* Conversation List */}
        <Box sx={{ flexGrow: 1, overflow: "auto", bgcolor: "white" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
              <Typography variant="body2">
                Không có cuộc trò chuyện nào
              </Typography>
            </Box>
          ) : (
            conversations.map((conv) => (
              <Box
                key={conv.conversationId}
                onClick={() => handleConversationClick(conv.conversationId)}
                sx={{
                  p: 2,
                  display: "flex",
                  gap: 1.5,
                  cursor: "pointer",
                  bgcolor:
                    selectedConversation === conv.conversationId
                      ? "#f0f9ff"
                      : "transparent",
                  borderLeft: 3,
                  borderLeftColor:
                    selectedConversation === conv.conversationId
                      ? "#2563eb"
                      : "transparent",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor:
                      selectedConversation === conv.conversationId
                        ? "#f0f9ff"
                        : "#f8fafc",
                  },
                  borderBottom: "1px solid",
                  borderBottomColor: "divider",
                }}
              >
                <Badge
                  badgeContent={conv.instructorUnreadCount}
                  color="error"
                  overlap="circular"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.7rem",
                      height: 18,
                      minWidth: 18,
                      fontWeight: 600,
                    },
                  }}
                >
                  <Avatar
                    src={conv.studentAvatar}
                    alt={conv.studentName}
                    sx={{ width: 44, height: 44 }}
                  >
                    {conv.studentName.charAt(0)}
                  </Avatar>
                </Badge>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={conv.instructorUnreadCount > 0 ? 700 : 600}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      mb: 0.5,
                    }}
                  >
                    {conv.studentName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                      color: "#2563eb",
                      mb: 0.5,
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
                      fontWeight: conv.instructorUnreadCount > 0 ? 500 : 400,
                      fontSize: "0.875rem",
                    }}
                  >
                    {conv.lastMessageContent || conv.lastMessageIsImage ? (
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          {conv.lastMessageSenderType === "INSTRUCTOR"
                            ? "Bạn: "
                            : `${conv.studentName}: `}
                        </Typography>
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
                {conv.lastMessageAt && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.7rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDistanceToNow(new Date(conv.lastMessageAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Box>
      </Paper>

      {/* Chat Window */}
      {selectedConversation && selectedConvData ? (
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "white",
            overflow: "hidden",
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "white",
            }}
          >
            <Avatar
              src={selectedConvData.studentAvatar}
              alt={selectedConvData.studentName}
              sx={{ width: 48, height: 48 }}
            >
              {selectedConvData.studentName.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {selectedConvData.studentName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📚 {selectedConvData.courseName}
              </Typography>
            </Box>
          </Box>

          {/* Messages Area */}
          <Box
            ref={messagesContainerRef}
            onScroll={(e) => {
              const target = e.currentTarget;
              // Load more when scrolling to top
              if (
                target.scrollTop === 0 &&
                hasMore &&
                !loadingMore &&
                !loadingMessages &&
                selectedConversation
              ) {
                const scrollHeightBefore = target.scrollHeight;
                loadMessages(selectedConversation, false).then(() => {
                  // Preserve scroll position after prepending messages
                  setTimeout(() => {
                    if (messagesContainerRef.current) {
                      const scrollHeightAfter =
                        messagesContainerRef.current.scrollHeight;
                      messagesContainerRef.current.scrollTop =
                        scrollHeightAfter - scrollHeightBefore;
                    }
                  }, 100);
                });
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
                    sx={{ display: "flex", justifyContent: "center", py: 2 }}
                  >
                    <CircularProgress size={24} />
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
                              p: msg.imageUrl ? 0 : 1.5,
                              overflow: "hidden",
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
                                sx={{
                                  width: "100%",
                                  maxWidth: 300,
                                  maxHeight: 300,
                                  objectFit: "cover",
                                  cursor: "pointer",
                                  display: "block",
                                }}
                                onClick={() =>
                                  window.open(msg.imageUrl, "_blank")
                                }
                              />
                            )}
                            {msg.content && (
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "pre-wrap",
                                  p: msg.imageUrl ? 1.5 : 0,
                                }}
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
                            {formatChatTime(msg.createdAt)}
                            {msg.isRead && isOwn && " • Đã đọc"}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  });
                })()}
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
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
              />
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  mb: 1,
                  color: selectedImage ? "primary.main" : "text.secondary",
                }}
              >
                <ImageIcon />
              </IconButton>

              <Box
                sx={{
                  flex: 1,
                  bgcolor: "#f0f2f5",
                  borderRadius: "20px",
                  p: previewImage ? 1.5 : "8px 16px",
                  minHeight: "40px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  transition: "height 0.2s",
                }}
              >
                {previewImage && (
                  <Box
                    sx={{ position: "relative", width: "fit-content", mb: 1 }}
                  >
                    <Box
                      component="img"
                      src={previewImage}
                      sx={{ height: 60, borderRadius: 2, display: "block" }}
                    />
                    <IconButton
                      size="small"
                      onClick={clearImage}
                      sx={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        bgcolor: "white",
                        boxShadow: 1,
                        "&:hover": { bgcolor: "#f5f5f5" },
                        p: 0.2,
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                )}

                <InputBase
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder={
                    selectedImage ? "Thêm chú thích..." : "Nhập tin nhắn..."
                  }
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  onPaste={handlePaste}
                  disabled={sending}
                  sx={{
                    fontSize: "0.95rem",
                    color: "text.primary",
                  }}
                />
              </Box>

              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={(!messageInput.trim() && !selectedImage) || sending}
                sx={{
                  mb: 0.5,
                  bgcolor:
                    !messageInput.trim() && !selectedImage
                      ? "action.disabledBackground"
                      : "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": { bgcolor: "action.disabledBackground" },
                  width: 48,
                  height: 48,
                }}
              >
                {sending ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "#fafafa",
          }}
        >
          <Box sx={{ textAlign: "center", color: "text.secondary", p: 4 }}>
            <MailOutlineIcon
              sx={{ fontSize: 64, mb: 2, opacity: 0.2, color: "#2563eb" }}
            />
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              color="text.primary"
            >
              Chọn một cuộc trò chuyện
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chọn tin nhắn từ danh sách bên trái để bắt đầu
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default InstructorMessagesPage;
