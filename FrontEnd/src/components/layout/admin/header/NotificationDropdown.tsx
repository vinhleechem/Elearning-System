import { useState, useEffect } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import type { Notification } from "../../../../service/webSocketService";
import { notificationService } from "../../../../service/notificationService";
import { useAuthStore } from "../../../../store/authStore";
import { useToast } from "../../../../hooks/useToast";

const NotificationDropdown = () => {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const open = Boolean(anchorEl);

  // Fetch notifications when dropdown opens
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await notificationService.getMyNotifications(0, 10);
      setNotifications(response.data);
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi khi tải thông báo", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count on mount and periodically
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      // Silently fail for unread count
      console.error("Failed to fetch unread count:", error);
    }
  };

  useEffect(() => {
    if (!user?.userId) return;

    fetchUnreadCount();

    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]); // Only re-run when userId changes, not the entire user object

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: number, index: number) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif, i) =>
          i === index ? { ...notif, isRead: true } : notif,
        ),
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi khi đánh dấu đã đọc", {
        variant: "error",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );

      // Reset unread count
      setUnreadCount(0);

      enqueueSnackbar("Đã đánh dấu tất cả là đã đọc", {
        variant: "success",
      });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi khi đánh dấu tất cả", {
        variant: "error",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "success";
      case "WARNING":
        return "warning";
      case "ERROR":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          width: 44,
          height: 44,
          border: "1px solid",
          borderColor: "grey.200",
          bgcolor: "white",
          color: "grey.500",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: "grey.100",
            color: "grey.700",
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6" fontWeight={600}>
            Thông báo
          </Typography>
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Không có thông báo mới
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.map((notif, index) => (
              <MenuItem
                key={notif.notificationId}
                onClick={() => notif.notificationId && handleMarkAsRead(notif.notificationId, index)}
                sx={{
                  bgcolor: notif.isRead ? "transparent" : "action.hover",
                  display: "block",
                  whiteSpace: "normal",
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": {
                    borderBottom: "none",
                  },
                }}
              >
                <Stack spacing={0.5}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {notif.title}
                    </Typography>
                    <Chip
                      label={notif.type}
                      size="small"
                      color={getTypeColor(notif.type) as any}
                      sx={{ height: 20, fontSize: 10, flexShrink: 0 }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {notif.message}
                  </Typography>
                  {notif.createdAt && (
                    <Typography variant="caption" color="text.disabled">
                      {new Date(notif.createdAt).toLocaleString("vi-VN")}
                    </Typography>
                  )}
                </Stack>
              </MenuItem>
            ))}
          </Box>
        )}

        {notifications.length > 0 && !loading && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: "center" }}>
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer", fontWeight: 600 }}
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </Typography>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationDropdown;
