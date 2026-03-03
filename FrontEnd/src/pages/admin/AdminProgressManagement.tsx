import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Pagination,
  Grid,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Search,
  Refresh,
  Edit,
  School,
  Person,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { adminProgressService } from "../../service/adminProgressService";
import type { AdminEnrollmentProgress } from "../../service/adminProgressService";
import { useToast } from "../../hooks/useToast";
import { formatDate } from "../../libs/dateUtils";

const AdminProgressManagement = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [rows, setRows] = useState<AdminEnrollmentProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<AdminEnrollmentProgress | null>(null);
  const [editProgress, setEditProgress] = useState<number>(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminProgressService.getEnrollments(page - 1, pageSize, {
        search,
      });
      setRows(res.data || []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch (error: any) {
      enqueueSnackbar(
        error?.message ||
          "Không thể tải danh sách enrollment. Hãy đảm bảo backend đã có API /admin/enrollments.",
        { variant: "error" },
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [page]);

  const handleOpenEdit = (row: AdminEnrollmentProgress) => {
    setEditing(row);
    setEditProgress(row.progress);
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await adminProgressService.updateEnrollmentProgress(
        editing.enrollmentId,
        editProgress,
      );
      enqueueSnackbar("Cập nhật tiến độ thành công", { variant: "success" });
      setEditing(null);
      void fetchData();
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Cập nhật tiến độ thất bại", {
        variant: "error",
      });
    }
  };

  const avgProgress =
    rows.length > 0
      ? Math.round(
          rows.reduce((sum, r) => sum + (r.progress || 0), 0) / rows.length,
        )
      : 0;

  const completedCount = rows.filter((r) => (r.progress || 0) >= 100).length;

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
            fontWeight={800}
            sx={{
              background: "linear-gradient(45deg, #0ea5e9 30%, #6366f1 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Quản lý tiến độ học tập
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Xem và điều chỉnh % hoàn thành khóa học của học viên
          </Typography>
        </Box>
        <IconButton
          onClick={() => {
            setPage(1);
            void fetchData();
          }}
          sx={{
            borderRadius: "12px",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            label: "Enrollment trong trang",
            value: rows.length,
            color: "#2563eb",
          },
          {
            label: "Tiến độ trung bình",
            value: `${avgProgress}%`,
            color: "#10b981",
            showProgress: true,
          },
          {
            label: "Hoàn thành 100%",
            value: completedCount,
            color: "#f59e0b",
          },
        ].map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                border: "1px solid",
                borderColor: "grey.100",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ color: stat.color, mt: 0.5 }}
                >
                  {stat.value}
                </Typography>
                {stat.showProgress && (
                  <Box mt={1}>
                    <LinearProgress
                      variant="determinate"
                      value={avgProgress}
                      sx={{ borderRadius: 999 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main card giống các trang admin khác */}
      <Card
        sx={{
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid",
          borderColor: "grey.100",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Search bar */}
          <Box mb={3}>
            <TextField
              fullWidth
              placeholder="Tìm theo tên khóa học, tên học viên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  void fetchData();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        setPage(1);
                        void fetchData();
                      }}
                    >
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "12px",
                  bgcolor: "grey.50",
                  "& fieldset": { border: "none" },
                  "&:hover": { bgcolor: "grey.100" },
                },
              }}
            />
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Enrollment ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Khóa học</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Học viên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày ghi danh</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tiến độ</TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 600 }}
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  rows.map((row) => (
                    <TableRow key={row.enrollmentId} hover>
                      <TableCell>#{row.enrollmentId}</TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column">
                          <Typography variant="body2" fontWeight={600}>
                            {row.courseTitle}
                          </Typography>
                          <Chip
                            size="small"
                            icon={<School fontSize="small" />}
                            label={`Course #${row.courseId}`}
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Person fontSize="small" />
                            <Typography variant="body2" fontWeight={600}>
                              {row.studentName}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {row.studentEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(row.enrolledAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column">
                          <Typography variant="body2" fontWeight={600}>
                            {Math.round(row.progress)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={row.progress}
                            sx={{ mt: 0.5, borderRadius: 999 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenEdit(row)}>
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Không có dữ liệu. Hãy đảm bảo backend đã hỗ trợ API cho
                        admin.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            p={2}
            display="flex"
            justifyContent="center"
            borderTop="1px solid"
            borderColor="grey.100"
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa tiến độ enrollment #{editing?.enrollmentId}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              {editing?.courseTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {editing?.studentName} - {editing?.studentEmail}
            </Typography>
            <Box mt={3}>
              <Typography variant="body2" gutterBottom>
                Tiến độ: {editProgress}%
              </Typography>
              <Slider
                value={editProgress}
                onChange={(_, value) => setEditProgress(value as number)}
                min={0}
                max={100}
                step={1}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProgressManagement;

