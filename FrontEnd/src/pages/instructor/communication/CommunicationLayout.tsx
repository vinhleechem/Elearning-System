import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  ListItemIcon,
} from "@mui/material";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { conversationService } from "../../../service/conversationService";
import { useAuthStore } from "../../../store/authStore";
import { useEffect, useState } from "react";
import {
  QuestionAnswerOutlined,
  EmailOutlined,
  NotificationsOutlined,
} from "@mui/icons-material";
import { webSocketService } from "../../../service/webSocketService";

const menuItems = [
  {
    label: "Hỏi đáp",
    path: "/instructor/communication/qa",
    icon: <QuestionAnswerOutlined sx={{ fontSize: 20 }} />
  },
  {
    label: "Tin nhắn",
    path: "/instructor/communication/messages",
    icon: <EmailOutlined sx={{ fontSize: 20 }} />
  },
  {
    label: "Thông báo",
    path: "/instructor/communication/announcements",
    icon: <NotificationsOutlined sx={{ fontSize: 20 }} />
  },
];

const CommunicationLayout = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user?.userId) {
      const fetchUnread = () => {
        conversationService
          .getUnreadCount()
          .then(setUnreadMessages)
          .catch(console.error);
      };

      fetchUnread();

      if (!webSocketService.isConnected()) {
        webSocketService.connect(user.userId.toString());
      }

      const handleNotification = (notif: any) => {
        if (notif.type === "INFO") {
          if (notif.userId && notif.userId !== user.userId) return;
          fetchUnread();
        }
      };

      const handleMarkAsRead = () => fetchUnread();

      webSocketService.addNotificationListener(handleNotification);
      window.addEventListener("conversation:markAsRead", handleMarkAsRead);

      return () => {
        webSocketService.removeNotificationListener(handleNotification);
        window.removeEventListener("conversation:markAsRead", handleMarkAsRead);
      };
    }
  }, [user?.userId]);

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 0px)", overflow: "hidden" }}>
      {/* ─── SECONDARY SIDEBAR ─── */}
      <Box
        sx={{
          width: 280,
          borderRight: "1px solid #e2e8f0",
          bgcolor: "#fff",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 4, pb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ letterSpacing: "-0.01em" }}>
            Giao tiếp
          </Typography>
          <Typography variant="caption" color="#64748b" fontWeight={500}>
            Kết nối với học viên của bạn
          </Typography>
        </Box>

        <List sx={{ px: 2, pt: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    borderRadius: "12px",
                    py: 1.5,
                    px: 2,
                    color: isActive ? "#2563eb" : "#475569",
                    bgcolor: isActive ? "#eff6ff" : "transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: isActive ? "#eff6ff" : "#f8fafc",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? "#2563eb" : "#94a3b8",
                      transition: "color 0.2s"
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.92rem",
                      fontWeight: isActive ? 700 : 600,
                    }}
                  />
                  {item.label === "Tin nhắn" && unreadMessages > 0 && (
                    <Box
                      sx={{
                        bgcolor: "#ef4444",
                        color: "white",
                        minWidth: 20,
                        height: 20,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 800,
                        px: 0.8,
                      }}
                    >
                      {unreadMessages}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: "auto", p: 3, mb: 2 }}>
          <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
            <Typography variant="caption" fontWeight={700} color="#64748b" display="block" mb={0.5}>
              Mẹo quan trọng
            </Typography>
            <Typography variant="caption" color="#94a3b8" lineHeight={1.5} display="block">
              Phản hồi nhanh giúp tăng điểm uy tín bài giảng của bạn.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── CONTENT AREA ─── */}
      <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "#f8fafc" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default CommunicationLayout;
