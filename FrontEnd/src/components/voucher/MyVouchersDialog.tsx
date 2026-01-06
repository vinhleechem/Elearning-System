import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { voucherService } from "../../service/voucherService";
import type { UserVoucher } from "../../types/voucher";
import { format } from "date-fns";

interface MyVouchersDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectVoucher: (voucherCode: string) => void;
  selectedVoucherCode?: string;
}

export const MyVouchersDialog: React.FC<MyVouchersDialogProps> = ({
  open,
  onClose,
  onSelectVoucher,
  selectedVoucherCode,
}) => {
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadMyVouchers();
    }
  }, [open]);

  const loadMyVouchers = async () => {
    setLoading(true);
    try {
      const data = await voucherService.getMyVouchers(true);
      setVouchers(data);
    } catch (error) {
      console.error("Failed to load vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDiscount = (voucher: UserVoucher) => {
    return `${voucher.discountValue.toLocaleString()} VNĐ`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            <LocalOfferIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Voucher của tôi
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography textAlign="center" py={4}>
            Đang tải...
          </Typography>
        ) : vouchers.length === 0 ? (
          <Alert severity="info">
            Bạn chưa có voucher nào. Hãy tìm kiếm và nhận voucher từ danh sách
            voucher công khai!
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {vouchers.map((voucher) => (
              <Grid size={{ xs: 12 }} key={voucher.userVoucherId}>
                <Card
                  sx={{
                    border:
                      selectedVoucherCode === voucher.code
                        ? "2px solid"
                        : "1px solid",
                    borderColor:
                      selectedVoucherCode === voucher.code
                        ? "primary.main"
                        : "divider",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => {
                    onSelectVoucher(voucher.code);
                    onClose();
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
                            label={`HSD: ${formatDate(voucher.expiryDate)}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>

                      <Box>
                        {selectedVoucherCode === voucher.code && (
                          <Chip
                            label="Đang áp dụng"
                            color="primary"
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MyVouchersDialog;
