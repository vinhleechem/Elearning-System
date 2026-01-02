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
  const { enqueueSnackbar } = useSnackbar();
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
    <Box sx={{ p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Quản lý Thông báo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gửi và quản lý thông báo đến người dùng
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Tổng thông báo
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {totalElements}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}>
                  <NotificationsIcon fontSize="large" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Chưa đọc
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {stats.unread}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}>
                  <UnreadIcon fontSize="large" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Đã đọc
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {stats.read}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}>
                  <CheckCircleIcon fontSize="large" />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters & Actions */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              placeholder="Tìm kiếm thông báo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="Tên người nhận"
              placeholder="Nhập tên..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={6} md={2.5}>
            <TextField
              fullWidth
              select
              label="Trạng thái"
              value={isRead}
              onChange={(e) => setIsRead(e.target.value)}
              size="small"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="false">Chưa đọc</MenuItem>
              <MenuItem value="true">Đã đọc</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchNotifications}
              fullWidth
              size="small"
            >
              Làm mới
            </Button>
          </Grid>
          <Grid item xs={6} md={2.5}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setOpenSendDialog(true)}
              fullWidth
              size="small"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                },
              }}
            >
              Gửi thông báo
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Notifications Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.light" }}>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Người nhận</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Loại</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Tiêu đề</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Nội dung</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>Thời gian</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "primary.main" }}>
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
                    <Typography variant="h6" color="text.secondary">
                      Không có thông báo nào
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => (
                <TableRow
                  key={notification.notificationId}
                  hover
                  sx={{
                    bgcolor: notification.isRead ? "transparent" : "action.hover",
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  <TableCell>{notification.notificationId}</TableCell>
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
                      sx={{ fontWeight: 600 }}
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
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(notification.createdAt).toLocaleString("vi-VN")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(notification.notificationId)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Send Notification Dialog */}
      <Dialog
        open={openSendDialog}
        onClose={() => setOpenSendDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SendIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
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
              onChange={(e) =>
                setSendForm({ ...sendForm, userId: e.target.value })
              }
              fullWidth
              required
              type="number"
            />
            <TextField
              select
              label="Loại thông báo"
              value={sendForm.type}
              onChange={(e) =>
                setSendForm({ ...sendForm, type: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="SYSTEM">SYSTEM</MenuItem>
              <MenuItem value="SUCCESS">SUCCESS</MenuItem>
              <MenuItem value="WARNING">WARNING</MenuItem>
              <MenuItem value="ERROR">ERROR</MenuItem>
            </TextField>
            <TextField
              label="Tiêu đề"
              value={sendForm.title}
              onChange={(e) =>
                setSendForm({ ...sendForm, title: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Nội dung"
              value={sendForm.message}
              onChange={(e) =>
                setSendForm({ ...sendForm, message: e.target.value })
              }
              fullWidth
              multiline
              rows={4}
              required
            />
            <TextField
              label="Link (không bắt buộc)"
              value={sendForm.link}
              onChange={(e) =>
                setSendForm({ ...sendForm, link: e.target.value })
              }
              fullWidth
              placeholder="/admin/courses"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenSendDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSendNotification}
            startIcon={<SendIcon />}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
