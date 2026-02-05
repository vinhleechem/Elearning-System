import { Button, Card, Divider, Typography } from "@mui/material";
import type { CartSummaryProps } from "../../types/cartSummary";
import { ArrowForward } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { PriceDisplay } from "../shared";

const CartSummary: React.FC<CartSummaryProps> = ({
  total = 0,
  oldTotal,
  discountPercent,
}) => {
  return (
    <Card sx={{ boxShadow: "none" }}>
      <Typography variant="subtitle1" fontWeight={600}>
        Tổng:
      </Typography>

      <PriceDisplay
        current={total}
        original={oldTotal}
        discountPercent={discountPercent}
        size="large"
        orientation="vertical"
        sx={{ mt: 1 }}
      />

      <Button
        component={Link}
        to="/payment/checkout"
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
