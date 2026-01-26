import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import {
  PlayCircleOutline,
  ForumOutlined,
  EqualizerOutlined,
  BuildOutlined,
  HelpOutlineOutlined,
  PersonOutline,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { conversationService } from "../../service/conversationService";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";

import { webSocketService } from "../../service/webSocketService";

const sidebarItems = [
  {
    label: "Khóa học",
    icon: <PlayCircleOutline />,
    path: "/instructor/dashboard?section=COURSES",
  },
  {
    label: "Giao tiếp",
    icon: <ForumOutlined />,
    hasDot: true,
    path: "/instructor/communication",
  },
  {
    label: "Hiệu suất",
    icon: <EqualizerOutlined />,
    path: "/instructor/performance",
  },
  { label: "Công cụ", icon: <BuildOutlined />, path: "/instructor/tools" },
  {
    label: "Tài nguyên",
    icon: <HelpOutlineOutlined />,
    path: "/instructor/resources",
  },
  {
    label: "Hồ sơ",
    icon: <PersonOutline />,
    path: "/instructor/dashboard?section=PROFILE",
  },
];

const InstructorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { user } = useAuthStore();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user?.userId) {
      const fetchUnread = () => {
        conversationService.getUnreadCount()
          .then(setUnreadMessages)
          .catch(console.error);
      };

      fetchUnread();

      // Connect WebSocket
      if (!webSocketService.isConnected()) {
        webSocketService.connect(user.userId.toString());
      }

      const handleNotification = (notif: any) => {
        if (notif.type === "INFO") {
          fetchUnread();
        }
      };

      webSocketService.addNotificationListener(handleNotification);

      return () => {
        webSocketService.removeNotificationListener(handleNotification);
      };
    }
  }, [user?.userId]);

  // Helper to determine active state.
  const getActiveItem = () => {
    const path = location.pathname;
    const search = location.search;

    if (path.includes("/instructor/profile")) return "Hồ sơ";

    // Check for dashboard section
    if (path.includes("/instructor/dashboard")) {
      if (search.includes("section=PROFILE")) return "Hồ sơ";
      return "Khóa học";
    }

    if (path.includes("/instructor/courses")) {
      return "Khóa học"; // Or keep active item as "Khóa học" when editing content
    }

    // Default or other paths can match directly
    const item = sidebarItems.find((i) => path.startsWith(i.path)); // This matching is weak due to query params in path
    if (item) return item.label;

    return "Khóa học";
  };

  const activeSidebarItem = getActiveItem();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fb" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: sidebarCollapsed ? 80 : 240,
          bgcolor: "#0e0f1a",
          color: "white",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          py: 3,
          px: 2,
          gap: 3,
          transition: "width 0.3s ease",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 1200,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
            gap: 1,
          }}
        >
          {!sidebarCollapsed && (
            <Typography
              variant="h5"
              fontWeight={700}
              onClick={() => navigate("/")}
              sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }}
            >
              vidi
            </Typography>
          )}
          <IconButton
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.08)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Stack spacing={1} alignItems={sidebarCollapsed ? "center" : "stretch"}>
          {sidebarItems.map((item) => {
            const isActive = activeSidebarItem === item.label;
            return (
              <Button
                key={item.label}
                startIcon={!sidebarCollapsed ? item.icon : undefined}
                onClick={() => {
                  navigate(item.path);
                }}
                sx={{
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: sidebarCollapsed ? 0 : 2,
                  py: 1.25,
                  bgcolor: isActive ? "#3b82f6" : "transparent",
                  position: "relative",
                  minWidth: sidebarCollapsed ? 48 : "auto",
                  "&:hover": { bgcolor: "#1f1f2b" },
                }}
              >
                {sidebarCollapsed ? item.icon : item.label}
                {item.label === "Giao tiếp" && unreadMessages > 0 && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: "#ef4444", // Red color for notification
                      borderRadius: "50%",
                      position: "absolute",
                      top: 8,
                      right: sidebarCollapsed ? 8 : 16,
                    }}
                  />
                )}
              </Button>
            );
          })}
        </Stack>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          transition: "margin-left 0.3s ease",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>


    </Box>
  );
};

export default InstructorLayout;
