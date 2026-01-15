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
  Tooltip,
  Fade,
  Slide,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Close as CloseIcon,
  Send as SendIcon,
  Person as PersonIcon,
  ThumbUp,
  ThumbDown,
  DeleteSweep as DeleteSweepIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "../../store/authStore";
import chatbotService, {
  type ChatMessage,
  type Conversation,
  type SuggestedQuestion,
  type QuickReply,
} from "../../service/chatbotService";
import { useToast } from "../../hooks/useToast";

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
            src="/images/chatbot-avatar.png"
            alt="AI Chatbot"
            sx={{
              width: 32,
              height: 32,
              bgcolor: "white",
            }}
          />
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
            {isUser ? (
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {message.content}
              </Typography>
            ) : (
              <Box
                sx={{
                  "& p": {
                    margin: "0.5em 0",
                    lineHeight: 1.6,
                  },
                  "& p:first-of-type": {
                    marginTop: 0,
                  },
                  "& p:last-of-type": {
                    marginBottom: 0,
                  },
                  "& ul, & ol": {
                    margin: "0.5em 0",
                    paddingLeft: "1.5em",
                  },
                  "& li": {
                    margin: "0.25em 0",
                  },
                  "& strong": {
                    fontWeight: 600,
                    color: isUser ? "white" : "primary.main",
                  },
                  "& code": {
                    backgroundColor: isUser ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
                    padding: "0.1em 0.3em",
                    borderRadius: "3px",
                    fontSize: "0.9em",
                  },
                  "& pre": {
                    backgroundColor: isUser ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    padding: "0.5em",
                    borderRadius: "4px",
                    overflow: "auto",
                  },
                  fontSize: "0.875rem",
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </Box>
            )}

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
      <Avatar
        src="/images/chatbot-avatar.png"
        alt="AI Chatbot"
        sx={{ width: 32, height: 32, bgcolor: "white" }}
      />
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
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1, display: "block" }}
      >
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
}) => {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useToast();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | undefined
  >();
  const [_conversations, setConversations] = useState<Conversation[]>([]);
  const [_showHistory, setShowHistory] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<number | null>(null);

  // Computed values
  const suggestedQuestions = useMemo(
    () => chatbotService.getSuggestedQuestions(context),
    [context],
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

  // Auto-clear conversation after 5 minutes of inactivity
  useEffect(() => {
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Only set timer if we have messages and conversation
    if (messages.length > 1 && currentConversationId) {
      // 5 minutes = 300000ms
      inactivityTimerRef.current = setTimeout(() => {
        console.log("⏱️ 5 minutes of inactivity - clearing conversation");

        // Clear localStorage cache
        const savedConvId = localStorage.getItem("chatbot_conversation_id");
        if (savedConvId) {
          const cacheKey = `chatbot_messages_${savedConvId}`;
          localStorage.removeItem(cacheKey);
        }
        localStorage.removeItem("chatbot_conversation_id");

        // Reset state
        setCurrentConversationId(undefined);
        setMessages([
          {
            role: "assistant",
            content: "Xin chào! 👋 Tôi là trợ lý AI của E-Learning. Tôi có thể giúp gì cho bạn hôm nay?",
            timestamp: new Date().toISOString(),
          },
        ]);

        // Show notification if chatbot is open
        if (isOpen) {
          enqueueSnackbar("Cuộc trò chuyện đã được làm mới do không hoạt động", {
            variant: "info",
          });
        }
      }, 300000); // 5 minutes
    }

    // Cleanup on unmount
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastActivityTime, messages.length, currentConversationId, isOpen]);

  // Update activity time when user interacts
  useEffect(() => {
    setLastActivityTime(Date.now());
  }, [messages.length, inputValue]); // Reset timer when messages change or user types

  // Persist conversation ID
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem(
        "chatbot_conversation_id",
        currentConversationId.toString(),
      );
    }
  }, [currentConversationId]);

  // Persist messages to localStorage for instant restore
  useEffect(() => {
    if (messages.length > 0 && currentConversationId) {
      const cacheKey = `chatbot_messages_${currentConversationId}`;
      localStorage.setItem(cacheKey, JSON.stringify(messages));
    }
  }, [messages, currentConversationId]);

  // Load conversations when opened
  useEffect(() => {
    if (isOpen && user?.userId) {
      loadConversations();
    }
  }, [isOpen, user?.userId]);

  // Initialize chat and restore history
  useEffect(() => {
    const initChat = async () => {
      if (!user?.userId) return;

      // Check for persisted conversation
      const savedConvId = localStorage.getItem("chatbot_conversation_id");

      // Only restore if we don't have messages yet
      if (savedConvId && messages.length === 0) {
        const convId = parseInt(savedConvId);
        const cacheKey = `chatbot_messages_${convId}`;

        // STEP 1: Try to restore from localStorage first (instant)
        const cachedMessages = localStorage.getItem(cacheKey);
        if (cachedMessages) {
          try {
            const parsedMessages: ChatMessage[] = JSON.parse(cachedMessages);
            if (parsedMessages.length > 0) {
              setCurrentConversationId(convId);
              setMessages(parsedMessages);

              // STEP 2: Sync with backend in background to ensure accuracy
              try {
                const history = await chatbotService.getConversationMessages(
                  convId,
                  user.userId,
                );
                if (history && history.length > 0) {
                  const formattedMessages: ChatMessage[] = history.map((msg) => ({
                    role: msg.role,
                    content: msg.message,
                    timestamp: msg.timestamp,
                    sources: msg.sources,
                  }));

                  // Update if backend has more messages
                  if (formattedMessages.length > parsedMessages.length) {
                    setMessages(formattedMessages);
                    localStorage.setItem(cacheKey, JSON.stringify(formattedMessages));
                  }
                }
              } catch (e) {
                console.warn("Could not sync with backend, using cached messages");
              }

              return;
            }
          } catch (e) {
            console.warn("Could not parse cached messages");
            localStorage.removeItem(cacheKey);
          }
        }

        // STEP 3: If no cache, load from backend
        try {
          const history = await chatbotService.getConversationMessages(
            convId,
            user.userId,
          );
          if (history && history.length > 0) {
            setCurrentConversationId(convId);
            const formattedMessages: ChatMessage[] = history.map((msg) => ({
              role: msg.role,
              content: msg.message,
              timestamp: msg.timestamp,
              sources: msg.sources,
            }));
            setMessages(formattedMessages);
            // Cache for next time
            localStorage.setItem(cacheKey, JSON.stringify(formattedMessages));
            return;
          }
        } catch (e) {
          console.warn("Could not restore conversation, starting new one");
          localStorage.removeItem("chatbot_conversation_id");
          localStorage.removeItem(cacheKey);
        }
      }

      // Default welcome message if no history restored
      if (messages.length === 0) {
        const welcomeMessage: ChatMessage = {
          role: "assistant",
          content: `Xin chào! 👋 Tôi là trợ lý AI của E-Learning. Tôi có thể giúp gì cho bạn hôm nay?`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    };

    if (isOpen) {
      initChat();
    }
  }, [isOpen, user?.userId]);

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

      // Don't add placeholder message, just show typing indicator
      // The typing indicator component will handle the visual feedback

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

          // Only update if we already have a message in the list, otherwise add it
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];

            // If last message is from assistant and has content, update it
            if (lastMessage?.role === "assistant") {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                role: "assistant",
                content: responseText,
                timestamp: new Date().toISOString(),
              };
              return newMessages;
            } else {
              // First chunk - add new assistant message
              return [
                ...prev,
                {
                  role: "assistant",
                  content: responseText,
                  timestamp: new Date().toISOString(),
                },
              ];
            }
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
          enqueueSnackbar("Có lỗi xảy ra. Vui lòng thử lại.", {
            variant: "error",
          });
        },
        // onConversationId
        (id) => {
          setCurrentConversationId(id);
        },
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      setIsLoading(false);
      enqueueSnackbar("Không thể gửi tin nhắn. Vui lòng thử lại.", {
        variant: "error",
      });
    }
  };

  // Handle feedback
  const handleFeedback = async (_messageIndex: number, helpful: boolean) => {
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
    // Clear conversation ID and cached messages
    const savedConvId = localStorage.getItem("chatbot_conversation_id");
    if (savedConvId) {
      const cacheKey = `chatbot_messages_${savedConvId}`;
      localStorage.removeItem(cacheKey);
    }
    localStorage.removeItem("chatbot_conversation_id");

    setCurrentConversationId(undefined);
    setMessages([
      {
        role: "assistant",
        content:
          "Xin chào! 👋 Tôi là trợ lý AI của E-Learning. Tôi có thể giúp gì cho bạn hôm nay?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setAnchorEl(null);
    setShowClearDialog(false);
    enqueueSnackbar("Đã xóa hội thoại", { variant: "success" });
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
            <Box
              onClick={handleToggle}
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                backgroundImage: "url(/images/chatbot-avatar.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: 3,
                cursor: "pointer",
                position: "relative",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: 6,
                },
              }}
            >
              {unreadCount > 0 && (
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                  }}
                />
              )}
            </Box>
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
              <Avatar
                src="/images/chatbot-avatar.png"
                alt="AI Chatbot"
                sx={{ width: 40, height: 40, bgcolor: "white" }}
              />
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
            sx={{
              zIndex: 10001, // Higher than chatbot (9999)
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 180,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setShowHistory(!_showHistory);
                setAnchorEl(null);
              }}
            >
              <HistoryIcon sx={{ mr: 1 }} fontSize="small" />
              Lịch sử chat
            </MenuItem>
            <MenuItem
              onClick={() => {
                setShowClearDialog(true);
                setAnchorEl(null);
              }}
              sx={{ color: "error.main" }}
            >
              <DeleteSweepIcon sx={{ mr: 1 }} fontSize="small" />
              Xóa hội thoại
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
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
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
                <SendIcon />
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

      {/* Clear Conversation Confirmation Dialog */}
      <Dialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        aria-labelledby="clear-dialog-title"
      >
        <DialogTitle id="clear-dialog-title">
          Xóa hội thoại?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa toàn bộ lịch sử hội thoại này không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleClearConversation}
            color="error"
            variant="contained"
            startIcon={<DeleteSweepIcon />}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatbotWidget;
