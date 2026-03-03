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
    Avatar,
    useTheme,
    alpha,
    CircularProgress,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Tooltip,
} from "@mui/material";
import {
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
    Chat as ChatIcon,
    Archive as ArchiveIcon,
} from "@mui/icons-material";
import {
    conversationService,
    type ConversationResponse,
} from "../../service/conversationService";
import { useToast } from "../../hooks/useToast";
import { formatDate } from "../../libs/dateUtils";
import { useNavigate } from "react-router-dom";

const AdminConversationList = () => {
    const theme = useTheme();
    const { enqueueSnackbar } = useToast();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLocked, setFilterLocked] = useState<boolean | null>(null);
    const [filterArchived, setFilterArchived] = useState<boolean | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Stats
    const [stats, setStats] = useState({
        totalConversations: 0,
        activeConversations: 0,
        lockedConversations: 0,
        archivedConversations: 0,
    });

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const response = await conversationService.getAllConversations(
                page,
                10,
                {
                    keyword: searchTerm || undefined,
                    isLocked: filterLocked ?? undefined,
                    isArchived: filterArchived ?? undefined,
                }
            );

            if (response && response.data && response.pagination) {
                setConversations(response.data);
                setTotalPages(response.pagination.totalPages);

                // Calculate stats
                const total = response.pagination.totalElements;
                const locked = response.data.filter((c) => c.isLocked).length;
                const archived = response.data.filter((c) => c.isArchived).length;
                const active = response.data.filter((c) => !c.isLocked && !c.isArchived).length;

                setStats({
                    totalConversations: total,
                    activeConversations: active,
                    lockedConversations: locked,
                    archivedConversations: archived,
                });
            } else {
                setConversations([]);
                setTotalPages(0);
                setStats({
                    totalConversations: 0,
                    activeConversations: 0,
                    lockedConversations: 0,
                    archivedConversations: 0,
                });
            }

            setLoading(false);
        } catch (error: any) {
            enqueueSnackbar(error.message || "Lỗi khi tải conversations", {
                variant: "error",
            });
            setConversations([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [page, searchTerm, filterLocked, filterArchived]);

    const handleLockToggle = async (conversation: ConversationResponse) => {
        try {
            if (conversation.isLocked) {
                await conversationService.unlockConversation(conversation.conversationId);
                enqueueSnackbar("Đã mở khóa conversation", { variant: "success" });
            } else {
                await conversationService.lockConversation(conversation.conversationId);
                enqueueSnackbar("Đã khóa conversation", { variant: "success" });
            }
            fetchConversations();
        } catch (error: any) {
            enqueueSnackbar(error.message || "Lỗi khi thay đổi trạng thái khóa", {
                variant: "error",
            });
        }
    };

    const handleViewDetail = (conversationId: number) => {
        navigate(`/admin/conversations/${conversationId}`);
    };

    const getStatusChip = (conversation: ConversationResponse) => {
        if (conversation.isLocked) {
            return <Chip label="Đã khóa" size="small" color="error" />;
        }
        if (conversation.isArchived) {
            return <Chip label="Đã lưu trữ" size="small" color="default" />;
        }
        return <Chip label="Hoạt động" size="small" color="success" />;
    };

    return (
        <Box sx={{ pb: 5 }}>
            {/* Header */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
            >
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
                        Quản Lý Conversations
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Quản lý và theo dõi cuộc trò chuyện giữa học viên và giảng viên
                    </Typography>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                {[
                    {
                        label: "Tổng Conversations",
                        value: stats.totalConversations.toLocaleString(),
                        subtext: "Tất cả cuộc trò chuyện",
                        color: "#2563eb",
                        icon: <ChatIcon />,
                    },
                    {
                        label: "Đang Hoạt Động",
                        value: stats.activeConversations.toLocaleString(),
                        subtext: "Conversations hoạt động",
                        color: "#10b981",
                        icon: <ChatIcon />,
                    },
                    {
                        label: "Đã Khóa",
                        value: stats.lockedConversations.toLocaleString(),
                        subtext: "Conversations bị khóa",
                        color: "#ef4444",
                        icon: <LockIcon />,
                    },
                    {
                        label: "Đã Lưu Trữ",
                        value: stats.archivedConversations.toLocaleString(),
                        subtext: "Conversations lưu trữ",
                        color: "#f59e0b",
                        icon: <ArchiveIcon />,
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

            {/* Search and Filters */}
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
                <Grid container spacing={2}>
                    {/* Search */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm theo tên học viên, giảng viên, khóa học..."
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
                    </Grid>

                    {/* Locked Filter */}
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Khóa</InputLabel>
                            <Select
                                value={filterLocked === null ? "" : filterLocked.toString()}
                                onChange={(e) =>
                                    setFilterLocked(
                                        e.target.value === "" ? null : e.target.value === "true"
                                    )
                                }
                                label="Khóa"
                                sx={{
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
                                }}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="false">Không khóa</MenuItem>
                                <MenuItem value="true">Đã khóa</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Archived Filter */}
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Lưu trữ</InputLabel>
                            <Select
                                value={filterArchived === null ? "" : filterArchived.toString()}
                                onChange={(e) =>
                                    setFilterArchived(
                                        e.target.value === "" ? null : e.target.value === "true"
                                    )
                                }
                                label="Lưu trữ"
                                sx={{
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
                                }}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="false">Chưa lưu trữ</MenuItem>
                                <MenuItem value="true">Đã lưu trữ</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Clear Filters Button */}
                    <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                                setSearchTerm("");
                                setFilterLocked(null);
                                setFilterArchived(null);
                            }}
                            sx={{
                                height: "56px",
                                borderRadius: "12px",
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Grid>
                </Grid>
            </Card>

            {/* Conversations Table */}
            <Card
                sx={{
                    borderRadius: "20px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    border: "1px solid",
                    borderColor: "grey.100",
                }}
            >
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                                    ID
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                                    Học Viên
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                                    Giảng Viên
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                                    Khóa Học
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                                    Tin Nhắn Cuối
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                                    Trạng Thái
                                </TableCell>
                                <TableCell
                                    sx={{ fontWeight: 700, color: "primary.main" }}
                                    align="center"
                                >
                                    Thao Tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : conversations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Chưa có conversation nào
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                conversations.map((conversation) => (
                                    <TableRow
                                        key={conversation.conversationId}
                                        sx={{
                                            "&:hover": {
                                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                #{conversation.conversationId}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    src={conversation.studentAvatar}
                                                    alt={conversation.studentName}
                                                >
                                                    {conversation.studentName.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {conversation.studentName}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    src={conversation.instructorAvatar}
                                                    alt={conversation.instructorName}
                                                >
                                                    {conversation.instructorName.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {conversation.instructorName}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                {conversation.courseName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    maxWidth: 200,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {conversation.lastMessageContent || "Chưa có tin nhắn"}
                                            </Typography>
                                            {conversation.lastMessageAt && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(conversation.lastMessageAt)}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{getStatusChip(conversation)}</TableCell>
                                        <TableCell align="center">
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                justifyContent="center"
                                            >
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            handleViewDetail(conversation.conversationId)
                                                        }
                                                        sx={{
                                                            color: "primary.main",
                                                            "&:hover": {
                                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                            },
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip
                                                    title={
                                                        conversation.isLocked ? "Mở khóa" : "Khóa conversation"
                                                    }
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleLockToggle(conversation)}
                                                        sx={{
                                                            color: conversation.isLocked
                                                                ? "success.main"
                                                                : "error.main",
                                                            "&:hover": {
                                                                bgcolor: alpha(
                                                                    conversation.isLocked
                                                                        ? theme.palette.success.main
                                                                        : theme.palette.error.main,
                                                                    0.1
                                                                ),
                                                            },
                                                        }}
                                                    >
                                                        {conversation.isLocked ? (
                                                            <LockOpenIcon fontSize="small" />
                                                        ) : (
                                                            <LockIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
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
        </Box>
    );
};

export default AdminConversationList;
