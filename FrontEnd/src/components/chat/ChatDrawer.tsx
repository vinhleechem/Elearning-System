import { useState, useEffect, useRef } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBox from "./ChatBox";
import { conversationService } from "../../service/conversationService";
import type { ConversationResponse } from "../../service/conversationService";
import toast from "react-hot-toast";
import { formatLastSeen } from "../../libs/dateUtils";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  courseId: number;
  currentUserId: number;
  currentUserType: "STUDENT" | "INSTRUCTOR";
}

const ChatDrawer = ({
  open,
  onClose,
  courseId,
  currentUserId,
  currentUserType,
}: ChatDrawerProps) => {
  const [conversation, setConversation] = useState<ConversationResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const lastFetchedCourseId = useRef<number | null>(null);

  useEffect(() => {
    if (!open || !courseId || lastFetchedCourseId.current === courseId) return;

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentUserType === "STUDENT") {
          const response =
            await conversationService.getOrCreateConversation(courseId);
          if (!cancelled) {
            setConversation(response);
            lastFetchedCourseId.current = courseId;
          }
        } else {
          const response = await conversationService.getMyConversations(0, 1, {
            courseId,
          });
          if (!cancelled && response.data && response.data.length > 0) {
            setConversation(response.data[0]);
            lastFetchedCourseId.current = courseId;
          }
        }
      } catch (error: any) {
        if (!cancelled) {
          toast.error(error.message || "Lỗi khi tải conversation");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [open, courseId, currentUserType]);

  const otherUser =
    currentUserType === "STUDENT"
      ? {
          name: conversation?.instructorName || "",
          avatar: conversation?.instructorAvatar,
        }
      : {
          name: conversation?.studentName || "",
          avatar: conversation?.studentAvatar,
        };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar src={otherUser.avatar} alt={otherUser.name}>
              {otherUser.name.charAt(0)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                {otherUser.name || "Chat"}
              </Typography>
              {conversation?.lastMessageAt && (
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    fontSize: "11px",
                    display: "block",
                  }}
                >
                  Hoạt động {formatLastSeen(conversation.lastMessageAt)}
                </Typography>
              )}
            </Box>
            {conversation?.isLocked && (
              <Chip
                label="Đã khóa"
                size="small"
                sx={{
                  bgcolor: "error.main",
                  color: "white",
                }}
              />
            )}
            <IconButton onClick={onClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Chat Content */}
        <Box sx={{ flex: 1, overflow: "hidden" }}>
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
          ) : conversation ? (
            <ChatBox
              conversationId={conversation.conversationId}
              currentUserId={currentUserId}
              currentUserType={currentUserType}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Không tìm thấy conversation
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatDrawer;
