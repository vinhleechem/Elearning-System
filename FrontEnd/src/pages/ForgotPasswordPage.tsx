import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useToast } from "../hooks/useToast";
import passwordResetService from "../service/passwordResetService";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useToast();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            enqueueSnackbar("Vui lòng nhập email", { variant: "error" });
            return;
        }

        setLoading(true);
        try {
            await passwordResetService.requestPasswordReset(email);
            setSuccess(true);
            enqueueSnackbar("Email đặt lại mật khẩu đã được gửi!", {
                variant: "success",
            });
        } catch (error: any) {
            enqueueSnackbar(
                error.message || "Gửi email thất bại. Vui lòng thử lại",
                { variant: "error" }
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div>
                <h2 className="mb-6 mt-6 text-2xl font-bold text-gray-900">
                    Email đã được gửi!
                </h2>
                <p className="mb-4 text-gray-700">
                    Chúng tôi đã gửi link đặt lại mật khẩu đến email{" "}
                    <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
                </p>
                <Alert severity="info" className="mb-4">
                    Link sẽ hết hạn sau 1 giờ. Nếu không thấy email, vui lòng kiểm tra thư mục spam.
                </Alert>
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

    return (
        <div>
            <h2 className="mb-6 mt-6 text-2xl font-bold text-gray-900">
                Quên mật khẩu?
            </h2>
            <p className="mb-4 text-sm text-gray-600">
                Nhập email của bạn để nhận link đặt lại mật khẩu
            </p>

            <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        label="Email *"
                        type="email"
                        fullWidth
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        className="!mt-3"
                    >
                        {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
                    </Button>

                    <Button
                        variant="text"
                        startIcon={<ArrowBack />}
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

export default ForgotPasswordPage;
