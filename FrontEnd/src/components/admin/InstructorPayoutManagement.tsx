import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { commissionService } from "../../service/commissionService";
import type { InstructorPayout } from "../../service/commissionService";
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Payment,
} from "@mui/icons-material";
import { formatDate } from "../../libs/dateUtils";

export const InstructorPayoutManagement = () => {
  const [payouts, setPayouts] = useState<InstructorPayout[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<InstructorPayout | null>(
    null,
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPayouts = async () => {
    try {
      const data = await commissionService.getAllPayouts(0, 100);
      setPayouts(data.content);
    } catch (error) {
      console.error("Error fetching payouts:", error);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle color="success" />;
      case "FAILED":
      case "CANCELLED":
        return <Cancel color="error" />;
      case "PROCESSING":
        return <HourglassEmpty color="warning" />;
      default:
        return <Payment color="info" />;
    }
  };

  const getStatusColor = (
    status: string,
  ): "success" | "error" | "warning" | "info" => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "FAILED":
      case "CANCELLED":
        return "error";
      case "PROCESSING":
        return "warning";
      default:
        return "info";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "Chờ Xử Lý";
      case "PROCESSING":
        return "Đang Xử Lý";
      case "COMPLETED":
        return "Hoàn Thành";
      case "FAILED":
        return "Thất Bại";
      case "CANCELLED":
        return "Đã Hủy";
      default:
        return status;
    }
  };

  const handleCompletePayout = async () => {
    if (!selectedPayout || !transactionId) return;

    setLoading(true);
    try {
      await commissionService.completePayout(
        selectedPayout.payoutId,
        transactionId,
      );
      await fetchPayouts();
      setOpenDialog(false);
      setSelectedPayout(null);
      setTransactionId("");
    } catch (error) {
      console.error("Error completing payout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (payoutId: number, status: string) => {
    try {
      await commissionService.updatePayoutStatus(payoutId, status);
      await fetchPayouts();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Quản Lý Thanh Toán Giảng Viên
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, px: 3 }}
        >
          Tạo Phiếu Thanh Toán Mới
        </Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : payouts.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Chưa có dữ liệu thanh toán
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tạo phiếu thanh toán mới để bắt đầu
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "background.default" }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Mã Thanh Toán
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Giảng Viên</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Thời Gian</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Tổng Tiền
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Hoa Hồng
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Thực Nhận
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng Thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mã GD</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Thao Tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.payoutId}>
                        <TableCell>#{payout.payoutId}</TableCell>
                        <TableCell>{payout.instructorName}</TableCell>
                        <TableCell>
                          <Typography variant="caption" display="block">
                            {formatDate(payout.periodStart)} -
                          </Typography>
                          <Typography variant="caption" display="block">
                            {formatDate(payout.periodEnd)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          ${payout.amount.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ${payout.commissionAmount.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="success.main"
                          >
                            ${payout.netAmount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(payout.status)}
                            label={getStatusLabel(payout.status)}
                            color={getStatusColor(payout.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{payout.transactionId || "-"}</TableCell>
                        <TableCell>
                          {payout.status === "PENDING" && (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() =>
                                  handleUpdateStatus(
                                    payout.payoutId,
                                    "PROCESSING",
                                  )
                                }
                              >
                                Xử Lý
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setOpenDialog(true);
                                }}
                              >
                                Hoàn Thành
                              </Button>
                            </Box>
                          )}
                          {payout.status === "PROCESSING" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => {
                                setSelectedPayout(payout);
                                setOpenDialog(true);
                              }}
                            >
                              Hoàn Thành
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Complete Payout Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Hoàn Thành Thanh Toán</DialogTitle>
        <DialogContent>
          {selectedPayout && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Giảng Viên:</strong> {selectedPayout.instructorName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Số Tiền Thực Nhận:</strong> $
                {selectedPayout.netAmount.toFixed(2)}
              </Typography>
              <TextField
                fullWidth
                label="Mã Giao Dịch"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                sx={{ mt: 2 }}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button
            onClick={handleCompletePayout}
            variant="contained"
            color="success"
            disabled={loading || !transactionId}
          >
            {loading ? "Đang xử lý..." : "Hoàn Thành"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
