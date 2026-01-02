import { useEffect, useState } from "react";
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
  Grid,
  Select,
  InputLabel,
  FormControl,
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
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { promotionService } from "../../service/promotionService";
import type {
  Promotion,
  PromotionDetail,
  PromotionRequest,
  PromotionRule,
} from "../../types/promotion";

const PromotionManagement = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [promotionDetail, setPromotionDetail] =
    useState<PromotionDetail | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

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
    ruleType: "ALL",
    targetId: null,
    discountType: "PERCENTAGE",
    discountValue: 0,
    maxDiscountAmount: null,
    minPurchaseAmount: null,
    buyQuantity: null,
    getQuantity: null,
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
      ruleType: "ALL",
      targetId: null,
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxDiscountAmount: null,
      minPurchaseAmount: null,
      buyQuantity: null,
      getQuantity: null,
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
          <LocalOffer
            sx={{ fontSize: 40, color: theme.palette.primary.main }}
          />
          <div>
            <Typography variant="h4" fontWeight="bold">
              Promotion Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage promotions and discount rules
            </Typography>
          </div>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Create Promotion
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
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
                    Total Promotions
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {promotions.length}
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
                  <LocalOffer fontSize="large" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
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
                    Active Promotions
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {promotions.filter((p) => p.isActive).length}
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
        </Grid>
        <Grid item xs={12} md={4}>
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
                    Inactive Promotions
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {promotions.filter((p) => !p.isActive).length}
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
                  <Cancel fontSize="large" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search promotions..."
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
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Type</strong>
              </TableCell>
              <TableCell>
                <strong>Period</strong>
              </TableCell>
              <TableCell>
                <strong>Priority</strong>
              </TableCell>
              <TableCell>
                <strong>Rules</strong>
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
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredPromotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    No promotions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPromotions.map((promotion) => (
                <TableRow key={promotion.promotionId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {promotion.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {promotion.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={promotion.promotionType}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      {new Date(promotion.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={promotion.priority} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${promotion.rulesCount} rules`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={promotion.isActive ? <CheckCircle /> : <Cancel />}
                      label={promotion.isActive ? "Active" : "Inactive"}
                      color={promotion.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleViewDetail(promotion.promotionId)
                          }
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(promotion)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={promotion.isActive ? "Deactivate" : "Activate"}
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
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setItemToDelete(promotion.promotionId);
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
              <Grid item xs={6}>
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
              <Grid item xs={6}>
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
                  <Grid item xs={6}>
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
                  <Grid item xs={6}>
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
                  <Grid item xs={6}>
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
                  <Grid item xs={6}>
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
                            : null,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
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
