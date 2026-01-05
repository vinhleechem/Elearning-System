import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Stack,
    TextField,
    InputAdornment,
    Pagination,
    Rating,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    useTheme,
    alpha,
    CircularProgress,
    Grid,
} from "@mui/material";
import {
    Search as SearchIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Star as StarIcon,
    RateReview as RateReviewIcon,
} from "@mui/icons-material";
import { reviewService, type ReviewResponse } from "../../service/reviewService";
import { useSnackbar } from "notistack";

const ReviewManagement = () => {
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        fiveStars: 0,
        oneStars: 0,
    });

    const fetchReviews = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual admin endpoint when available
            // For now, we'll need to fetch reviews by course or implement admin endpoint
            enqueueSnackbar("Chức năng đang được phát triển", { variant: "info" });
            setLoading(false);
        } catch (error: any) {
            enqueueSnackbar(error.message || "Lỗi khi tải đánh giá", {
                variant: "error",
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page, searchTerm]);

    const handleDeleteClick = (review: ReviewResponse) => {
        setSelectedReview(review);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedReview) return;

        try {
            await reviewService.deleteReview(selectedReview.reviewId);
            enqueueSnackbar("Xóa đánh giá thành công", { variant: "success" });
            setDeleteDialogOpen(false);
            fetchReviews();
        } catch (error: any) {
            enqueueSnackbar(error.message || "Lỗi khi xóa đánh giá", {
                variant: "error",
            });
        }
    };

    const handleViewClick = (review: ReviewResponse) => {
        setSelectedReview(review);
        setViewDialogOpen(true);
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return "success";
        if (rating >= 3) return "warning";
        return "error";
    };

    return (
        <Box sx={{ pb: 5 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight="800"
                        sx={{
                            background: "linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mb: 1,
                        }}
                    >
                        Quản Lý Đánh Giá
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Quản lý và theo dõi đánh giá của học viên
                    </Typography>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                {[
                    {
                        label: "Tổng Đánh Giá",
                        value: stats.totalReviews.toLocaleString(),
                        subtext: "Tất cả khóa học",
                        color: "#2563eb",
                        icon: <RateReviewIcon />,
                    },
                    {
                        label: "Đánh Giá Trung Bình",
                        value: stats.averageRating.toFixed(1),
                        subtext: "Trên 5 sao",
                        color: "#f59e0b",
                        icon: <StarIcon />,
                    },
                    {
                        label: "5 Sao",
                        value: stats.fiveStars.toLocaleString(),
                        subtext: "Đánh giá xuất sắc",
                        color: "#10b981",
                        icon: <StarIcon />,
                    },
                    {
                        label: "1 Sao",
                        value: stats.oneStars.toLocaleString(),
                        subtext: "Cần cải thiện",
                        color: "#ef4444",
                        icon: <StarIcon />,
                    },
                ].map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card
                            sx={{
                                borderRadius: "16px",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                                border: "1px solid",
                                borderColor: "grey.100",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                                },
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: "12px",
                                            bgcolor: alpha(stat.color, 0.1),
                                            color: stat.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                    <Box flex={1}>
                                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                                            {stat.label}
                                        </Typography>
                                        <Typography variant="h5" fontWeight="700" mb={0.5}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {stat.subtext}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Search Bar */}
            <Card sx={{ p: 3, mb: 3, borderRadius: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1px solid", borderColor: "grey.100" }}>
                <TextField
                    fullWidth
                    placeholder="Tìm kiếm theo tên học viên, khóa học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "grey.500" }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            bgcolor: "grey.50",
                            "& fieldset": {
                                border: "none",
                            },
                            "&:hover": {
                                bgcolor: "grey.100",
                            },
                            "&.Mui-focused": {
                                bgcolor: "white",
                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                        },
                    }}
                />
            </Card>

            {/* Reviews Table */}
            <Card sx={{ borderRadius: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1px solid", borderColor: "grey.100" }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Học Viên</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Khóa Học</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Đánh Giá</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Bình Luận</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Ngày Tạo</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }} align="center">
                                    Thao Tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : reviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Chưa có đánh giá nào
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reviews.map((review) => (
                                    <TableRow
                                        key={review.reviewId}
                                        sx={{
                                            "&:hover": {
                                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar src={review.userAvatar} alt={review.userName}>
                                                    {review.userName.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {review.userName}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                {review.courseTitle}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Rating value={review.rating} readOnly size="small" />
                                                <Chip
                                                    label={review.rating}
                                                    size="small"
                                                    color={getRatingColor(review.rating) as any}
                                                    sx={{ height: 20, fontSize: 10, borderRadius: "6px" }}
                                                />
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    maxWidth: 300,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {review.comment || "Không có bình luận"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewClick(review)}
                                                    sx={{
                                                        color: "primary.main",
                                                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                                                    }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteClick(review)}
                                                    sx={{
                                                        color: "error.main",
                                                        "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.1) },
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
                        <Pagination
                            count={totalPages}
                            page={page + 1}
                            onChange={(_, value) => setPage(value - 1)}
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                )}
            </Card>

            {/* View Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "20px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    },
                }}
            >
                <DialogTitle sx={{ pb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Chi Tiết Đánh Giá
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {selectedReview && (
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" mb={1}>
                                    Học Viên
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar src={selectedReview.userAvatar} alt={selectedReview.userName}>
                                        {selectedReview.userName.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body1" fontWeight={600}>
                                        {selectedReview.userName}
                                    </Typography>
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary" mb={1}>
                                    Khóa Học
                                </Typography>
                                <Typography variant="body1">{selectedReview.courseTitle}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary" mb={1}>
                                    Đánh Giá
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Rating value={selectedReview.rating} readOnly />
                                    <Typography variant="body1" fontWeight={600}>
                                        {selectedReview.rating}/5
                                    </Typography>
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary" mb={1}>
                                    Bình Luận
                                </Typography>
                                <Typography variant="body1">
                                    {selectedReview.comment || "Không có bình luận"}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary" mb={1}>
                                    Ngày Tạo
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedReview.createdAt).toLocaleString("vi-VN")}
                                </Typography>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={() => setViewDialogOpen(false)}
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: "20px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    },
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight={700}>
                        Xác Nhận Xóa
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReviewManagement;
