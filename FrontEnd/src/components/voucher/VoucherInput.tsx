import React, { useState } from "react";
import { Box, TextField, Button, Typography, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
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
        setError("Mã voucher không hợp lệ");
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
      {appliedVoucherCode ? (
        <Box
          sx={{
            p: 2,
            border: "2px solid",
            borderColor: "success.main",
            borderRadius: 2,
            backgroundColor: "rgba(76, 175, 80, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 24 }} />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                Đã áp dụng
              </Typography>
              <Typography color="success.main" fontWeight={700} sx={{ fontSize: "1rem" }}>
                {appliedVoucherCode}
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Xóa"
            size="small"
            color="error"
            variant="outlined"
            deleteIcon={<CloseIcon />}
            onDelete={handleRemoveVoucher}
            onClick={handleRemoveVoucher}
            sx={{
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "rgba(211, 47, 47, 0.08)",
              }
            }}
          />
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
              error={!!error}
              helperText={error}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleApplyVoucher}
              disabled={loading || !voucherCode.trim()}
              sx={{
                minWidth: "100px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {loading ? "Đang kiểm tra..." : "Áp dụng"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default VoucherInput;
