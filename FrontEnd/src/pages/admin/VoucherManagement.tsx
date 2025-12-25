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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <CardGiftcard
            sx={{ fontSize: 40, color: theme.palette.primary.main }}
          />
          <div>
            <Typography variant="h4" fontWeight="bold">
              Voucher Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage vouchers and distribution
            </Typography>
          </div>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Create Voucher
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 3,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Vouchers
            </Typography>
            <Typography variant="h4">{vouchers.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Active Vouchers
            </Typography>
            <Typography variant="h4">
              {vouchers.filter((v) => v.isActive).length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Public Vouchers
            </Typography>
            <Typography variant="h4">
              {vouchers.filter((v) => v.voucherType === "PUBLIC").length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Usage
            </Typography>
            <Typography variant="h4">
              {vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search vouchers by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell>
                <strong>Code</strong>
              </TableCell>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Type</strong>
              </TableCell>
              <TableCell>
                <strong>Discount</strong>
              </TableCell>
              <TableCell>
                <strong>Period</strong>
              </TableCell>
              <TableCell>
                <strong>Usage</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Actions</strong>
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
