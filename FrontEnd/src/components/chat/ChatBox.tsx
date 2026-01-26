import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { webSocketService } from "../../service/webSocketService";
import {
  Box,
  IconButton,
  Avatar,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  InputBase,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import {
  messageService,
  conversationService,
} from "../../service/conversationService";
import { Image as ImageIcon, Close as CloseIcon } from "@mui/icons-material";
import { fileUploadService } from "../../service/fileUploadService";
import type { MessageResponse } from "../../service/conversationService";
import { useToast } from "../../hooks/useToast";
import { formatChatTime } from "../../libs/dateUtils";

interface ChatBoxProps {
  conversationId: number;
  currentUserId: number;
  currentUserType: "STUDENT" | "INSTRUCTOR";
  onMessageSent?: () => void; // Callback to refresh conversation list
}

const ChatBox = ({
  conversationId,
  currentUserId,
  currentUserType,
  onMessageSent,
}: ChatBoxProps) => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { enqueueSnackbar } = useToast();

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    }, 100);
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messageService.getMessages(conversationId, 0, 50);
      if (response && response.data) {
        // Backend returns DESC, sort to ASC (oldest -> newest) for display
        const sorted = [...response.data].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        setMessages(sorted);
        scrollToBottom();
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi khi tải tin nhắn", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    conversationService.markAsRead(conversationId).catch(() => {});

    // Connect WebSocket and subscribe
    const { user } = useAuthStore.getState();
    if (user?.userId) {
      if (!webSocketService.isConnected()) {
        webSocketService.connect(user.userId.toString());
      }

      webSocketService.subscribeToConversation(
        conversationId,
        (message: MessageResponse) => {
          console.log("📨 Received live message:", message);
          setMessages((prev) => {
            // Prevent duplicates if backend sends duplicates or re-renders happens
            if (prev.some((m) => m.messageId === message.messageId))
              return prev;
            // Add and sort to ensure correct chronological order
            const updated = [...prev, message];
            return updated.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
          });
          scrollToBottom();

          // If message is from other user, mark as read immediately if we are in the chat
          if (message.senderId !== currentUserId) {
            conversationService.markAsRead(conversationId).catch(() => {});
            // Notify parent to refresh conversation list preview
            onMessageSent?.();
          }
        },
      );
    }

    return () => {
      webSocketService.unsubscribeFromConversation(conversationId);
    };
  }, [conversationId, currentUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    const messageToSend = newMessage.trim();
    setSending(true);

    let imageUrl: string | undefined = undefined;

    try {
      // Upload image first
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
        conversationId,
        content: messageToSend,
        imageUrl,
      });

      setNewMessage("");
      clearImage();
      // WebSocket will add the new message automatically, no need to refetch

      // Notify parent to refresh conversation list
      onMessageSent?.();
    } catch (error: any) {
      // Don't clear message on error if text exists
      if (!imageUrl && messageToSend) setNewMessage(messageToSend);
      enqueueSnackbar(error.message || "Lỗi khi gửi tin nhắn", {
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isOwnMessage = (message: MessageResponse) => {
    return message.senderId === currentUserId;
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
      }}
    >
      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
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
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Chưa có tin nhắn nào
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
            </Typography>
          </Box>
        ) : (
          messages.map((message) => {
            const isOwn = isOwnMessage(message);
            return (
              <Box
                key={message.messageId}
                sx={{
                  display: "flex",
                  justifyContent: isOwn ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                {!isOwn && (
                  <Avatar
                    src={message.senderAvatar}
                    alt={message.senderName}
                    sx={{ width: 32, height: 32 }}
                  >
                    {message.senderName.charAt(0)}
                  </Avatar>
                )}
                <Box sx={{ maxWidth: "70%" }}>
                  {!isOwn && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, mb: 0.5, display: "block" }}
                    >
                      {message.senderName}
                    </Typography>
                  )}
                  <Paper
                    sx={{
                      p: message.imageUrl ? 0 : 1.5,
                      overflow: "hidden",
                      bgcolor: isOwn ? "primary.main" : "white",
                      color: isOwn ? "white" : "text.primary",
                      borderRadius: isOwn
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      boxShadow: 1,
                    }}
                  >
                    {message.imageUrl && (
                      <Box
                        component="img"
                        src={message.imageUrl}
                        onClick={() => window.open(message.imageUrl, "_blank")}
                        sx={{
                          width: "100%",
                          maxWidth: 300,
                          maxHeight: 300,
                          objectFit: "cover",
                          cursor: "pointer",
                          display: "block",
                        }}
                      />
                    )}
                    {message.content && (
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-wrap",
                          p: message.imageUrl ? 1.5 : 0,
                        }}
                      >
                        {message.content}
                      </Typography>
                    )}
                  </Paper>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1, mt: 0.5, display: "block" }}
                  >
                    {formatChatTime(message.createdAt)}
                    {message.isRead && isOwn && " • Đã đọc"}
                  </Typography>
                </Box>
                {isOwn && (
                  <Avatar
                    src={message.senderAvatar}
                    alt={message.senderName}
                    sx={{ width: 32, height: 32 }}
                  >
                    {message.senderName.charAt(0)}
                  </Avatar>
                )}
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          bgcolor: "white",
          borderTop: 1,
          borderColor: "divider",
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
              <Box sx={{ position: "relative", width: "fit-content", mb: 1 }}>
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
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
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
            disabled={(!newMessage.trim() && !selectedImage) || sending}
            sx={{
              mb: 0.5,
              bgcolor: "primary.main",
              color: "white",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              "&.Mui-disabled": {
                bgcolor: "grey.300",
              },
            }}
          >
            {sending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default ChatBox;
