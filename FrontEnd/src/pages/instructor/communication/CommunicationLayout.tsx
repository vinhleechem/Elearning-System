import { Box, List, ListItem, ListItemButton, ListItemText, Chip } from "@mui/material";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { conversationService } from "../../../service/conversationService";
import { useAuthStore } from "../../../store/authStore";
import { useEffect, useState } from "react";

const menuItems = [
    { label: "Hỏi đáp", path: "/instructor/communication/qa" },
    { label: "Tin nhắn", path: "/instructor/communication/messages" },
    { label: "Thông báo", path: "/instructor/communication/announcements" },
];

import { webSocketService } from "../../../service/webSocketService";

const CommunicationLayout = () => {
    const location = useLocation();
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

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            {/* Secondary Sidebar */}
            <Box
                sx={{
                    width: 260, // Adjusted to medium
                    borderRight: "1px solid #e0e0e0",
                    bgcolor: "#fff",
                    display: { xs: "none", md: "block" },
                    pt: 2.5, // Medium padding
                }}
            >
                <List component="nav" sx={{ pt: 0 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    component={RouterLink}
                                    to={item.path}
                                    selected={isActive}
                                    sx={{
                                        borderLeft: isActive ? "4px solid #a435f0" : "4px solid transparent",
                                        pl: 2,
                                        py: 1.1, // Medium vertical padding
                                        "&.Mui-selected": {
                                            bgcolor: "transparent",
                                            "& .MuiListItemText-primary": {
                                                fontWeight: 700,
                                                color: "#2d2f31",
                                            },
                                        },
                                        "&:hover": {
                                            bgcolor: "rgba(0,0,0,0.04)",
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1} justifyContent="space-between" width="100%">
                                                {item.label}
                                                {item.label === "Tin nhắn" && unreadMessages > 0 && (
                                                    <Chip
                                                        label={unreadMessages}
                                                        size="small"
                                                        color="error"
                                                        sx={{ height: 20, minWidth: 20, '& .MuiChip-label': { px: 1, fontSize: '0.75rem' } }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        primaryTypographyProps={{
                                            fontSize: "0.95rem",
                                            color: isActive ? "#2d2f31" : "#6a6f73",
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Content Area */}
            <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "#f8f9fb" }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default CommunicationLayout;
// Re-export triggered
