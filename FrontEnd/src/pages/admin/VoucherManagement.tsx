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
  CloudUpload,
  Send,
  PersonAdd,
} from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import { useToast } from "../../hooks/useToast";
import { voucherService } from "../../service/voucherService";
import {
  courseService,
  type PublicCourseResponse,
} from "../../service/courseService";
import {
  categoryService,
  type CategoryTreeResponse,
} from "../../service/categoryService";
import { formatCurrency } from "../../libs/utils";
import { formatDate } from "../../libs/dateUtils";
import type {
  Voucher,
  VoucherRequest,
  VoucherType,
  DiscountType,
  VoucherApplicability,
} from "../../types/voucher";
import { adminUserService } from "../../service/adminUserService";
import { useAuthStore } from "../../store/authStore";
import type { UserResponse } from "../../types/auth";

const VoucherManagement = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useToast();
  const { tokens } = useAuthStore();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [courses, setCourses] = useState<PublicCourseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGrantDialog, setOpenGrantDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [page] = useState(0);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [grantVoucherId, setGrantVoucherId] = useState<number | null>(null);
  const [grantUserIds, setGrantUserIds] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);

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
    applicableCourseIds: [],
    applicableCategoryIds: [],
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
  }, [page]); // Removed enqueueSnackbar from dependencies

  const fetchCourses = useCallback(async () => {
    try {
      const response = await courseService.getPublicCourses({
        page: 0,
        size: 1000,
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getCategoryTree();
      setCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!tokens?.accessToken) return;

    try {
      const response = await adminUserService.getUsers(tokens.accessToken, {
        page: 0,
        size: 1000,
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [tokens]);

  useEffect(() => {
    fetchVouchers();
    fetchCourses();
    fetchCategories();
    fetchUsers();
  }, [fetchVouchers, fetchCourses, fetchCategories, fetchUsers]);

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
        startDate: voucher.startDate ? voucher.startDate.slice(0, 16) : "",
        endDate: voucher.endDate ? voucher.endDate.slice(0, 16) : "",
        isActive: voucher.isActive,
        applicableTo: voucher.applicableTo,
        applicableCourseIds: voucher.applicableCourseIds || [],
        applicableCategoryIds: voucher.applicableCategoryIds || [],
        instructorId: voucher.instructorId,
      });
      setSelectedUsers([]); // Reset selected users when editing
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
        applicableCourseIds: [],
        applicableCategoryIds: [],
        instructorId: undefined,
      });
      setSelectedUsers([]); // Reset selected users for new voucher
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setSelectedUsers([]);
  };

  const handleSubmit = async () => {
    // Frontend validation
    if (!formData.code.trim()) {
      enqueueSnackbar("Voucher code is required", { variant: "warning" });
      return;
    }
    if (!formData.name.trim()) {
      enqueueSnackbar("Voucher name is required", { variant: "warning" });
      return;
    }
    if (formData.discountValue <= 0) {
      enqueueSnackbar("Discount value must be greater than 0", {
        variant: "warning",
      });
      return;
    }
    if (!formData.startDate) {
      enqueueSnackbar("Start date is required", { variant: "warning" });
      return;
    }
    if (!formData.endDate) {
      enqueueSnackbar("End date is required", { variant: "warning" });
      return;
    }
    if (formData.voucherType === "PERSONAL" && selectedUsers.length === 0) {
      enqueueSnackbar("Vui lòng chọn ít nhất 1 user cho voucher PERSONAL", {
        variant: "warning",
      });
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      enqueueSnackbar("End date must be after start date", {
        variant: "warning",
      });
      return;
    }

    try {
      if (editingId) {
        await voucherService.updateVoucher(editingId, formData);
        enqueueSnackbar("Voucher updated successfully", { variant: "success" });
      } else {
        const createdVoucher = await voucherService.createVoucher(formData);
        enqueueSnackbar("Voucher created successfully", { variant: "success" });

        // Auto-grant voucher to selected users if PERSONAL type
        if (formData.voucherType === "PERSONAL" && selectedUsers.length > 0) {
          try {
            await voucherService.grantVoucherToUsers(
              createdVoucher.voucherId,
              selectedUsers
            );
            enqueueSnackbar(
              `Voucher đã được grant cho ${selectedUsers.length} users`,
              { variant: "success" }
            );
          } catch (error) {
            enqueueSnackbar("Không thể grant voucher cho users", {
              variant: "error",
            });
          }
        }
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

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await voucherService.exportVouchers();
      enqueueSnackbar("Xuất danh sách voucher thành công", {
        variant: "success",
      });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Xuất Excel thất bại", {
        variant: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportExcel = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      await voucherService.importVouchers(file);
      enqueueSnackbar("Import voucher thành công", {
        variant: "success",
      });
      fetchVouchers();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Import thất bại", {
        variant: "error",
      });
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

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
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={
              isExporting ? <CircularProgress size={20} /> : <CloudUpload />
            }
            disabled={isExporting}
            onClick={handleExportExcel}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderColor: "#10b981",
              color: "#10b981",
              "&:hover": {
                borderColor: "#059669",
                bgcolor: alpha("#10b981", 0.04),
              },
            }}
          >
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button
            component="label"
            variant="outlined"
            startIcon={
              isImporting ? <CircularProgress size={20} /> : <CloudUpload />
            }
            disabled={isImporting}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderColor: "#2563eb",
              color: "#2563eb",
              "&:hover": {
                borderColor: "#1d4ed8",
                bgcolor: alpha("#2563eb", 0.04),
              },
            }}
          >
            {isImporting ? "Đang import..." : "Import Excel"}
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
            />
          </Button>
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
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mã Voucher</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tên</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Giảm Giá</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Thời Gian</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sử Dụng</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng Thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Hành Động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredVouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
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
                      <Typography variant="body2" color="text.secondary">
                        #{voucher.voucherId}
                      </Typography>
                    </TableCell>
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
                          bgcolor: alpha(
                            voucher.voucherType === "PUBLIC"
                              ? theme.palette.success.main
                              : theme.palette.info.main,
                            0.1,
                          ),
                          color:
                            voucher.voucherType === "PUBLIC"
                              ? "success.main"
                              : "info.main",
                          fontWeight: 500,
                          borderRadius: "6px",
                          border: "none",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="success.main"
                      >
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
                        {formatDate(voucher.startDate)}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {formatDate(voucher.endDate)}
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
                        icon={
                          voucher.isActive ? (
                            <CheckCircle sx={{ fontSize: 16 }} />
                          ) : (
                            <Cancel sx={{ fontSize: 16 }} />
                          )
                        }
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
                {editingId
                  ? "Update existing voucher details"
                  : "Add a new discount code"}
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
                  onChange={(e) => {
                    const newType = e.target.value as VoucherType;
                    setFormData({
                      ...formData,
                      voucherType: newType,
                    });
                    // Reset selected users if changing away from PERSONAL
                    if (newType !== "PERSONAL") {
                      setSelectedUsers([]);
                    }
                  }}
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

            {/* User selector for PERSONAL voucher */}
            {formData.voucherType === "PERSONAL" && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  backgroundColor: alpha(theme.palette.warning.main, 0.04),
                  border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    color: theme.palette.warning.main,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <PersonAdd fontSize="small" />
                  Chọn users nhận voucher PERSONAL
                </Typography>
                <Autocomplete
                  multiple
                  options={users}
                  getOptionLabel={(option) => `${option.fullName || option.email} (${option.email})`}
                  value={users.filter((user) =>
                    selectedUsers.includes(user.userId)
                  )}
                  onChange={(_, newValue) => {
                    setSelectedUsers(newValue.map((user) => user.userId));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Users"
                      placeholder="Chọn users cụ thể..."
                      helperText={`Đã chọn ${selectedUsers.length} users. Voucher sẽ tự động được grant cho các users này.`}
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: "12px", bgcolor: "white" },
                      }}
                    />
                  )}
                  sx={{ width: "100%" }}
                />
              </Box>
            )}

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
                fullWidth
                placeholder="0"
                value={
                  formData.maxDiscountAmount
                    ? formData.maxDiscountAmount.toLocaleString("vi-VN")
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\./g, "");
                  setFormData({
                    ...formData,
                    maxDiscountAmount: value ? parseFloat(value) : undefined,
                  });
                }}
                InputProps={{
                  sx: { borderRadius: "12px" },
                  endAdornment: (
                    <InputAdornment position="end">₫</InputAdornment>
                  ),
                }}
                helperText="Để trống nếu không giới hạn"
              />
              <TextField
                label="Min Order Value"
                fullWidth
                value={
                  formData.minOrderValue > 0
                    ? formData.minOrderValue.toLocaleString("vi-VN")
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\./g, "");
                  setFormData({
                    ...formData,
                    minOrderValue: parseFloat(value) || 0,
                  });
                }}
                InputProps={{
                  sx: { borderRadius: "12px" },
                  endAdornment: (
                    <InputAdornment position="end">₫</InputAdornment>
                  ),
                }}
                helperText="Nhập 0 nếu không yêu cầu giá trị tối thiểu"
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
                    applicableCourseIds: [], // Reset course selection
                    applicableCategoryIds: [], // Reset category selection
                  })
                }
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="ALL">All Courses</MenuItem>
                <MenuItem value="SPECIFIC_COURSES">Specific Courses</MenuItem>
                <MenuItem value="CATEGORY">Category</MenuItem>
              </Select>
            </FormControl>

            {/* Course selector for SPECIFIC_COURSES */}
            {formData.applicableTo === "SPECIFIC_COURSES" && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CardGiftcard fontSize="small" />
                  Chọn khóa học áp dụng voucher
                </Typography>
                <Autocomplete
                  multiple
                  options={courses}
                  getOptionLabel={(option) => option.title}
                  value={courses.filter((course) =>
                    formData.applicableCourseIds?.includes(course.courseId),
                  )}
                  onChange={(_, newValue) => {
                    setFormData({
                      ...formData,
                      applicableCourseIds: newValue.map(
                        (course) => course.courseId,
                      ),
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Courses"
                      placeholder="Chọn các khóa học cụ thể..."
                      helperText={`Đã chọn ${formData.applicableCourseIds?.length || 0} khóa học`}
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: "12px", bgcolor: "white" },
                      }}
                    />
                  )}
                  sx={{ width: "100%" }}
                />
              </Box>
            )}

            {/* Category selector for CATEGORY */}
            {formData.applicableTo === "CATEGORY" && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  backgroundColor: alpha(theme.palette.warning.main, 0.04),
                  border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    color: theme.palette.warning.main,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CardGiftcard fontSize="small" />
                  Chọn danh mục áp dụng voucher
                </Typography>
                <Autocomplete
                  multiple
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  options={(() => {
                    const flatten = (
                      cats: CategoryTreeResponse[],
                      depth = 0
                    ): (CategoryTreeResponse & { displayName: string })[] => {
                      return cats.reduce((acc, cat) => {
                        // Add non-breaking spaces for indentation effect
                        const prefix = depth > 0 ? "— ".repeat(depth) : "";
                        acc.push({ ...cat, displayName: prefix + cat.name });
                        if (cat.children?.length) {
                          acc.push(...flatten(cat.children, depth + 1));
                        }
                        return acc;
                      }, [] as (CategoryTreeResponse & { displayName: string })[]);
                    };
                    return flatten(categories);
                  })()}
                  getOptionLabel={(option) => option.displayName || option.name}
                  value={(() => {
                    // Reuse the same flattening logic to find the selected objects
                    const flatten = (
                      cats: CategoryTreeResponse[],
                      depth = 0
                    ): (CategoryTreeResponse & { displayName: string })[] => {
                      return cats.reduce((acc, cat) => {
                        const prefix = depth > 0 ? "— ".repeat(depth) : "";
                        acc.push({ ...cat, displayName: prefix + cat.name });
                        if (cat.children?.length) {
                          acc.push(...flatten(cat.children, depth + 1));
                        }
                        return acc;
                      }, [] as (CategoryTreeResponse & { displayName: string })[]);
                    };
                    const flatCategories = flatten(categories);
                    return flatCategories.filter((cat) =>
                      formData.applicableCategoryIds?.includes(cat.id),
                    );
                  })()}
                  onChange={(_, newValue) => {
                    // Helper to get all descendant IDs
                    const getDescendantIds = (
                      cat: CategoryTreeResponse,
                    ): number[] => {
                      let ids: number[] = []; // Don't include self
                      if (cat.children && cat.children.length > 0) {
                        cat.children.forEach((child) => {
                          ids.push(child.id);
                          ids = [...ids, ...getDescendantIds(child)];
                        });
                      }
                      return ids;
                    };

                    // Calculate all descendants of the currently selected categories
                    const allDescendantsOfSelected = new Set(
                      newValue.flatMap((cat) => getDescendantIds(cat)),
                    );

                    // Filter out any selected category that is actually a descendant of another selected category
                    // This ensures only the highest-level selected categories are kept
                    const optimizedIds = newValue
                      .map((cat) => cat.id)
                      .filter((id) => !allDescendantsOfSelected.has(id));

                    setFormData({
                      ...formData,
                      applicableCategoryIds: optimizedIds,
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Categories"
                      placeholder="Chọn các danh mục..."
                      helperText={`Đã chọn ${formData.applicableCategoryIds?.length || 0} danh mục`}
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: "12px", bgcolor: "white" },
                      }}
                    />
                  )}
                  sx={{ width: "100%" }}
                />
              </Box>
            )}

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
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
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
            Enter user IDs separated by commas to grant this voucher directly to
            them.
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
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
            }}
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
            maxWidth: "400px",
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
            Are you sure you want to delete this voucher? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              border: "1px solid #e2e8f0",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.4)",
            }}
          >
            Delete Voucher
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoucherManagement;
