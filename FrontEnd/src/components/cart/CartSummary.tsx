import {
  Button,
  Card,
  Divider,
  Typography,
} from "@mui/material";
import type { CartSummaryProps } from "../../types/cartSummary";
import { formatCurrency } from "../../libs/utils";
import { ArrowForward } from "@mui/icons-material";
import { Link } from "react-router-dom";

const CartSummary: React.FC<CartSummaryProps> = ({
  total = 590000,
  oldTotal = 1920000,
  discountPercent = 50,
}) => {
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

      {oldTotal && oldTotal > total && (
        <Typography
          fontSize={14}
          sx={{ textDecoration: "line-through", color: "text.secondary" }}
        >
          {formatCurrency(oldTotal)}
        </Typography>
      )}

      {discountPercent && discountPercent > 0 && (
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
    </Card>
  );
};

export default CartSummary;
