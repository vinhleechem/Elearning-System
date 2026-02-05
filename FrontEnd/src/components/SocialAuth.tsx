import { Box, Divider, IconButton, Typography } from "@mui/material";
import { Facebook, Twitter, Google } from "@mui/icons-material";
import { useGoogleLogin } from "@react-oauth/google";
import { useToast } from "../hooks/useToast";
import { authService } from "../service/authService";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function SocialAuth() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { enqueueSnackbar } = useToast();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        const tokens = await authService.loginGoogle(codeResponse.code);
        const user = await authService.getProfile(tokens.accessToken);
        setAuth(tokens.accessToken, tokens.refreshToken, user);
        navigate("/");
      } catch (error) {
        enqueueSnackbar(
          `Đăng nhập Google thất bại: ${error instanceof Error ? error.message : "Unknown error"}`,
          { variant: "error" },
        );
      }
    },
    onError: (error) => {
      enqueueSnackbar("Đăng nhập Google thất bại. Vui lòng thử lại.", {
        variant: "error",
      });
    },
    flow: "auth-code",
    ux_mode: "popup",
  });

  const handleFacebookLogin = () => {
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    const redirectUri = `${window.location.origin}/auth/facebook/callback`;
    const scope = "email,public_profile";
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;

    window.location.href = authUrl;
  };

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
          onClick={handleFacebookLogin}
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
          onClick={() => handleGoogleLogin()}
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
