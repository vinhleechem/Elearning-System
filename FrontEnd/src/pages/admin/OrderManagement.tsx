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
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { adminOrderService } from "../../service/adminOrderService";
import type { OrderResponse } from "../../service/orderService";
import { formatCurrency } from "../../libs/utils";
import OrderDetailModal from "../../components/admin/OrderDetailModal";

const OrderManagement: React.FC = () => {
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
    <Box sx={{ p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Quản lý Đơn Hàng
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Theo dõi và quản lý tất cả đơn hàng trong hệ thống
        </Typography>
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
        <Paper
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
            Tổng Đơn Hàng
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {orders.length}
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
            Đang Chờ
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {orders.filter((o) => o.status === "PENDING").length}
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "white",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
            Hoàn Thành
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {orders.filter((o) => o.status === "COMPLETED").length}
          </Typography>
        </Paper>
        <Paper
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            color: "white",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
            Đã Hủy
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {orders.filter((o) => o.status === "CANCELLED").length}
          </Typography>
        </Paper>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          label="Tìm kiếm"
          placeholder="Tìm kiếm đơn hàng..."
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="order table">
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.light" }}>
                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                  Mã Đơn
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                  Ngày Tạo
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                  Trạng Thái
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "primary.main" }}
                  align="right"
                >
                  Tổng Tiền
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "primary.main" }}
                  align="center"
                >
                  Hành Động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.orderId}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  hover
                >
                  <TableCell component="th" scope="row">
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
                      color={getStatusColor(order.status) as any}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {formatCurrency(order.finalAmount)}
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
                    <Typography variant="h6" color="text.secondary">
                      Không có đơn hàng nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
      </Box>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel Order #{orderToCancel?.orderId}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCancelDialog}>No, Keep it</Button>
          <Button
            onClick={handleConfirmCancelOrder}
            color="error"
            variant="contained"
            autoFocus
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
