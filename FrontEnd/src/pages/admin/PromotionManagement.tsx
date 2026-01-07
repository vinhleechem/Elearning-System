import { useEffect, useState } from "react";
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
  Grid,
  Select,
  InputLabel,
  FormControl,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  LocalOffer,
  Search,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  CloudUpload,
} from "@mui/icons-material";
import { useToast } from "../../hooks/useToast";
import { promotionService } from "../../service/promotionService";
import type {
  Promotion,
  PromotionDetail,
  PromotionRequest,
  PromotionRule,
} from "../../types/promotion";

const PromotionManagement = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useToast();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page] = useState(0);
  const [, setTotalPages] = useState(0);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [promotionDetail, setPromotionDetail] =
    useState<PromotionDetail | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState<PromotionRequest>({
    name: "",
    description: "",
    promotionType: "SEASONAL",
    startDate: "",
    endDate: "",
    isActive: true,
    priority: 0,
    rules: [],
  });

  const [currentRule, setCurrentRule] = useState<PromotionRule>({
    ruleId: 0,
    ruleType: "ALL",
    targetId: undefined,
    discountType: "PERCENTAGE",
    discountValue: 0,
    maxDiscountAmount: undefined,
    minPurchaseAmount: undefined,
    buyQuantity: undefined,
    getQuantity: undefined,
  });

  useEffect(() => {
    fetchPromotions();
  }, [page]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await promotionService.getAllPromotions(page, 10);
      setPromotions(response.content);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error("Error fetching promotions:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to fetch promotions",
        {
          variant: "error",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      // Edit mode
      setEditingId(promotion.promotionId);
      setFormData({
        name: promotion.name,
        description: promotion.description || "",
        promotionType: promotion.promotionType,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        isActive: promotion.isActive,
        priority: promotion.priority,
        rules: [], // Will be loaded when fetching detail
      });
      fetchPromotionDetail(promotion.promotionId);
    } else {
      // Create mode
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        promotionType: "SEASONAL",
        startDate: "",
        endDate: "",
        isActive: true,
        priority: 0,
        rules: [],
      });
    }
    setOpenDialog(true);
  };

  const fetchPromotionDetail = async (id: number) => {
    try {
      const detail = await promotionService.getPromotionById(id);
      setFormData((prev) => ({
        ...prev,
        rules: detail.rules.map((r) => ({
          ruleType: r.ruleType,
          targetId: r.targetId,
          discountType: r.discountType,
          discountValue: r.discountValue,
          maxDiscountAmount: r.maxDiscountAmount,
          minPurchaseAmount: r.minPurchaseAmount,
          buyQuantity: r.buyQuantity,
          getQuantity: r.getQuantity,
        })),
      }));
    } catch (error: any) {
      enqueueSnackbar("Failed to fetch promotion detail", { variant: "error" });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await promotionService.updatePromotion(editingId, formData);
        enqueueSnackbar("Promotion updated successfully", {
          variant: "success",
        });
      } else {
        await promotionService.createPromotion(formData);
        enqueueSnackbar("Promotion created successfully", {
          variant: "success",
        });
      }
      handleCloseDialog();
      fetchPromotions();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to save promotion",
        {
          variant: "error",
        },
      );
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await promotionService.deletePromotion(itemToDelete);
      enqueueSnackbar("Promotion deleted successfully", { variant: "success" });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchPromotions();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete promotion",
        {
          variant: "error",
        },
      );
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await promotionService.deactivatePromotion(id);
        enqueueSnackbar("Promotion deactivated", { variant: "success" });
      } else {
        await promotionService.activatePromotion(id);
        enqueueSnackbar("Promotion activated", { variant: "success" });
      }
      fetchPromotions();
    } catch (error: any) {
      enqueueSnackbar("Failed to toggle promotion status", {
        variant: "error",
      });
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await promotionService.getPromotionById(id);
      setPromotionDetail(detail);
      setOpenDetailDialog(true);
    } catch (error: any) {
      enqueueSnackbar("Failed to fetch promotion detail", { variant: "error" });
    }
  };

  const addRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, { ...currentRule }],
    }));
    setCurrentRule({
      ruleId: 0,
      ruleType: "ALL",
      targetId: undefined,
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxDiscountAmount: undefined,
      minPurchaseAmount: undefined,
      buyQuantity: undefined,
      getQuantity: undefined,
    });
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const filteredPromotions = promotions.filter((promotion) =>
    promotion.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await promotionService.exportPromotions();
      enqueueSnackbar("Xuất danh sách khuyến mãi thành công", {
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
      await promotionService.importPromotions(file);
      enqueueSnackbar("Import khuyến mãi thành công", {
        variant: "success",
      });
      fetchPromotions();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Import thất bại", {
        variant: "error",
      });
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
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
            Quản lý Khuyến mãi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý các chương trình khuyến mãi và quy tắc giảm giá
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
            Tạo khuyến mãi mới
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            label: "Tổng khuyến mãi",
            value: promotions.length,
            color: "#2563eb",
            icon: <LocalOffer />,
          },
          {
            label: "Đang hoạt động",
            value: promotions.filter((p) => p.isActive).length,
            color: "#10b981",
            icon: <CheckCircle />,
          },
          {
            label: "Vô hiệu hóa",
            value: promotions.filter((p) => !p.isActive).length,
            color: "#ef4444",
            icon: <Cancel />,
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
          <TextField
            fullWidth
            placeholder="Tìm kiếm khuyến mãi..."
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
                <TableCell sx={{ fontWeight: 700 }}>Tên khuyến mãi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Độ ưu tiên</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Quy tắc</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredPromotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Không tìm thấy khuyến mãi nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPromotions.map((promotion) => (
                  <TableRow
                    key={promotion.promotionId}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {promotion.name}
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
                        {promotion.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={promotion.promotionType}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          fontWeight: 500,
                          borderRadius: "6px",
                          border: "none",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {new Date(promotion.startDate).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {new Date(promotion.endDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={promotion.priority}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${(promotion as any).rulesCount || (promotion as any).rules?.length || 0} rules`}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: "6px" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          promotion.isActive ? (
                            <CheckCircle sx={{ fontSize: 16 }} />
                          ) : (
                            <Cancel sx={{ fontSize: 16 }} />
                          )
                        }
                        label={promotion.isActive ? "Active" : "Inactive"}
                        color={promotion.isActive ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleViewDetail(promotion.promotionId)
                            }
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenDialog(promotion)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            promotion.isActive ? "Vô hiệu hóa" : "Kích hoạt"
                          }
                        >
                          <IconButton
                            size="small"
                            color={promotion.isActive ? "warning" : "success"}
                            onClick={() =>
                              handleToggleActive(
                                promotion.promotionId,
                                promotion.isActive,
                              )
                            }
                          >
                            {promotion.isActive ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setItemToDelete(promotion.promotionId);
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
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          borderRadius: "20px",
          boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
        }}
      >
        <DialogTitle>
          {editingId ? "Edit Promotion" : "Create Promotion"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
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
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.promotionType}
                label="Type"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    promotionType: e.target.value as any,
                  })
                }
              >
                <MenuItem value="SEASONAL">Seasonal</MenuItem>
                <MenuItem value="FLASH_SALE">Flash Sale</MenuItem>
                <MenuItem value="CATEGORY_DISCOUNT">Category Discount</MenuItem>
                <MenuItem value="BUNDLE">Bundle</MenuItem>
                <MenuItem value="FIRST_PURCHASE">First Purchase</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
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
              </Grid>
              <Grid size={{ xs: 6 }}>
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
              </Grid>
            </Grid>
            <TextField
              label="Priority"
              type="number"
              fullWidth
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value) })
              }
            />
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

            <Typography variant="h6" mt={2}>
              Promotion Rules
            </Typography>

            {/* Existing Rules */}
            {formData.rules.map((rule, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">
                      {rule.ruleType} - {rule.discountType}:{" "}
                      {rule.discountValue}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeRule(index)}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            {/* Add New Rule */}
            <Card
              variant="outlined"
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
            >
              <CardContent>
                <Typography variant="subtitle2" mb={2}>
                  Add New Rule
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Rule Type</InputLabel>
                      <Select
                        value={currentRule.ruleType}
                        label="Rule Type"
                        onChange={(e) =>
                          setCurrentRule({
                            ...currentRule,
                            ruleType: e.target.value as any,
                          })
                        }
                      >
                        <MenuItem value="ALL">All</MenuItem>
                        <MenuItem value="COURSE">Course</MenuItem>
                        <MenuItem value="CATEGORY">Category</MenuItem>
                        <MenuItem value="CART_TOTAL">Cart Total</MenuItem>
                        <MenuItem value="BUY_X_GET_Y">Buy X Get Y</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Discount Type</InputLabel>
                      <Select
                        value={currentRule.discountType}
                        label="Discount Type"
                        onChange={(e) =>
                          setCurrentRule({
                            ...currentRule,
                            discountType: e.target.value as any,
                          })
                        }
                      >
                        <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                        <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Discount Value"
                      type="number"
                      fullWidth
                      size="small"
                      value={currentRule.discountValue}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          discountValue: parseFloat(e.target.value),
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Target ID (optional)"
                      type="number"
                      fullWidth
                      size="small"
                      value={currentRule.targetId || ""}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          targetId: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addRule}
                      fullWidth
                    >
                      Add Rule
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Promotion Details</DialogTitle>
        <DialogContent>
          {promotionDetail && (
            <Stack spacing={2}>
              <Typography>
                <strong>Name:</strong> {promotionDetail.name}
              </Typography>
              <Typography>
                <strong>Description:</strong> {promotionDetail.description}
              </Typography>
              <Typography>
                <strong>Type:</strong> {promotionDetail.promotionType}
              </Typography>
              <Typography>
                <strong>Period:</strong>{" "}
                {new Date(promotionDetail.startDate).toLocaleString()} -{" "}
                {new Date(promotionDetail.endDate).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Priority:</strong> {promotionDetail.priority}
              </Typography>
              <Typography>
                <strong>Status:</strong>{" "}
                {promotionDetail.isActive ? "Active" : "Inactive"}
              </Typography>

              <Typography variant="h6" mt={2}>
                Rules:
              </Typography>
              {promotionDetail.rules.map((rule, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Typography>
                      <strong>Type:</strong> {rule.ruleType}
                    </Typography>
                    <Typography>
                      <strong>Discount:</strong> {rule.discountType} -{" "}
                      {rule.discountValue}
                    </Typography>
                    {rule.targetName && (
                      <Typography>
                        <strong>Target:</strong> {rule.targetName}
                      </Typography>
                    )}
                    {rule.maxDiscountAmount && (
                      <Typography>
                        <strong>Max Discount:</strong> {rule.maxDiscountAmount}
                      </Typography>
                    )}
                    {rule.minPurchaseAmount && (
                      <Typography>
                        <strong>Min Purchase:</strong> {rule.minPurchaseAmount}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this promotion?
          </Typography>
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

export default PromotionManagement;
