import React, { useState } from "react";
import { Box, TextField, Button, Typography, Alert, Chip } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { voucherService } from "../../service/voucherService";

interface VoucherInputProps {
  onVoucherApply: (voucherCode: string) => void;
  onVoucherRemove: () => void;
  appliedVoucherCode?: string;
}

export const VoucherInput: React.FC<VoucherInputProps> = ({
  onVoucherApply,
  onVoucherRemove,
  appliedVoucherCode,
}) => {
  const [voucherCode, setVoucherCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError("Vui lòng nhập mã voucher");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isValid = await voucherService.validateVoucherCode(voucherCode);
      if (isValid) {
        onVoucherApply(voucherCode);
        setVoucherCode("");
      } else {
        setError("Mã voucher không hợp lệ hoặc đã hết hạn");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể áp dụng voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    onVoucherRemove();
    setVoucherCode("");
    setError("");
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        <LocalOfferIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Mã giảm giá
      </Typography>

      {appliedVoucherCode ? (
        <Box
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "success.main",
            borderRadius: 2,
            backgroundColor: "success.50",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography color="success.main" fontWeight={600}>
              Đã áp dụng: {appliedVoucherCode}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={handleRemoveVoucher}
          >
            Xóa
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập mã voucher"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleApplyVoucher();
                }
              }}
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={handleApplyVoucher}
              disabled={loading || !voucherCode.trim()}
              sx={{ minWidth: "100px" }}
            >
              {loading ? "Đang kiểm tra..." : "Áp dụng"}
            </Button>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default VoucherInput;
