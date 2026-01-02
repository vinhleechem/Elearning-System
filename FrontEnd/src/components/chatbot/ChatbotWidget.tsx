/**
 * ChatbotWidget - Modern AI Chatbot Component
 * Features: Real-time chat, streaming responses, typing indicator, feedback system
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Tooltip,
  Fade,
  Slide,
  Badge,
  Menu,
  MenuItem,
  Rating,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ThumbUp,
  ThumbDown,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useAuthStore } from "../../store/authStore";
import chatbotService, {
  type ChatMessage,
  type Conversation,
  type SuggestedQuestion,
  type QuickReply,
} from "../../service/chatbotService";
import { useSnackbar } from "notistack";

// ============= TYPES =============

interface ChatbotWidgetProps {
  context?: {
    page?: string;
    course_id?: number;
    [key: string]: any;
  };
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: "light" | "dark";
}

// ============= SUB-COMPONENTS =============

/**
 * Message Component
 */
const MessageBubble: React.FC<{
  message: ChatMessage;
  onFeedback?: (helpful: boolean) => void;
  showFeedback?: boolean;
}> = ({ message, onFeedback, showFeedback }) => {
  const isUser = message.role === "user";
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleFeedback = (helpful: boolean) => {
    setFeedbackGiven(true);
    onFeedback?.(helpful);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2,
        animation: "fadeIn 0.3s ease-in",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Box sx={{ maxWidth: "75%", display: "flex", gap: 1 }}>
        {!isUser && (
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              fontSize: "1rem",
            }}
          >
            <BotIcon fontSize="small" />
          </Avatar>
        )}

        <Box>
          <Paper
            elevation={1}
            sx={{
              p: 1.5,
              bgcolor: isUser ? "primary.main" : "grey.100",
              color: isUser ? "white" : "text.primary",
              borderRadius: 2,
              position: "relative",
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {message.content}
            </Typography>

            {message.cached && (
              <Tooltip title="Cached response">
                <Chip
                  label="⚡"
                  size="small"
                  sx={{ mt: 0.5, height: 16, fontSize: "0.7rem" }}
                />
              </Tooltip>
            )}
          </Paper>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <Box sx={{ mt: 0.5 }}>
              {message.sources.map((source, idx) => (
                <Chip
                  key={idx}
                  label={source.title || `Source ${idx + 1}`}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5, fontSize: "0.7rem" }}
                />
              ))}
            </Box>
          )}

          {/* Timestamp */}
          {message.timestamp && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5, fontSize: "0.65rem" }}
            >
              {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          )}

          {/* Feedback buttons */}
          {!isUser && showFeedback && !feedbackGiven && (
            <Box sx={{ mt: 1, display: "flex", gap: 0.5 }}>
              <Tooltip title="Helpful">
                <IconButton
                  size="small"
                  onClick={() => handleFeedback(true)}
                  sx={{ width: 24, height: 24 }}
                >
                  <ThumbUp sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Not helpful">
                <IconButton
                  size="small"
                  onClick={() => handleFeedback(false)}
                  sx={{ width: 24, height: 24 }}
                >
                  <ThumbDown sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {isUser && (
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "secondary.main",
              fontSize: "1rem",
            }}
          >
            <PersonIcon fontSize="small" />
          </Avatar>
        )}
      </Box>
    </Box>
  );
};

/**
 * Typing Indicator
 */
const TypingIndicator: React.FC = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
        <BotIcon fontSize="small" />
      </Avatar>
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          bgcolor: "grey.100",
          borderRadius: 2,
          display: "flex",
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "grey.500",
            animation: "bounce 1.4s infinite ease-in-out",
            animationDelay: "0s",
            "@keyframes bounce": {
              "0%, 80%, 100%": { transform: "scale(0)" },
              "40%": { transform: "scale(1)" },
            },
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "grey.500",
            animation: "bounce 1.4s infinite ease-in-out",
            animationDelay: "0.16s",
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "grey.500",
            animation: "bounce 1.4s infinite ease-in-out",
            animationDelay: "0.32s",
          }}
        />
      </Paper>
    </Box>
  );
};

/**
 * Suggested Questions
 */
