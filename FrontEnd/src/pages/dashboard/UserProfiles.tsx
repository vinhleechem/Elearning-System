import UserInfoCard from "../../components/userProfile/UserInfoCard";
import UserMetaCard from "../../components/userProfile/UserMetaCard";
import { Box, Typography } from "@mui/material";

export default function UserProfiles() {
  return (
    <Box sx={{ bgcolor: "#f7f9fa", minHeight: "100vh" }}>
      <Box
        sx={{ bgcolor: "#f7f9fa", py: 2, borderBottom: "1px solid #d1d7dc" }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
          <Typography variant="h5" fontWeight={700} color="#2d2f31">
            Hồ sơ cá nhân
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", gap: 1, mt: 0.5 }}
          >
            <Box
              component="span"
              sx={{ cursor: "pointer", "&:hover": { color: "#3b82f6" } }}
            >
              Home
            </Box>
            <Box component="span">›</Box>
            <Box component="span">Hồ sơ cá nhân</Box>
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box sx={{ maxWidth: 1200, width: "100%", display: "flex" }}>
          <Box sx={{ width: "300px", flexShrink: 0 }}>
            <UserMetaCard />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: "white",
              minHeight: "calc(100vh - 100px)",
            }}
          >
            <UserInfoCard />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
