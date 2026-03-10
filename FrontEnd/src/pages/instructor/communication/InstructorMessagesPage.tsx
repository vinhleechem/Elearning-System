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
  Divider,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SendIcon from "@mui/icons-material/Send";
import {
  Image as ImageIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon
} from "@mui/icons-material";
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

  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
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

  useEffect(() => {
    if (user?.userId) {
      if (!webSocketService.isConnected()) {
        webSocketService.connect(user.userId.toString());
      }
      const handleNotification = (notif: any) => {
        if (notif.type === "INFO") {
          if (notif.userId && notif.userId !== user.userId) return;
          refreshConversations();
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
            if (prev.some((m) => m.messageId === message.messageId)) return prev;
            return [...prev, message].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          });
          setShouldScrollToBottom(true);
          if (message.senderId !== user?.userId) {
            conversationService.markAsRead(selectedConversation).then(() => {
              window.dispatchEvent(new Event("conversation:markAsRead"));
            }).catch(() => { });
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
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const loadInstructorCourses = async () => {
    try {
      const token = tokens?.accessToken;
      if (!token) return;
      const response = await courseService.getMyCourses({ page: 0, size: 100, token });
      setCourses(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConversationClick = async (conversationId: number) => {
    setSelectedConversation(conversationId);
    const conversation = conversations.find(c => c.conversationId === conversationId);
    if (conversation && conversation.instructorUnreadCount > 0) {
      try {
        await conversationService.markAsRead(conversationId);
        window.dispatchEvent(new Event("conversation:markAsRead"));
        refreshConversations();
      } catch (error) {
        console.error(error);
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
      if (showUnread) filtered = filtered.filter((c) => c.instructorUnreadCount > 0);
      filtered.sort((a, b) => {
        const dateA = new Date(a.lastMessageAt || a.createdAt).getTime();
        const dateB = new Date(b.lastMessageAt || b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
      setConversations(filtered);
    } catch (error: any) {
      enqueueSnackbar("Lỗi khi tải cuộc trò chuyện", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const refreshConversations = async () => {
    try {
      const response = await conversationService.getMyConversations(0, 50, {
        keyword: searchTerm || undefined,
        courseId: selectedCourseId || undefined,
      });
      let filtered = response.data || [];
      if (showUnread) filtered = filtered.filter((c) => (c.instructorUnreadCount || 0) > 0);
      filtered.sort((a, b) => {
        const dateA = new Date(a.lastMessageAt || a.createdAt).getTime();
        const dateB = new Date(b.lastMessageAt || b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
      setConversations(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMessages = async (conversationId: number, reset: boolean = true) => {
    if (reset) {
      setLoadingMessages(true);
      setCurrentPage(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const pageToLoad = reset ? 0 : currentPage + 1;
      const response = await messageService.getMessages(conversationId, pageToLoad, 50);
      const incomingMessages = response.data || [];
      const sortedMessages = [...incomingMessages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages((prev) => reset ? sortedMessages : [...sortedMessages, ...prev]);
      setHasMore((response.data?.length || 0) === 50);
      if (!reset) setCurrentPage(pageToLoad);
      if (reset) {
        setShouldScrollToBottom(true);
      }
    } catch (error: any) {
      enqueueSnackbar("Lỗi khi tải tin nhắn", { variant: "error" });
    } finally {
      setLoadingMessages(false);
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !selectedConversation) return;
    setSending(true);
    try {
      let imageUrl = undefined;
      if (selectedImage) imageUrl = await fileUploadService.uploadFile(selectedImage);
      await messageService.sendMessage({
        conversationId: selectedConversation,
        content: messageInput.trim(),
        imageUrl,
      });
      setMessageInput("");
      clearImage();
      refreshConversations();
    } catch (error: any) {
      enqueueSnackbar("Lỗi khi gửi tin nhắn", { variant: "error" });
    } finally {
      setSending(false);
    }
  };

  const selectedConvData = conversations.find((c) => c.conversationId === selectedConversation);

  return (
    <Box sx={{ height: "calc(100vh - 0px)", display: "flex", p: 2.5, gap: 2.5, bgcolor: "#f8fafc" }}>
      {/* ─── CONVERSATION LIST ─── */}
      <Paper
        elevation={0}
        sx={{
          width: 380,
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <Box sx={{ p: 3, bgcolor: "#0f172a", color: "white" }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
            <Box
              sx={{
                p: 1,
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: "10px",
                display: "flex",
              }}
            >
              <MailOutlineIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.01em" }}>
              Tin nhắn
            </Typography>
          </Stack>

          <TextField
            fullWidth
            size="small"
            placeholder="Tìm theo tên học viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(255,255,255,0.6)", fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "rgba(255,255,255,0.08)",
                color: "white",
                borderRadius: "12px",
                "& fieldset": { border: "none" },
                "& input::placeholder": { color: "rgba(255,255,255,0.5)", opacity: 1 },
              },
            }}
          />
        </Box>

        <Box sx={{ p: 2, borderBottom: "1px solid #f1f5f9", bgcolor: "#fff" }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" fontWeight={700} color="#64748b" sx={{ mb: 1, display: "block" }}>
                LỌC THEO KHÓA HỌC
              </Typography>
              <Select
                value={selectedCourseId || "all"}
                onChange={(e) => setSelectedCourseId(e.target.value === "all" ? null : Number(e.target.value))}
                fullWidth
                size="small"
                sx={{
                  borderRadius: "10px",
                  bgcolor: "#f8fafc",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                }}
              >
                <MenuItem value="all">📚 Tất cả khóa học</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.courseId} value={course.courseId}>{course.title}</MenuItem>
                ))}
              </Select>
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <FormControlLabel
                control={<Checkbox size="small" checked={showUnread} onChange={(e) => setShowUnread(e.target.checked)} />}
                label={<Typography variant="body2" fontWeight={600} color="#475569">Chưa đọc</Typography>}
              />
              <Stack direction="row" alignItems="center" spacing={1}>
                <SortIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  size="small"
                  variant="standard"
                  disableUnderline
                  sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#2563eb" }}
                >
                  <MenuItem value="newest">Mới nhất</MenuItem>
                  <MenuItem value="oldest">Cũ nhất</MenuItem>
                </Select>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={24} /></Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="body2" color="#94a3b8">Không tìm thấy hội thoại</Typography>
            </Box>
          ) : (
            conversations.map((conv) => {
              const isActive = selectedConversation === conv.conversationId;
              return (
                <Box
                  key={conv.conversationId}
                  onClick={() => handleConversationClick(conv.conversationId)}
                  sx={{
                    p: 2,
                    display: "flex",
                    gap: 2,
                    cursor: "pointer",
                    bgcolor: isActive ? "#eff6ff" : "transparent",
                    borderLeft: "4px solid",
                    borderLeftColor: isActive ? "#2563eb" : "transparent",
                    borderBottom: "1px solid #f1f5f9",
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: isActive ? "#eff6ff" : "#f8fafc" },
                  }}
                >
                  <Badge
                    badgeContent={conv.instructorUnreadCount}
                    color="error"
                    sx={{ "& .MuiBadge-badge": { fontWeight: 800, scale: "0.9" } }}
                  >
                    <Avatar
                      src={conv.studentAvatar}
                      sx={{ width: 48, height: 48, borderRadius: "14px", border: "2px solid #fff", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    >
                      {conv.studentName.charAt(0)}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ color: "#1e293b", maxWidth: "120px" }}>
                        {conv.studentName}
                      </Typography>
                      <Typography variant="caption" color="#94a3b8">
                        {conv.lastMessageAt && formatChatTime(conv.lastMessageAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" fontWeight={700} color="#2563eb" display="block" noWrap sx={{ mb: 0.5 }}>
                      {conv.courseName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={conv.instructorUnreadCount > 0 ? "#0f172a" : "#64748b"}
                      fontWeight={conv.instructorUnreadCount > 0 ? 700 : 500}
                      noWrap
                    >
                      {conv.lastMessageContent || (conv.lastMessageIsImage ? "[Hình ảnh]" : "Chưa có tin nhắn")}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Paper>

      {/* ─── CHAT WINDOW ─── */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        {selectedConversation && selectedConvData ? (
          <>
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid #f1f5f9" }}>
              <Avatar src={selectedConvData.studentAvatar} sx={{ width: 44, height: 44, borderRadius: "12px" }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={800} color="#1e293b">{selectedConvData.studentName}</Typography>
                <Typography variant="caption" fontWeight={600} color="#2563eb">{selectedConvData.courseName}</Typography>
              </Box>
            </Box>

            <Box ref={messagesContainerRef} sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "#fafafa" }}>
              {loadingMessages ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress size={24} /></Box>
              ) : (
                <Stack spacing={2.5}>
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.userId;
                    return (
                      <Box key={msg.messageId} sx={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                        <Box sx={{ maxWidth: "70%" }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.8,
                              borderRadius: isMe ? "18px 18px 0 18px" : "18px 18px 18px 0",
                              bgcolor: isMe ? "#2563eb" : "#fff",
                              color: isMe ? "white" : "#1e293b",
                              border: isMe ? "none" : "1px solid #e2e8f0",
                              boxShadow: isMe ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "0 2px 4px rgba(0,0,0,0.02)",
                            }}
                          >
                            {msg.imageUrl && (
                              <Box
                                component="img"
                                src={msg.imageUrl}
                                sx={{ width: "100%", borderRadius: "12px", mb: 1, cursor: "pointer" }}
                                onClick={() => window.open(msg.imageUrl, "_blank")}
                              />
                            )}
                            <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                              {msg.content}
                            </Typography>
                          </Paper>
                          <Typography variant="caption" sx={{ mt: 0.5, display: "block", textAlign: isMe ? "right" : "left", color: "#94a3b8", fontSize: "0.7rem" }}>
                            {formatChatTime(msg.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>

            <Box sx={{ p: 2.5, borderTop: "1px solid #f1f5f9" }}>
              {previewImage && (
                <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                  <Box component="img" src={previewImage} sx={{ height: 80, borderRadius: "12px", border: "2px solid #2563eb" }} />
                  <IconButton
                    size="small"
                    onClick={clearImage}
                    sx={{ position: "absolute", top: -8, right: -8, bgcolor: "#ef4444", color: "white", "&:hover": { bgcolor: "#dc2626" } }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              )}
              <Stack direction="row" spacing={1.5} alignItems="flex-end">
                <Box sx={{ flex: 1, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", p: 1, display: "flex", alignItems: "flex-end" }}>
                  <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon sx={{ color: "#94a3b8" }} />
                  </IconButton>
                  <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*" />
                  <InputBase
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Viết tin nhắn..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    sx={{ ml: 1, mr: 1, fontSize: "0.95rem" }}
                  />
                </Box>
                <IconButton
                  disabled={sending || (!messageInput.trim() && !selectedImage)}
                  onClick={handleSendMessage}
                  sx={{
                    bgcolor: "#2563eb",
                    color: "white",
                    p: 1.5,
                    "&:hover": { bgcolor: "#1d4ed8" },
                    "&.Mui-disabled": { bgcolor: "#f1f5f9", color: "#cbd5e1" }
                  }}
                >
                  {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                </IconButton>
              </Stack>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4 }}>
            <Box sx={{ p: 3, bgcolor: "#eff6ff", borderRadius: "30px", mb: 3 }}>
              <MailOutlineIcon sx={{ fontSize: 48, color: "#3b82f6" }} />
            </Box>
            <Typography variant="h6" fontWeight={800} color="#1e293b">Vui lòng chọn một hội thoại</Typography>
            <Typography variant="body2" color="#64748b" sx={{ mt: 1 }}>Bắt đầu kết nối với học viên của bạn ngay hôm nay.</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default InstructorMessagesPage;
