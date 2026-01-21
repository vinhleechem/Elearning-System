import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

const menuItems = [
    { label: "Hỏi đáp", path: "/instructor/communication/qa" },
    { label: "Tin nhắn", path: "/instructor/communication/messages" },
    { label: "Thông báo", path: "/instructor/communication/announcements" },
];

const CommunicationLayout = () => {
    const location = useLocation();

    return (
        <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
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
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {item.label}
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
            <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "#fff" }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default CommunicationLayout;
