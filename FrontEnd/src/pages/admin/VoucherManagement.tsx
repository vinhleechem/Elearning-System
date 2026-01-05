import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  MenuItem,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  Select,
  InputLabel,
  FormControl,
  Grid,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  CardGiftcard,
  Search,
  CheckCircle,
  Cancel,
  Send,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { voucherService } from "../../service/voucherService";
import type {
  Voucher,
  VoucherRequest,
  VoucherType,
  DiscountType,
  VoucherApplicability,
} from "../../types/voucher";

const VoucherManagement = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGrantDialog, setOpenGrantDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page] = useState(0);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [grantVoucherId, setGrantVoucherId] = useState<number | null>(null);
  const [grantUserIds, setGrantUserIds] = useState<string>("");

  const [formData, setFormData] = useState<VoucherRequest>({
    code: "",
    name: "",
    description: "",
    voucherType: "PUBLIC" as VoucherType,
    discountType: "PERCENTAGE" as DiscountType,
    discountValue: 0,
    maxDiscountAmount: undefined,
    minOrderValue: 0,
    totalUsageLimit: 100,
    perUserLimit: 1,
    startDate: "",
    endDate: "",
    isActive: true,
    applicableTo: "ALL" as VoucherApplicability,
    specificCourseIds: [],
    instructorId: undefined,
  });

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await voucherService.getAllVouchers(page, 10);
      setVouchers(response.content);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      enqueueSnackbar("Failed to fetch vouchers", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, enqueueSnackbar]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleOpenDialog = (voucher?: Voucher) => {
    if (voucher) {
      setEditingId(voucher.voucherId);
      setFormData({
        code: voucher.code,
        name: voucher.name,
        description: voucher.description || "",
        voucherType: voucher.voucherType,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxDiscountAmount: voucher.maxDiscountAmount,
        minOrderValue: voucher.minOrderValue,
        totalUsageLimit: voucher.totalUsageLimit || 100,
        perUserLimit: voucher.perUserLimit,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        isActive: voucher.isActive,
        applicableTo: voucher.applicableTo,
        specificCourseIds: voucher.specificCourseIds || [],
        instructorId: voucher.instructorId,
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        name: "",
        description: "",
        voucherType: "PUBLIC" as VoucherType,
        discountType: "PERCENTAGE" as DiscountType,
        discountValue: 0,
        maxDiscountAmount: undefined,
        minOrderValue: 0,
        totalUsageLimit: 100,
        perUserLimit: 1,
        startDate: "",
        endDate: "",
        isActive: true,
        applicableTo: "ALL" as VoucherApplicability,
        specificCourseIds: [],
        instructorId: undefined,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await voucherService.updateVoucher(editingId, formData);
        enqueueSnackbar("Voucher updated successfully", { variant: "success" });
      } else {
        await voucherService.createVoucher(formData);
        enqueueSnackbar("Voucher created successfully", { variant: "success" });
      }
      handleCloseDialog();
      fetchVouchers();
    } catch (error) {
      enqueueSnackbar("Failed to save voucher", {
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await voucherService.deleteVoucher(itemToDelete);
      enqueueSnackbar("Voucher deleted successfully", { variant: "success" });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchVouchers();
    } catch (error) {
      enqueueSnackbar("Failed to delete voucher", {
        variant: "error",
      });
    }
  };

  const handleGrantVoucher = async () => {
    if (!grantVoucherId || !grantUserIds.trim()) return;
    try {
      const userIds = grantUserIds
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
      await voucherService.grantVoucherToUsers(grantVoucherId, userIds);
      enqueueSnackbar(`Voucher granted to ${userIds.length} users`, {
        variant: "success",
      });
      setOpenGrantDialog(false);
      setGrantVoucherId(null);
      setGrantUserIds("");
    } catch (error) {
      enqueueSnackbar("Failed to grant voucher", { variant: "error" });
    }
  };

  const filteredVouchers = vouchers.filter(
    (voucher) =>
      voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getUsagePercentage = (voucher: Voucher) => {
    if (!voucher.totalUsageLimit) return 0;
    return ((voucher.usedCount || 0) / voucher.totalUsageLimit) * 100;
  };

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header Section */}
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
            Quản lý Voucher
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tạo và quản lý mã giảm giá cho khóa học
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
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
          Tạo Voucher
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            label: "Tổng Voucher",
            value: vouchers.length,
            color: "#2563eb",
            icon: <CardGiftcard />,
          },
          {
            label: "Đang Hoạt Động",
            value: vouchers.filter((v) => v.isActive).length,
            color: "#10b981",
            icon: <CheckCircle />,
          },
          {
            label: "Voucher Công Khai",
            value: vouchers.filter((v) => v.voucherType === "PUBLIC").length,
            color: "#e11d48", // Rose Red
            icon: <CardGiftcard />,
          },
          {
            label: "Lượt Sử Dụng",
            value: vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0),
            color: "#f59e0b", // Amber
            icon: <CheckCircle />,
          },
        ].map((stat, index) => (
          <Grid size={{ xs: 12, md: 3 }} key={index}>
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
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã hoặc tên voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "12px",
                bgcolor: "grey.50",
                "& fieldset": { border: "none" },
                "&:hover": { bgcolor: "grey.100" },
                "&.Mui-focused": {
                  bgcolor: "white",
                  boxShadow:
                    "0 0 0 2px " + alpha(theme.palette.primary.main, 0.2),
                },
              },
            }}
          />
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Mã Voucher</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tên</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Giảm Giá</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Thời Gian</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sử Dụng</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng Thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredVouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Không có voucher nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVouchers.map((voucher) => (
                  <TableRow
                    key={voucher.voucherId}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={voucher.code}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: "6px" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {voucher.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {voucher.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={voucher.voucherType}
                        size="small"
                        color={
                          voucher.voucherType === "PUBLIC" ? "success" : "info"
                        }
                        variant="outlined"
                        sx={{
                          bgcolor: alpha(voucher.voucherType === "PUBLIC" ? theme.palette.success.main : theme.palette.info.main, 0.1),
                          color: voucher.voucherType === "PUBLIC" ? "success.main" : "info.main",
                          fontWeight: 500,
                          borderRadius: "6px",
                          border: "none"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {voucher.discountType === "PERCENTAGE"
                          ? `${voucher.discountValue}%`
                          : `$${voucher.discountValue}`}
                      </Typography>
                      {voucher.maxDiscountAmount && (
                        <Typography variant="caption" color="text.secondary">
                          Max: ${voucher.maxDiscountAmount}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {new Date(voucher.startDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {new Date(voucher.endDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {voucher.usedCount || 0} /{" "}
                          {voucher.totalUsageLimit || "∞"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: "100%",
                          bgcolor: "grey.100",
                          borderRadius: 1,
                          height: 4,
                          mt: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: `${getUsagePercentage(voucher)}%`,
                            bgcolor: "primary.main",
                            height: "100%",
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={voucher.isActive ? <CheckCircle sx={{ fontSize: 16 }} /> : <Cancel sx={{ fontSize: 16 }} />}
                        label={voucher.isActive ? "Active" : "Inactive"}
                        color={voucher.isActive ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        <Tooltip title="Cấp cho người dùng">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => {
                              setGrantVoucherId(voucher.voucherId);
                              setOpenGrantDialog(true);
                            }}
                          >
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(voucher)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setItemToDelete(voucher.voucherId);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create/Edit Dialog */}
      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ p: 4, pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardGiftcard fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {editingId ? "Edit Voucher" : "Create New Voucher"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingId ? "Update existing voucher details" : "Add a new discount code"}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 2 }}>
          <Stack spacing={3}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Code"
                fullWidth
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., NEWYEAR2024"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">#</InputAdornment>
                  ),
                  sx: { borderRadius: "12px" },
                }}
              />
              <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Box>

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              InputProps={{ sx: { borderRadius: "12px" } }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Voucher Type</InputLabel>
                <Select
                  value={formData.voucherType}
                  label="Voucher Type"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      voucherType: e.target.value as VoucherType,
                    })
                  }
                  sx={{ borderRadius: "12px" }}
                >
                  <MenuItem value="PUBLIC">Public</MenuItem>
                  <MenuItem value="PERSONAL">Personal</MenuItem>
                  <MenuItem value="REFERRAL">Referral</MenuItem>
                  <MenuItem value="BIRTHDAY">Birthday</MenuItem>
                  <MenuItem value="FIRST_ORDER">First Order</MenuItem>
                  <MenuItem value="LOYALTY">Loyalty</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.discountType}
                  label="Discount Type"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value as DiscountType,
                    })
                  }
                  sx={{ borderRadius: "12px" }}
                >
                  <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                  <MenuItem value="FIXED">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Discount Value"
                type="number"
                fullWidth
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountValue: parseFloat(e.target.value),
                  })
                }
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
              <TextField
                label="Max Discount"
                type="number"
                fullWidth
                placeholder="Optional"
                value={formData.maxDiscountAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDiscountAmount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
              <TextField
                label="Min Order Value"
                type="number"
                fullWidth
                value={formData.minOrderValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minOrderValue: parseFloat(e.target.value) || 0,
                  })
                }
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Total Usage Limit"
                type="number"
                fullWidth
                value={formData.totalUsageLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalUsageLimit: parseInt(e.target.value),
                  })
                }
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
              <TextField
                label="Per User Limit"
                type="number"
                fullWidth
                value={formData.perUserLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    perUserLimit: parseInt(e.target.value),
                  })
                }
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Start Date"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
              <TextField
                label="End Date"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Applicable To</InputLabel>
              <Select
                value={formData.applicableTo}
                label="Applicable To"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicableTo: e.target.value as VoucherApplicability,
                  })
                }
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="ALL">All Courses</MenuItem>
                <MenuItem value="SPECIFIC_COURSES">Specific Courses</MenuItem>
                <MenuItem value="INSTRUCTOR_COURSES">Instructor Courses</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.3)",
            }}
          >
            {editingId ? "Update Voucher" : "Create Voucher"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grant Voucher Dialog */}
      <Dialog
        open={openGrantDialog}
        onClose={() => setOpenGrantDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: "info.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Grant Voucher
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter user IDs separated by commas to grant this voucher directly to them.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="e.g. 101, 102, 103"
            value={grantUserIds}
            onChange={(e) => setGrantUserIds(e.target.value)}
            InputProps={{ sx: { borderRadius: "12px" } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenGrantDialog(false)}
            sx={{ borderRadius: "10px", color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGrantVoucher}
            variant="contained"
            color="info"
            disabled={loading}
            startIcon={<Send />}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
          >
            Grant Voucher
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
            padding: 1,
            maxWidth: "400px"
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: "error.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Delete fontSize="large" />
          </Box>
          <Typography variant="h6" fontWeight={800}>
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography color="text.secondary">
            Are you sure you want to delete this voucher? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, border: "1px solid #e2e8f0" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.4)" }}
          >
            Delete Voucher
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoucherManagement;
