import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    Stack,
    Avatar,
    IconButton,
    Button,
    Chip,
    useTheme,
    alpha,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Paper,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
} from "@mui/icons-material";
import {
    conversationService,
    messageService,
    type ConversationResponse,
    type MessageResponse,
} from "../../service/conversationService";
import { useToast } from "../../hooks/useToast";
import { formatDate } from "../../libs/dateUtils";
import { useNavigate, useParams } from "react-router-dom";

const AdminConversationDetail = () => {
    const theme = useTheme();
    const { enqueueSnackbar } = useToast();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [conversation, setConversation] = useState<ConversationResponse | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageResponse | null>(null);

    const fetchConversationDetail = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const conversationData = await conversationService.getConversationDetail(Number(id));
            setConversation(conversationData);
            setLoading(false);
        } catch (error: any) {
            enqueueSnackbar(error.message || "Lỗi khi tải conversation", {
                variant: "error",
            });
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        if (!id) return;
        try {
            const response = await messageService.getMessages(Number(id), 0, 100);
            if (response && response.data) {
                setMessages(response.data);
            }
        } catch (error: any) {
            enqueueSnackbar(error.message || "Lỗi khi tải tin nhắn", {
                variant: "error",
            });
        }
    };

    useEffect(() => {
        fetchConversationDetail();
        fetchMessages();
    }, [id]);

    const handleLockToggle = async () => {
        if (!conversation) return;
        try {
            if (conversation.isLocked) {
                await conversationService.unlockConversation(conversation.conversationId);
                enqueueSnackbar("Đã mở khóa conversation", { variant: "success" });
            } else {
                await conversationService.lockConversation(conversation.conversationId);
                enqueueSnackbar("Đã khóa conversation", { variant: "success" });
            }
            fetchConversationDetail();
        } catch (error: any) {
            enqueueSnackbar(error.message || "Lỗi khi thay đổi trạng thái khóa", {
                variant: "error",
            });
        }
    };

    const handleDeleteClick = (message: MessageResponse) => {
        setSelectedMessage(message);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedMessage) return;
        try {
            await messageService.adminDeleteMessage(selectedMessage.messageId);
            enqueueSnackbar("Xóa tin nhắn thành công", { variant: "success" });
            setDeleteDialogOpen(false);
            fetchMessages();
        } catch (error: any) {
            enqueueSnackbar(error.message || "Lỗi khi xóa tin nhắn", {
                variant: "error",
            });
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!conversation) {
        return (
            <Box>
                <Typography variant="h6" color="text.secondary">
                    Không tìm thấy conversation
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 5 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={() => navigate("/admin/conversations")}>
                        <ArrowBackIcon />
                    </IconButton>
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
                            Chi Tiết Conversation #{conversation.conversationId}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Xem và quản lý tin nhắn
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant={conversation.isLocked ? "outlined" : "contained"}
                    color={conversation.isLocked ? "success" : "error"}
                    startIcon={conversation.isLocked ? <LockOpenIcon /> : <LockIcon />}
                    onClick={handleLockToggle}
                    sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 600,
                    }}
                >
                    {conversation.isLocked ? "Mở khóa" : "Khóa conversation"}
                </Button>
            </Box>

            {/* Conversation Info */}
            <Card
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: "20px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    border: "1px solid",
                    borderColor: "grey.100",
                }}
            >
                <Stack spacing={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={700}>
                            Thông Tin Conversation
                        </Typography>
                        {conversation.isLocked && (
                            <Chip label="Đã khóa" size="small" color="error" />
                        )}
                        {conversation.isArchived && (
                            <Chip label="Đã lưu trữ" size="small" color="default" />
                        )}
                    </Box>
                    <Divider />
                    <Stack direction="row" spacing={4}>
                        <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" mb={1}>
                                Học Viên
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={conversation.studentAvatar} alt={conversation.studentName}>
                                    {conversation.studentName.charAt(0)}
                                </Avatar>
                                <Typography variant="body1" fontWeight={600}>
                                    {conversation.studentName}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" mb={1}>
                                Giảng Viên
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    src={conversation.instructorAvatar}
                                    alt={conversation.instructorName}
                                >
                                    {conversation.instructorName.charAt(0)}
                                </Avatar>
                                <Typography variant="body1" fontWeight={600}>
                                    {conversation.instructorName}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" mb={1}>
                                Khóa Học
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                                {conversation.courseName}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={4}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Tin nhắn chưa đọc (Student)
                            </Typography>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                {conversation.studentUnreadCount}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Tin nhắn chưa đọc (Instructor)
                            </Typography>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                {conversation.instructorUnreadCount}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Ngày tạo
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                                {formatDate(conversation.createdAt)}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Card>

            {/* Messages */}
            <Card
                sx={{
                    borderRadius: "20px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    border: "1px solid",
                    borderColor: "grey.100",
                    overflow: "hidden",
                }}
            >
                <Box sx={{ p: 3, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "grey.100" }}>
                    <Typography variant="h6" fontWeight={700}>
                        Lịch Sử Tin Nhắn ({messages.length})
                    </Typography>
                </Box>

                <Box sx={{ p: 3, maxHeight: "600px", overflowY: "auto" }}>
                    {messages.length === 0 ? (
                        <Box textAlign="center" py={8}>
                            <Typography variant="body2" color="text.secondary">
                                Chưa có tin nhắn nào
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {messages.map((message) => (
                                <Paper
                                    key={message.messageId}
                                    sx={{
                                        p: 2,
                                        bgcolor:
                                            message.senderType === "STUDENT"
                                                ? alpha(theme.palette.primary.main, 0.05)
                                                : alpha(theme.palette.success.main, 0.05),
                                        border: "1px solid",
                                        borderColor:
                                            message.senderType === "STUDENT"
                                                ? alpha(theme.palette.primary.main, 0.1)
                                                : alpha(theme.palette.success.main, 0.1),
                                        borderRadius: "12px",
                                        position: "relative",
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <Avatar src={message.senderAvatar} alt={message.senderName}>
                                            {message.senderName.charAt(0)}
                                        </Avatar>
                                        <Box flex={1}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {message.senderName}
                                                </Typography>
                                                <Chip
                                                    label={message.senderType}
                                                    size="small"
                                                    color={message.senderType === "STUDENT" ? "primary" : "success"}
                                                    sx={{ height: 20, fontSize: 10 }}
                                                />
                                                {message.isRead && (
                                                    <Chip
                                                        label="Đã đọc"
                                                        size="small"
                                                        color="default"
                                                        sx={{ height: 20, fontSize: 10 }}
                                                    />
                                                )}
                                            </Stack>
                                            <Typography variant="body1" mb={1}>
                                                {message.content}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(message.createdAt)}
                                                {message.readAt && ` • Đã đọc lúc ${formatDate(message.readAt)}`}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteClick(message)}
                                            sx={{
                                                color: "error.main",
                                                "&:hover": {
                                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                                },
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Card>

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
                        Xác Nhận Xóa Tin Nhắn
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Bạn có chắc chắn muốn xóa tin nhắn này không? Hành động này không thể hoàn tác.
                    </Typography>
                    {selectedMessage && (
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: "grey.50",
                                borderRadius: "12px",
                                border: "1px solid",
                                borderColor: "grey.200",
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" mb={0.5}>
                                Nội dung:
                            </Typography>
                            <Typography variant="body1">{selectedMessage.content}</Typography>
                        </Box>
                    )}
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
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminConversationDetail;
