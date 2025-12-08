import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { authService } from "../../service/authService";
import { useAuthStore } from "../../store/authStore";

export default function FacebookCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { enqueueSnackbar } = useSnackbar();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    const handleFacebookCallback = async () => {
      if (hasHandledRef.current) return;
      hasHandledRef.current = true;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        try {
          const tokens = await authService.loginFacebook(code);
          const user = await authService.getProfile(tokens.accessToken);
          setAuth(tokens.accessToken, tokens.refreshToken, user);
          navigate("/");
        } catch (error) {
          enqueueSnackbar("Đăng nhập Facebook thất bại. Vui lòng thử lại.", {
            variant: "error",
          });
          console.error("Facebook login failed:", error);
          navigate("/auth/login");
        }
      } else {
        console.error("No code found in URL");
        navigate("/auth/login");
      }
    };

    handleFacebookCallback();
  }, [navigate, setAuth]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="h6" color="text.secondary">
        Đang xử lý đăng nhập Facebook...
      </Typography>
    </Box>
  );
}
