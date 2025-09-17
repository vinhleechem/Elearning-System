import { Box, Divider, IconButton, Typography } from "@mui/material";
import { Facebook, Twitter, Google } from "@mui/icons-material";

export default function SocialAuth() {
  return (
    <Box>
      <Box my={3} display="flex" alignItems="center">
        <Divider sx={{ flexGrow: 1 }} />
        <Typography
          variant="body2"
          sx={{ mx: 2, color: "text.secondary", fontWeight: 500 }}
        >
          or
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>

      <Box display="flex" justifyContent="center" gap={3}>
        <IconButton
          sx={{
            bgcolor: "#e6eaf6",
            color: "#1877F2",

            borderRadius: 4,
            "&:hover": { bgcolor: "#d8deef" },
          }}
        >
          <Facebook fontSize="large" />
        </IconButton>

        <IconButton
          sx={{
            bgcolor: "#dff3ff",
            color: "#1DA1F2",

            borderRadius: 4,
            "&:hover": { bgcolor: "#c8e9ff" },
          }}
        >
          <Twitter fontSize="large" />
        </IconButton>

        <IconButton
          sx={{
            bgcolor: "#fce2e0",
            color: "#DB4437",
            borderRadius: 4,
            "&:hover": { bgcolor: "#f8d3d1" },
          }}
        >
          <Google fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
}
