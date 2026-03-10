import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  Avatar,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PlayCircleOutline,
  ForumOutlined,
  EqualizerOutlined,
  BuildOutlined,
  HelpOutlineOutlined,
  PersonOutline,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  LogoutOutlined,
  HomeOutlined,
  School as SchoolIcon,
} from "@mui/icons-material";
import { conversationService } from "../../service/conversationService";
import { useAuthStore } from "../../store/authStore";
import { webSocketService } from "../../service/webSocketService";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 88;

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
  {
    label: "Công cụ",
    icon: <BuildOutlined />,
    path: "/instructor/tools",
  },
  {
    label: "Tài nguyên",
    icon: <HelpOutlineOutlined />,
    path: "/instructor/resources",
  },
];

const InstructorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
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

  const getActiveItem = () => {
    const path = location.pathname;
    const search = location.search;
    if (path.includes("/instructor/profile") || search.includes("section=PROFILE")) return "Hồ sơ";
    const item = sidebarItems.find((i) => path.startsWith(i.path.split("?")[0]));
    return item?.label || "Khóa học";
  };

  const activeLabel = getActiveItem();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f1f5f9" }}>
      {/* ─── SIDEBAR ─── */}
      <Box
        sx={{
          width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          bgcolor: "#0f172a", // Deep slate/navy
          color: "white",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 1200,
          overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Logo & Toggle */}
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
            minHeight: 80,
          }}
        >
          {!sidebarCollapsed && (
            <Box
              onClick={() => navigate("/")}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SchoolIcon sx={{ color: "#3b82f6", fontSize: 28 }} />
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{ letterSpacing: "-0.02em", color: "white" }}
              >
                vidi
              </Typography>
            </Box>
          )}

          <IconButton
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            sx={{
              color: "rgba(255,255,255,0.6)",
              bgcolor: "rgba(255,255,255,0.05)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "white" },
              borderRadius: "8px",
            }}
          >
            {sidebarCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        {/* Nav Items */}
        <Box sx={{ flex: 1, px: 2, pt: 2 }}>
          <Stack spacing={0.5}>
            {sidebarItems.map((item) => {
              const isActive = activeLabel === item.label;
              return (
                <Tooltip
                  key={item.label}
                  title={sidebarCollapsed ? item.label : ""}
                  placement="right"
                >
                  <Box
                    onClick={() => navigate(item.path)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: sidebarCollapsed ? "center" : "flex-start",
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      cursor: "pointer",
                      borderRadius: "12px",
                      position: "relative",
                      transition: "all 0.2s",
                      color: isActive ? "#fff" : "#94a3b8",
                      bgcolor: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
                      "&:hover": {
                        bgcolor: isActive
                          ? "rgba(59, 130, 246, 0.2)"
                          : "rgba(255,255,255,0.03)",
                        color: "white",
                      },
                      ...(isActive && {
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "20%",
                          bottom: "20%",
                          width: 4,
                          bgcolor: "#3b82f6",
                          borderRadius: "0 4px 4px 0",
                        },
                      }),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: isActive ? "#3b82f6" : "inherit",
                      }}
                    >
                      {item.icon}
                    </Box>

                    {!sidebarCollapsed && (
                      <Typography
                        variant="body2"
                        fontWeight={isActive ? 700 : 500}
                        sx={{ fontSize: "0.95rem" }}
                      >
                        {item.label}
                      </Typography>
                    )}

                    {item.label === "Giao tiếp" && unreadMessages > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: sidebarCollapsed ? 12 : 16,
                          minWidth: 18,
                          height: 18,
                          bgcolor: "#ef4444",
                          borderRadius: 9,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "white",
                          border: "2px solid #0f172a",
                        }}
                      >
                        {unreadMessages}
                      </Box>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>

        {/* Footer Sidebar: User Profile */}
        <Box sx={{ p: 2, mt: "auto" }}>
          {!sidebarCollapsed && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: "16px",
                bgcolor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={user?.avatarUrl}
                  sx={{ width: 40, height: 40, borderRadius: "12px", border: "2px solid #3b82f6" }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    noWrap
                    sx={{ color: "white" }}
                  >
                    {user?.fullName || "Instructor"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }} noWrap>
                    {user?.email}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          <Stack spacing={0.5}>
            <Tooltip title={sidebarCollapsed ? "Quay lại Home" : ""} placement="right">
              <Box
                onClick={() => navigate("/")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  borderRadius: "12px",
                  color: "#94a3b8",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)", color: "white" },
                }}
              >
                <HomeOutlined />
                {!sidebarCollapsed && (
                  <Typography variant="body2" fontWeight={500}>
                    Về trang chủ
                  </Typography>
                )}
              </Box>
            </Tooltip>

            <Tooltip title={sidebarCollapsed ? "Đăng xuất" : ""} placement="right">
              <Box
                onClick={handleLogout}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  borderRadius: "12px",
                  color: "#f87171",
                  "&:hover": { bgcolor: "rgba(248,113,113,0.05)", color: "#ef4444" },
                }}
              >
                <LogoutOutlined />
                {!sidebarCollapsed && (
                  <Typography variant="body2" fontWeight={500}>
                    Đăng xuất
                  </Typography>
                )}
              </Box>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default InstructorLayout;
