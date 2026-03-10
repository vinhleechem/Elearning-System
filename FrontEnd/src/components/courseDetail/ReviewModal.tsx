import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Rating,
    TextField,
    Box,
    Typography,
    CircularProgress,
    IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { reviewService } from "../../service/reviewService";
import { useToast } from "../../hooks/useToast";

interface ReviewModalProps {
    open: boolean;
    onClose: () => void;
    courseId: number;
    onSuccess?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ open, onClose, courseId, onSuccess }) => {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useToast();

    const handleSubmit = async () => {
        if (rating === 0) {
            enqueueSnackbar("Vui lòng chọn số sao đánh giá", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);
            await reviewService.createReview({
                courseId,
                rating,
                comment,
            });
            enqueueSnackbar("Cảm ơn bạn đã đánh giá khóa học ^^", { variant: "success" });
            if (onSuccess) onSuccess();
            handleClose();
        } catch (error: any) {
            enqueueSnackbar(error.message || "Có lỗi xảy ra khi gửi đánh giá", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setComment("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                    Thêm đánh giá
                </Typography>
                <IconButton
                    onClick={handleClose}
                    sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3, pt: 2 }}>
                    <Typography variant="body1" fontWeight="medium" mb={1}>
                        Bạn đánh giá khóa học này mấy sao?
                    </Typography>
                    <Rating
                        name="course-rating"
                        value={rating}
                        onChange={(_, newValue) => {
                            setRating(newValue || 0);
                        }}
                        size="large"
                        sx={{ fontSize: "3rem" }}
                    />
                </Box>
                <TextField
                    label="Cảm nhận của bạn (Tùy chọn)"
                    multiline
                    rows={4}
                    fullWidth
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Hãy chia sẻ trải nghiệm học tập của bạn về khóa học này nhé..."
                    variant="outlined"
                    sx={{ mb: 1 }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} color="inherit" disabled={loading}>
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading || rating === 0}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    Gửi đánh giá
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReviewModal;
