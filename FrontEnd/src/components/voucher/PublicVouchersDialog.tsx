import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { voucherService } from "../../service/voucherService";
import type { Voucher } from "../../types/voucher";
import { format } from "date-fns";

interface PublicVouchersDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PublicVouchersDialog: React.FC<PublicVouchersDialogProps> = ({
  open,
  onClose,
}) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      loadPublicVouchers();
    }
  }, [open]);

  const loadPublicVouchers = async () => {
    setLoading(true);
    try {
      const data = await voucherService.getPublicVouchers();
      setVouchers(data);
    } catch (error) {
      console.error("Failed to load public vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimVoucher = async (code: string, voucherId: number) => {
    setClaimingId(voucherId);
    setMessage(null);

    try {
      await voucherService.claimVoucher(code);
      setMessage({
        type: "success",
        text: `Nhận voucher "${code}" thành công! Kiểm tra trong "Voucher của tôi"`,
      });
      // Reload to update available count
      await loadPublicVouchers();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Không thể nhận voucher",
      });
    } finally {
      setClaimingId(null);
    }
  };

  const formatDiscount = (voucher: Voucher) => {
    return `${voucher.discountValue.toLocaleString()} VNĐ`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  const getRemainingCount = (voucher: Voucher) => {
    if (!voucher.totalUsageLimit) return "Không giới hạn";
    const remaining = voucher.totalUsageLimit - voucher.currentUsageCount;
    return remaining > 0 ? `Còn ${remaining}` : "Hết lượt";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            <CardGiftcardIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Voucher công khai
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {loading ? (
          <Typography textAlign="center" py={4}>
            Đang tải...
          </Typography>
        ) : vouchers.length === 0 ? (
          <Alert severity="info">Hiện tại chưa có voucher công khai nào.</Alert>
        ) : (
          <Grid container spacing={2}>
            {vouchers.map((voucher) => {
              const isOutOfStock =
                voucher.totalUsageLimit &&
                voucher.currentUsageCount >= voucher.totalUsageLimit;

              return (
                <Grid item xs={12} key={voucher.voucherId}>
                  <Card
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      opacity: isOutOfStock ? 0.6 : 1,
                    }}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box flex={1}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="primary"
                          >
                            {voucher.code}
                          </Typography>
                          <Typography variant="body1" fontWeight={600} mt={0.5}>
                            {voucher.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={0.5}
                          >
                            {voucher.description}
                          </Typography>

                          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                            <Chip
                              label={`Giảm: ${formatDiscount(voucher)}`}
                              color="success"
                              size="small"
                            />
                            {voucher.minOrderValue > 0 && (
                              <Chip
                                label={`Đơn tối thiểu: ${voucher.minOrderValue.toLocaleString()} VNĐ`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            <Chip
                              label={getRemainingCount(voucher)}
                              size="small"
                              color={isOutOfStock ? "error" : "default"}
                              variant="outlined"
                            />
                            <Chip
                              label={`HSD: ${formatDate(voucher.endDate)}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>

                        <Box ml={2}>
                          <Button
                            variant="contained"
                            onClick={() =>
                              handleClaimVoucher(
                                voucher.code,
                                voucher.voucherId,
                              )
                            }
                            disabled={
                              isOutOfStock || claimingId === voucher.voucherId
                            }
                          >
                            {claimingId === voucher.voucherId
                              ? "Đang nhận..."
                              : "Nhận voucher"}
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PublicVouchersDialog;
