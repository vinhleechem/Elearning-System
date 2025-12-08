import React, { useRef, useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useAuthStore } from "../../store/authStore";
import { userService } from "../../service/userService";

const menuItems = [
  { label: "View public profile", active: false },
  { label: "Profile", active: true },
  { label: "Photo", active: false },
  { label: "Account Security", active: false },
  { label: "Subscriptions", active: false },
  { label: "Payment methods", active: false },
  { label: "Privacy", active: false },
  { label: "Notification Preferences", active: false },
  { label: "API clients", active: false },
  { label: "Close account", active: false },
];

export default function UserMetaCard() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const { user, tokens, setUser } = useAuthStore();

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !tokens?.accessToken) return;

    try {
      setUploading(true);
      const updatedUser = await userService.uploadAvatar(
        tokens.accessToken,
        file,
      );
      setUser(updatedUser);
    } catch (error) {
      console.error("Upload avatar thất bại:", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const displayName = user?.fullName ?? "Người dùng";
  const initials =
    user?.fullName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase() ?? "U";

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderRight: { xs: "none", md: "1px solid #e0e0e0" },
        minHeight: "100%",
        pt: 3,
      }}
    >
      {/* User Avatar & Name */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
          px: 2,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={user?.avatarUrl}
            alt={displayName}
            sx={{
              width: 80,
              height: 80,
              mb: 2,
              bgcolor: "#2d2f31",
              fontSize: "2rem",
            }}
          >
            {initials}
          </Avatar>
          <IconButton
            size="small"
            onClick={handleAvatarClick}
            sx={{
              position: "absolute",
              bottom: 4,
              right: -4,
              bgcolor: "white",
              boxShadow: 1,
              "&:hover": { bgcolor: "#f0f0f0" },
            }}
          >
            {uploading ? (
              <CircularProgress size={16} />
            ) : (
              <PhotoCamera fontSize="small" />
            )}
          </IconButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </Box>
        <Typography variant="subtitle1" fontWeight={600}>
          {displayName}
        </Typography>
      </Box>

      {/* Menu List */}
      <List component="nav" sx={{ px: 0 }}>
        {menuItems.map((item, index) => (
          <ListItemButton
            key={index}
            sx={{
              bgcolor: item.active ? "#e8e5ff" : "transparent",
              borderLeft: item.active
                ? "4px solid #3b82f6"
                : "4px solid transparent",
              "&:hover": {
                bgcolor: item.active ? "#e8e5ff" : "#f7f9fa",
              },
              py: 1.5,
              px: 3,
            }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: "0.95rem",
                color: item.active ? "#3b82f6" : "#2d2f31",
                fontWeight: item.active ? 600 : 400,
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
