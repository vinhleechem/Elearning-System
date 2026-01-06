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
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { type Notification } from "../../service/webSocketService";
import { useAuthStore } from "../../store/authStore";
import { useSnackbar } from "notistack";

const NotificationBell = () => {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    // TODO: Re-enable WebSocket after fixing authentication in backend
    // WebSocket is currently disabled due to 401 Unauthorized errors
    // The backend needs to be updated to handle JWT tokens in WebSocket handshake
    // if (user?.userId) {
    //   // Connect to WebSocket
    //   webSocketService.connect(user.userId.toString(), (notification) => {
    //     // Add new notification to list
    //     setNotifications((prev) => [notification, ...prev]);
    //     // Show snackbar
    //     enqueueSnackbar(notification.message, {
    //       variant: notification.type.toLowerCase() as any,
    //       autoHideDuration: 5000,
    //     });
    //   });
    //   // Cleanup on unmount
    //   return () => {
    //     webSocketService.disconnect();
    //   };
    // }
  }, [user?.userId, enqueueSnackbar]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (index: number) => {
    setNotifications((prev) =>
      prev.map((notif, i) =>
        i === index ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 },
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

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Không có thông báo mới
            </Typography>
          </Box>
        ) : (
          notifications.map((notif, index) => (
            <MenuItem
              key={index}
              onClick={() => handleMarkAsRead(index)}
              sx={{
                bgcolor: notif.isRead ? "transparent" : "action.hover",
                display: "block",
                whiteSpace: "normal",
                py: 1.5,
              }}
            >
              <Stack spacing={0.5}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {notif.title}
                  </Typography>
                  <Chip
                    label={notif.type}
                    size="small"
                    color={getTypeColor(notif.type) as any}
                    sx={{ height: 20, fontSize: 10 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {notif.message}
                </Typography>
                {notif.createdAt && (
                  <Typography variant="caption" color="text.disabled">
                    {new Date(notif.createdAt).toLocaleString("vi-VN")}
                  </Typography>
                )}
              </Stack>
            </MenuItem>
          ))
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: "center" }}>
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer", fontWeight: 600 }}
                onClick={() => {
                  setNotifications([]);
                  handleClose();
                }}
              >
                Xóa tất cả
              </Typography>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
