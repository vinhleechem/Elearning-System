import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Container,
    InputAdornment,
    IconButton,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    CheckCircle,
    Lock,
} from "@mui/icons-material";
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
    }, [token, enqueueSnackbar]);

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
        } catch (error: any) {
            enqueueSnackbar(
                error.message || "Đặt mật khẩu thất bại. Vui lòng thử lại",
                { variant: "error" }
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
                minHeight="100vh"
                bgcolor="grey.50"
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (!tokenValid) {
        return (
            <Container maxWidth="sm">
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="100vh"
                >
                    <Card
                        sx={{
                            p: 4,
                            width: "100%",
                            borderRadius: "20px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        }}
                    >
                        <Box textAlign="center">
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    bgcolor: "error.50",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 24px",
                                }}
                            >
                                <Lock sx={{ fontSize: 40, color: "error.main" }} />
                            </Box>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                Link không hợp lệ
                            </Typography>
                            <Typography variant="body1" color="text.secondary" mb={3}>
                                Link kích hoạt đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu
                                link mới từ quản trị viên.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate("/login")}
                                sx={{ borderRadius: "12px" }}
                            >
                                Quay về đăng nhập
                            </Button>
                        </Box>
                    </Card>
                </Box>
            </Container>
        );
    }

    if (success) {
        return (
            <Container maxWidth="sm">
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="100vh"
                >
                    <Card
                        sx={{
                            p: 4,
                            width: "100%",
                            borderRadius: "20px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        }}
                    >
                        <Box textAlign="center">
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    bgcolor: "success.50",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 24px",
                                }}
                            >
                                <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />
                            </Box>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                Thành công!
                            </Typography>
                            <Typography variant="body1" color="text.secondary" mb={3}>
                                Mật khẩu của bạn đã được đặt thành công. Bạn có thể đăng nhập
                                ngay bây giờ.
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                                Đang chuyển hướng đến trang đăng nhập...
                            </Typography>
                        </Box>
                    </Card>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                py={4}
            >
                <Card
                    sx={{
                        p: 4,
                        width: "100%",
                        borderRadius: "20px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    }}
                >
                    {/* Header */}
                    <Box textAlign="center" mb={4}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 24px",
                            }}
                        >
                            <Lock sx={{ fontSize: 40, color: "white" }} />
                        </Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Đặt mật khẩu
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Tạo mật khẩu mới cho tài khoản của bạn
                        </Typography>
                    </Box>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            <Alert severity="info" sx={{ borderRadius: "12px" }}>
                                Mật khẩu phải có ít nhất 8 ký tự
                            </Alert>

                            <TextField
                                label="Mật khẩu mới"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    sx: { borderRadius: "12px" },
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
                                label="Xác nhận mật khẩu"
                                type={showConfirmPassword ? "text" : "password"}
                                fullWidth
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                error={
                                    confirmPassword.length > 0 && password !== confirmPassword
                                }
                                helperText={
                                    confirmPassword.length > 0 && password !== confirmPassword
                                        ? "Mật khẩu không khớp"
                                        : ""
                                }
                                InputProps={{
                                    sx: { borderRadius: "12px" },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowConfirmPassword(!showConfirmPassword)
                                                }
                                                edge="end"
                                            >
                                                {showConfirmPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    borderRadius: "12px",
                                    py: 1.5,
                                    background:
                                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    "&:hover": {
                                        background:
                                            "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                                    },
                                }}
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
                                sx={{ borderRadius: "12px" }}
                            >
                                Quay về đăng nhập
                            </Button>
                        </Box>
                    </form>
                </Card>
            </Box>
        </Container>
    );
};

export default SetPasswordPage;
