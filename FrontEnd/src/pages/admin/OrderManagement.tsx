import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Pagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Cancel as CancelIcon,
  ShoppingCart,
  PendingActions,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { adminOrderService } from "../../service/adminOrderService";
import type { OrderResponse } from "../../service/orderService";
import { formatCurrency } from "../../libs/utils";
import OrderDetailModal from "../../components/admin/OrderDetailModal";

const OrderManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState<boolean>(false);
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderResponse | null>(
    null,
  );
  const { enqueueSnackbar } = useSnackbar();

  const fetchOrders = async (pageNo: number) => {
    setLoading(true);
    try {
      const response = await adminOrderService.getAllOrders(pageNo - 1, 10); // 10 items per page for table
      setOrders(response.data?.content || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      enqueueSnackbar("Failed to fetch orders", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };

  const handleViewDetails = (order: OrderResponse) => {
    setSelectedOrder(order);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedOrder(null);
  };

  const handleOpenCancelDialog = (order: OrderResponse) => {
    setOrderToCancel(order);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setOrderToCancel(null);
  };

  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      await adminOrderService.cancelOrder(orderToCancel.orderId);
      enqueueSnackbar("Order cancelled successfully", { variant: "success" });
      fetchOrders(page); // Refresh list
    } catch (error: any) {
      console.error("Failed to cancel order", error);
      // Display error message from backend if available
      const errorMessage = error?.message || "Failed to cancel order";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      handleCloseCancelDialog();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

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
            Quản lý Đơn Hàng
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Theo dõi và quản lý tất cả đơn hàng trong hệ thống
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            label: "Tổng Đơn Hàng",
            value: orders.length,
            color: "#2563eb",
            icon: <ShoppingCart />,
          },
          {
            label: "Đang Chờ",
            value: orders.filter((o) => o.status === "PENDING").length,
            color: "#f59e0b",
            icon: <PendingActions />,
          },
          {
            label: "Hoàn Thành",
            value: orders.filter((o) => o.status === "COMPLETED").length,
            color: "#10b981",
            icon: <CheckCircle />,
          },
          {
            label: "Đã Hủy",
            value: orders.filter((o) => o.status === "CANCELLED").length,
            color: "#ef4444",
            icon: <Cancel />,
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
            placeholder="Tìm kiếm đơn hàng..."
            variant="outlined"
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
                  boxShadow:
                    "0 0 0 2px " + alpha(theme.palette.primary.main, 0.2),
                },
              },
            }}
          />
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="order table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Mã Đơn</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngày Tạo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng Thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Tổng Tiền
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Hành Động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.orderId}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        #{order.orderId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        size="small"
                        color={getStatusColor(order.status) as any}
                        variant="filled" // Updated logic can go here if needed
                        sx={{ fontWeight: 500, borderRadius: "6px" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        color="primary.main"
                      >
                        {formatCurrency(order.finalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem Chi Tiết">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewDetails(order)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {order.status !== "CANCELLED" &&
                        order.status !== "COMPLETED" && (
                          <Tooltip title="Hủy Đơn">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenCancelDialog(order)}
                              size="small"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        Không có đơn hàng nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
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
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        PaperProps={{
          sx: { borderRadius: "20px", boxShadow: "0 4px 30px rgba(0,0,0,0.1)" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel Order #{orderToCancel?.orderId}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseCancelDialog}
            variant="outlined"
            sx={{ borderRadius: "10px", textTransform: "none" }}
          >
            No, Keep it
          </Button>
          <Button
            onClick={handleConfirmCancelOrder}
            color="error"
            variant="contained"
            autoFocus
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
            }}
          >
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        order={selectedOrder}
      />
    </Box>
  );
};

export default OrderManagement;
