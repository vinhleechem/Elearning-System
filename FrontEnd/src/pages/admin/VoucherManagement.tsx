import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
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
    <Box sx={{ p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Quản lý Voucher
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Tạo và quản lý mã giảm giá cho khóa học
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
              },
            }}
          >
            Tạo Voucher
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 3,
          mb: 3,
        }}
      >
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
                  Tổng Voucher
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {vouchers.length}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CardGiftcard fontSize="large" />
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card
          sx={{
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "white",
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Đang Hoạt Động
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {vouchers.filter((v) => v.isActive).length}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle fontSize="large" />
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card
          sx={{
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            color: "white",
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Voucher Công Khai
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {vouchers.filter((v) => v.voucherType === "PUBLIC").length}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CardGiftcard fontSize="large" />
              </Box>
            </Stack>
          </CardContent>
        </Card>
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
                  Lượt Sử Dụng
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0)}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle fontSize="large" />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          label="Tìm kiếm"
          placeholder="Tìm kiếm theo mã hoặc tên voucher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          size="small"
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.light" }}>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                Mã Voucher
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                Tên
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                Loại
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                Giảm Giá
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                Thời Gian
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                Sử Dụng
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                Trạng Thái
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "primary.main" }}>
                Hành Động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredVouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    No vouchers found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredVouchers.map((voucher) => (
                <TableRow key={voucher.voucherId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {voucher.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{voucher.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
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
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
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
                    <Typography variant="caption" display="block">
                      {new Date(voucher.endDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {voucher.usedCount || 0} /{" "}
                      {voucher.totalUsageLimit || "∞"}
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        bgcolor: "grey.200",
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
                      icon={voucher.isActive ? <CheckCircle /> : <Cancel />}
                      label={voucher.isActive ? "Active" : "Inactive"}
                      color={voucher.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Grant to Users">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => {
                            setGrantVoucherId(voucher.voucherId);
                            setOpenGrantDialog(true);
                          }}
                        >
                          <Send />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(voucher)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setItemToDelete(voucher.voucherId);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Delete />
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Edit Voucher" : "Create Voucher"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
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
              />
              <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
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
                >
                  <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                  <MenuItem value="FIXED">Fixed Amount</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
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
              />
              <TextField
                label="Max Discount (optional)"
                type="number"
                fullWidth
                value={formData.maxDiscountAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDiscountAmount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
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
              />
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
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
              />
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
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
              >
                <MenuItem value="ALL">All Courses</MenuItem>
                <MenuItem value="SPECIFIC_COURSES">Specific Courses</MenuItem>
                <MenuItem value="INSTRUCTOR_COURSES">
                  Instructor Courses
                </MenuItem>
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
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grant Voucher Dialog */}
      <Dialog
        open={openGrantDialog}
        onClose={() => setOpenGrantDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Grant Voucher to Users</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter user IDs separated by commas (e.g., 1, 2, 3)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="1, 2, 3, 4, 5"
            value={grantUserIds}
            onChange={(e) => setGrantUserIds(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGrantDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGrantVoucher}
            variant="contained"
            startIcon={<Send />}
          >
            Grant Voucher
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this voucher?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoucherManagement;
