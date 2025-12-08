import {
  Box,
  Button,
  Card,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import type { CartSummaryProps } from "../../types/cartSummary";
import { formatCurrency } from "../../libs/utils";
import { ArrowForward } from "@mui/icons-material";
import { useState } from "react";
import { Link } from "react-router-dom";

const CartSummary: React.FC<CartSummaryProps> = ({
  total = 590000,
  oldTotal = 1920000,
  discountPercent = 50,
}) => {
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");

  const handleApplyCoupon = () => {
    setShowCoupon(false);
  };
  return (
    <Card
      sx={{
        boxShadow: "none",
      }}
    >
      <Typography variant="subtitle1" fontWeight={600}>
        Tổng:
      </Typography>

      <Typography variant="h5" fontWeight={700} color="text.primary" mt={1}>
        {formatCurrency(total)}
      </Typography>

      {oldTotal && (
        <Typography
          fontSize={14}
          sx={{ textDecoration: "line-through", color: "text.secondary" }}
        >
          {formatCurrency(oldTotal)}
        </Typography>
      )}

      {discountPercent && (
        <Typography fontSize={14} color="success.main">
          Giảm {discountPercent}%
        </Typography>
      )}

      {/* Nút checkout */}
      <Button
        component={Link}
        to={"/payment/checkout"}
        variant="contained"
        fullWidth
        sx={{
          mt: 2,
          backgroundColor: "#3b82f6",
          "&:hover": { backgroundColor: "#2563eb" },
        }}
        endIcon={<ArrowForward />}
      >
        Tiến hành thanh toán
      </Button>

      <Typography
        variant="body2"
        sx={{ mt: 1, color: "text.secondary", fontSize: 12 }}
      >
        Bạn sẽ không bị tính phí ngay bây giờ
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Khuyến mại
        </Typography>
        {!showCoupon ? (
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderColor: "#3b82f6",
              color: "#3b82f6",
              fontWeight: 600,
            }}
            onClick={() => setShowCoupon(true)}
          >
            Áp dụng coupon
          </Button>
        ) : (
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Nhập coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#3b82f6",
                "&:hover": { backgroundColor: "#2563eb" },
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
                minWidth: "fit-content",
              }}
              onClick={handleApplyCoupon}
            >
              Áp dụng
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default CartSummary;
