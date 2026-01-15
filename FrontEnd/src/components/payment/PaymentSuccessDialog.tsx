import { useRef, useEffect, useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import {
    Button,
    Dialog,
    DialogContent,
    Typography,
    Box,
    DialogTitle,
    IconButton,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

interface PaymentSuccessDialogProps {
    open: boolean;
    onClose: () => void;
}

const PaymentSuccessDialog = ({ open, onClose }: PaymentSuccessDialogProps) => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const navigate = useNavigate();
    const playerRef = useRef<Player>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Play lottie animation when dialog opens
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                playerRef.current?.play();
                setShowConfetti(true);
            }, 100);
        } else {
            setShowConfetti(false);
        }
    }, [open]);

    const handleGoToLearning = () => {
        onClose();
        navigate("/my-courses/learning");
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'flex-end', position: 'absolute', right: 0, top: 0, zIndex: 1 }}>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 5, textAlign: "center", position: "relative" }}>
                {/* Background decoration */}
                <Box
                    sx={{
                        position: "absolute",
                        top: -100,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 400,
                        height: 400,
                        background: "radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, rgba(255,255,255,0) 70%)",
                        zIndex: 0,
                    }}
                />

                <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                        <Player
                            ref={playerRef}
                            autoplay={false}
                            keepLastFrame
                            src="https://lottie.host/80516bd0-349f-4315-9c87-872f03f7e034/00c76x89yZ.json"
                            style={{ height: "180px", width: "180px" }}
                        />
                    </Box>

                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            background: "linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mb: 2,
                        }}
                    >
                        Thanh toán thành công!
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: "1.1rem" }}>
                        Cảm ơn bạn đã tin tưởng Vidi. <br />
                        Đơn hàng <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>#{orderId}</Box> của bạn đã được xác nhận.
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 300, mx: "auto" }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleGoToLearning}
                            sx={{
                                py: 1.5,
                                fontSize: "1rem",
                                fontWeight: 700,
                                borderRadius: 3,
                                textTransform: "none",
                                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                boxShadow: "0 4px 20px rgba(33, 150, 243, 0.3)",
                            }}
                        >
                            Vào học ngay
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={onClose} // Just close closes dialog, stays on home
                            sx={{
                                py: 1.5,
                                fontSize: "1rem",
                                fontWeight: 600,
                                borderRadius: 3,
                                textTransform: "none",
                                borderWidth: 2,
                                "&:hover": {
                                    borderWidth: 2,
                                }
                            }}
                        >
                            Tiếp tục xem trang chủ
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentSuccessDialog;