const SuggestedQuestions: React.FC<{
  questions: SuggestedQuestion[];
  onSelect: (question: string) => void;
}> = ({ questions, onSelect }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        💡 Câu hỏi gợi ý:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {questions.map((q) => (
          <Chip
            key={q.id}
            label={q.text}
            size="small"
            variant="outlined"
            clickable
            onClick={() => onSelect(q.text)}
            sx={{
              fontSize: "0.75rem",
              "&:hover": {
                bgcolor: "primary.light",
                color: "white",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

/**
 * Quick Replies
 */
const QuickReplies: React.FC<{
  replies: QuickReply[];
  onSelect: (value: string) => void;
}> = ({ replies, onSelect }) => {
  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
      {replies.map((reply) => (
        <Button
          key={reply.id}
          size="small"
          variant="outlined"
          onClick={() => onSelect(reply.value)}
          sx={{ fontSize: "0.7rem", textTransform: "none" }}
        >
          {reply.label}
        </Button>
      ))}
    </Box>
  );
};

// ============= MAIN COMPONENT =============

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  context,
  position = "bottom-right",
  theme = "light",
}) => {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Computed values
  const suggestedQuestions = useMemo(
    () => chatbotService.getSuggestedQuestions(context),
    [context]
  );
  const quickReplies = useMemo(() => chatbotService.getQuickReplies(), []);

  // Position styles
  const positionStyles = {
    "bottom-right": { bottom: 20, right: 20 },
    "bottom-left": { bottom: 20, left: 20 },
    "top-right": { top: 20, right: 20 },
    "top-left": { top: 20, left: 20 },
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load conversations when opened
  useEffect(() => {
    if (isOpen && user?.userId) {
      loadConversations();
    }
  }, [isOpen, user?.userId]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: "assistant",
        content: `Xin chào! 👋 Tôi là trợ lý AI của E-Learning. Tôi có thể giúp gì cho bạn hôm nay?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Load conversations
  const loadConversations = async () => {
    if (!user?.userId) return;

    try {
      const convs = await chatbotService.getConversations(user.userId, 10);
      setConversations(convs);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  // Send message
  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    
    if (!text || !user?.userId) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Send via REST API with streaming
      let responseText = "";
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      // Add placeholder for streaming
      setMessages((prev) => [...prev, assistantMessage]);

      await chatbotService.sendMessageStream(
        {
          user_id: user.userId,
          message: text,
          conversation_id: currentConversationId,
          context,
        },
        // onChunk
        (chunk) => {
          responseText += chunk;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...assistantMessage,
              content: responseText,
            };
            return newMessages;
          });
        },
        // onComplete
        () => {
          setIsTyping(false);
          setIsLoading(false);
          setUnreadCount((prev) => prev + 1);
        },
        // onError
        (error) => {
          console.error("Streaming error:", error);
          setIsTyping(false);
          setIsLoading(false);
          enqueueSnackbar("Có lỗi xảy ra. Vui lòng thử lại.", { variant: "error" });
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      setIsLoading(false);
      enqueueSnackbar("Không thể gửi tin nhắn. Vui lòng thử lại.", { variant: "error" });
    }
  };

  // Handle feedback
  const handleFeedback = async (messageIndex: number, helpful: boolean) => {
    if (!user?.userId || !currentConversationId) return;

    try {
      await chatbotService.submitFeedback({
        user_id: user.userId,
        conversation_id: currentConversationId,
        rating: helpful ? 5 : 1,
        feedback: helpful ? "Helpful" : "Not helpful",
      });

      enqueueSnackbar("Cảm ơn phản hồi của bạn!", { variant: "success" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([
      {
        role: "assistant",
        content: "Xin chào! 👋 Tôi là trợ lý AI của E-Learning. Tôi có thể giúp gì cho bạn hôm nay?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setCurrentConversationId(undefined);
    setAnchorEl(null);
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.userId) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      enqueueSnackbar("Vui lòng chọn file hình ảnh", { variant: "error" });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar("Kích thước file quá lớn. Tối đa 5MB", { variant: "error" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", user.userId.toString());
      if (currentConversationId) {
        formData.append("conversation_id", currentConversationId.toString());
      }

      const CHATBOT_BASE_URL = import.meta.env.VITE_CHATBOT_URL || "http://localhost:8001";
      const response = await fetch(`${CHATBOT_BASE_URL}/upload/image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Add image message to chat
      const imageMessage: ChatMessage = {
        role: "user",
        content: `[Hình ảnh: ${data.filename}]\n${data.file_url}`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, imageMessage]);
      enqueueSnackbar("Đã tải lên hình ảnh", { variant: "success" });

      // Optionally send a follow-up message
      setTimeout(() => {
        handleSendMessage("Tôi vừa gửi một hình ảnh, bạn có thể xem và tư vấn cho tôi không?");
      }, 500);
    } catch (error) {
      console.error("Error uploading image:", error);
      enqueueSnackbar("Không thể tải lên hình ảnh", { variant: "error" });
    }

    // Reset input
    event.target.value = "";
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.userId) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      enqueueSnackbar("Kích thước file quá lớn. Tối đa 10MB", { variant: "error" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", user.userId.toString());
      if (currentConversationId) {
        formData.append("conversation_id", currentConversationId.toString());
      }

      const CHATBOT_BASE_URL = import.meta.env.VITE_CHATBOT_URL || "http://localhost:8001";
      const response = await fetch(`${CHATBOT_BASE_URL}/upload/file`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Add file message to chat
      const fileMessage: ChatMessage = {
        role: "user",
        content: `[File: ${data.filename}]\n${data.file_url}`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, fileMessage]);
      enqueueSnackbar("Đã tải lên file", { variant: "success" });
    } catch (error) {
      console.error("Error uploading file:", error);
      enqueueSnackbar("Không thể tải lên file", { variant: "error" });
    }

    // Reset input
    event.target.value = "";
  };

  // Toggle chatbot
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  if (!user) {
    return null; // Don't show chatbot if user not logged in
  }

  return (
    <>
      {/* Floating Button */}
      <Fade in={!isOpen}>
        <Box
          sx={{
            position: "fixed",
            ...positionStyles[position],
            zIndex: 9999,
          }}
        >
          <Tooltip title="Trò chuyện với AI" placement="left">
            <IconButton
              onClick={handleToggle}
              sx={{
                width: 60,
                height: 60,
                bgcolor: "primary.main",
                color: "white",
                boxShadow: 3,
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "scale(1.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <ChatIcon fontSize="large" />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Fade>

      {/* Chat Window */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            ...positionStyles[position],
            width: 400,
            height: 600,
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "white",
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: "white" }}>
                <BotIcon sx={{ color: "primary.main" }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  ● Online - Trả lời ngay
                </Typography>
              </Box>
            </Box>

            <Box>
              <Tooltip title="More options">
                <IconButton
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ color: "white" }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton onClick={handleToggle} sx={{ color: "white" }}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                setShowHistory(!showHistory);
                setAnchorEl(null);
              }}
            >
              <HistoryIcon sx={{ mr: 1 }} fontSize="small" />
              Lịch sử chat
            </MenuItem>
            <MenuItem onClick={handleClearConversation}>
              <RefreshIcon sx={{ mr: 1 }} fontSize="small" />
              Bắt đầu lại
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleToggle();
                setAnchorEl(null);
              }}
            >
              <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
              Đóng chat
            </MenuItem>
          </Menu>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: "grey.50",
            }}
          >
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                onFeedback={(helpful) => handleFeedback(index, helpful)}
                showFeedback={index === messages.length - 1}
              />
            ))}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Replies */}
          {messages.length <= 1 && (
            <Box sx={{ px: 2, py: 1, bgcolor: "grey.50" }}>
              <QuickReplies
                replies={quickReplies}
                onSelect={handleSendMessage}
              />
            </Box>
          )}

          {/* Suggested Questions */}
          {messages.length <= 1 && suggestedQuestions.length > 0 && (
            <Box sx={{ px: 2, pb: 1, bgcolor: "grey.50" }}>
              <SuggestedQuestions
                questions={suggestedQuestions}
                onSelect={handleSendMessage}
              />
            </Box>
          )}

          <Divider />

          {/* Input Area */}
          <Box sx={{ p: 2, bgcolor: "white" }}>
            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              {/* Attachment buttons */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Tooltip title="Gửi hình ảnh">
                  <IconButton
                    size="small"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isLoading}
                    sx={{ width: 32, height: 32 }}
                  >
                    <ImageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Gửi file">
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    sx={{ width: 32, height: 32 }}
                  >
                    <AttachFileIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <TextField
                fullWidth
                size="small"
                placeholder="Nhập tin nhắn..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                inputRef={inputRef}
                disabled={isLoading}
                multiline
                maxRows={3}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": { bgcolor: "grey.300" },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block", textAlign: "center" }}
            >
              Powered by AI - Có thể có sai sót
            </Typography>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default ChatbotWidget;

