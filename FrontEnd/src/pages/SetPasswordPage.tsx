import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useToast } from "../hooks/useToast";
import passwordResetService from "../service/passwordResetService";

const SetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useToast();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        enqueueSnackbar("Token không hợp lệ", { variant: "error" });
        setValidating(false);
        return;
      }

      try {
        const isValid = await passwordResetService.validateToken(token);
        setTokenValid(isValid);
        if (!isValid) {
          enqueueSnackbar("Token đã hết hạn hoặc không hợp lệ", {
            variant: "error",
          });
        }
      } catch (error) {
        enqueueSnackbar("Không thể xác thực token", { variant: "error" });
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only re-run when token changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password.length < 8) {
      enqueueSnackbar("Mật khẩu phải có ít nhất 8 ký tự", {
        variant: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      enqueueSnackbar("Mật khẩu xác nhận không khớp", { variant: "error" });
      return;
    }

    if (!token) {
      enqueueSnackbar("Token không hợp lệ", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      await passwordResetService.setPassword({
        token,
        password,
        confirmPassword,
      });

      setSuccess(true);
      enqueueSnackbar("Đặt mật khẩu thành công!", { variant: "success" });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch {
      enqueueSnackbar(
        error.message || "Đặt mật khẩu thất bại. Vui lòng thử lại",
        { variant: "error" },
      );
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!tokenValid) {
    return (
      <div>
        <h2 className="mb-6 mt-6 text-2xl font-bold text-gray-900">
          Link không hợp lệ
        </h2>
        <p className="mb-4 text-gray-700">
          Link kích hoạt đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới
          từ quản trị viên.
        </p>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/login")}
          className="!mt-4"
        >
          Quay về đăng nhập
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div>
        <h2 className="mb-6 mt-6 text-2xl font-bold text-gray-900">
          Thành công!
        </h2>
        <p className="mb-4 text-gray-700">
          Mật khẩu của bạn đã được đặt thành công. Bạn có thể đăng nhập ngay bây
          giờ.
        </p>
        <p className="text-sm text-gray-500">
          Đang chuyển hướng đến trang đăng nhập...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 mt-6 text-2xl font-bold text-gray-900">
        Đặt mật khẩu
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Tạo mật khẩu mới cho tài khoản của bạn
      </p>

      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert severity="info">Mật khẩu phải có ít nhất 8 ký tự</Alert>

          <TextField
            label="Mật khẩu mới *"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Xác nhận mật khẩu *"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword.length > 0 && password !== confirmPassword}
            helperText={
              confirmPassword.length > 0 && password !== confirmPassword
                ? "Mật khẩu không khớp"
                : ""
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            className="!mt-3"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Đặt mật khẩu"
            )}
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/login")}
            sx={{ textTransform: "none" }}
          >
            Quay về đăng nhập
          </Button>
        </Box>
      </form>
    </div>
  );
};

export default SetPasswordPage;
