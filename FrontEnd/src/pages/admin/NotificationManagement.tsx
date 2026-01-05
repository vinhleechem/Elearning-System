import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Pagination,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnreadIcon,
} from "@mui/icons-material";
import { httpClient } from "../../service/httpClient";
import { useSnackbar } from "notistack";

interface Notification {
  notificationId: number;
  type: string;
  title: string;
  message: string;
  userId: number;
  userName?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  unread: number;
  read: number;
}

const NotificationManagement = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(12);
  const [totalElements, setTotalElements] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [isRead, setIsRead] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, read: 0 });
  const [sendForm, setSendForm] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
    userId: "",
    link: "",
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", (page - 1).toString());
      params.append("size", rowsPerPage.toString());
      if (userName) params.append("userName", userName);
      if (isRead !== "") params.append("isRead", isRead);

      const response = await httpClient<{
        data: Notification[];
        pagination: {
          totalElements: number;
        };
      }>(`/notifications/admin?${params.toString()}`);

      const data = response.data?.data || [];
      setNotifications(data);
      setTotalElements(response.data?.pagination?.totalElements || 0);

      // Calculate stats
      setStats({
        total: data.length,
        unread: data.filter((n) => !n.isRead).length,
        read: data.filter((n) => n.isRead).length,
      });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi khi tải danh sách thông báo", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, rowsPerPage, userName, isRead]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa thông báo này?")) return;

    try {
      await httpClient(`/notifications/admin/${id}`, { method: "DELETE" });
      enqueueSnackbar("Xóa thông báo thành công", { variant: "success" });
      fetchNotifications();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi khi xóa thông báo", {
        variant: "error",
      });
    }
  };

  const handleSendNotification = async () => {
    if (!sendForm.title || !sendForm.message || !sendForm.userId) {
      enqueueSnackbar("Vui lòng điền đầy đủ thông tin", { variant: "warning" });
      return;
    }

    try {
      await httpClient("/notifications/admin/send", {
        method: "POST",
        body: JSON.stringify({
          title: sendForm.title,
          message: sendForm.message,
          type: sendForm.type,
          userId: Number(sendForm.userId),
          link: sendForm.link || null,
        }),
      });
      enqueueSnackbar("Gửi thông báo thành công", { variant: "success" });
      setOpenSendDialog(false);
      setSendForm({
        title: "",
        message: "",
        type: "SYSTEM",
        userId: "",
        link: "",
      });
      fetchNotifications();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi khi gửi thông báo", {
        variant: "error",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SYSTEM":
        return "primary";
      case "SUCCESS":
        return "success";
      case "WARNING":
        return "warning";
      case "ERROR":
        return "error";
      default:
        return "default";
    }
  };

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalElements / rowsPerPage);

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
            Quản lý Thông báo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gửi và quản lý thông báo đến người dùng
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setOpenSendDialog(true)}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1.5,
            boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.3)",
            background: "linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)",
            "&:hover": {
              boxShadow: "0 6px 20px 0 rgba(37, 99, 235, 0.4)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          Gửi thông báo
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            label: "Tổng thông báo",
            value: totalElements,
            color: "#2563eb",
            icon: <NotificationsIcon />,
          },
          {
            label: "Chưa đọc",
            value: stats.unread,
            color: "#f59e0b",
            icon: <UnreadIcon />,
          },
          {
            label: "Đã đọc",
            value: stats.read,
            color: "#10b981",
            icon: <CheckCircleIcon />,
          },
        ].map((stat, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
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
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      display: "flex",
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" fontWeight="700">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Card */}
      <Card
        sx={{
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid",
          borderColor: "grey.100",
          overflow: "visible",
        }}
      >
        {/* Filter Toolbar */}
        <Box p={3} borderBottom="1px solid" borderColor="grey.100">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm thông báo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    bgcolor: "grey.50",
                    "& fieldset": { border: "none" },
                    "&:hover": { bgcolor: "grey.100" },
                    "&.Mui-focused": {
                      bgcolor: "white",
                      boxShadow: "0 0 0 2px " + alpha(theme.palette.primary.main, 0.2),
                    },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Tên người nhận..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                value={isRead}
                onChange={(e) => setIsRead(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="false">Chưa đọc</MenuItem>
                <MenuItem value="true">Đã đọc</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchNotifications}
                fullWidth
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  height: "100%",
                }}
              >
                Làm mới
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Người nhận</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Nội dung</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Stack spacing={2} alignItems="center">
                        <NotificationsIcon sx={{ fontSize: 64, color: "text.disabled" }} />
                        <Typography variant="body1" color="text.secondary">
                          Không có thông báo nào
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification) => (
                    <TableRow
                      key={notification.notificationId}
                      sx={{
                        bgcolor: notification.isRead ? "transparent" : alpha(theme.palette.primary.main, 0.02),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          #{notification.notificationId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {notification.userName || `User #${notification.userId}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={notification.type}
                          size="small"
                          color={getTypeColor(notification.type) as any}
                          sx={{ fontWeight: 500, borderRadius: "6px" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={notification.isRead ? 400 : 600}>
                          {notification.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {notification.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={notification.isRead ? <CheckCircleIcon /> : <UnreadIcon />}
                          label={notification.isRead ? "Đã đọc" : "Chưa đọc"}
                          size="small"
                          color={notification.isRead ? "default" : "primary"}
                          variant={notification.isRead ? "outlined" : "filled"}
                          sx={{ borderRadius: "6px" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(notification.createdAt).toLocaleString("vi-VN")}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Xóa thông báo">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(notification.notificationId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              borderTop: "1px solid",
              borderColor: "grey.100",
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Card>

      {/* Send Notification Dialog */}
      <Dialog
        open={openSendDialog}
        onClose={() => setOpenSendDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "20px", boxShadow: "0 4px 30px rgba(0,0,0,0.1)" },
        }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: "8px",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                display: "flex",
              }}
            >
              <SendIcon />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Gửi thông báo mới
            </Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label="User ID"
              value={sendForm.userId}
              onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
              fullWidth
              required
              type="number"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField
              select
              label="Loại thông báo"
              value={sendForm.type}
              onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            >
              <MenuItem value="SYSTEM">SYSTEM</MenuItem>
              <MenuItem value="SUCCESS">SUCCESS</MenuItem>
              <MenuItem value="WARNING">WARNING</MenuItem>
              <MenuItem value="ERROR">ERROR</MenuItem>
            </TextField>
            <TextField
              label="Tiêu đề"
              value={sendForm.title}
              onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
              fullWidth
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField
              label="Nội dung"
              value={sendForm.message}
              onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
              fullWidth
              multiline
              rows={4}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField
              label="Link (không bắt buộc)"
              value={sendForm.link}
              onChange={(e) => setSendForm({ ...sendForm, link: e.target.value })}
              fullWidth
              placeholder="/admin/courses"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenSendDialog(false)}
            variant="outlined"
            sx={{ borderRadius: "10px", textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSendNotification}
            startIcon={<SendIcon />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
              background: "linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)",
            }}
          >
            Gửi ngay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationManagement;
