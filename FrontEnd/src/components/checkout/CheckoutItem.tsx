import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import { formatCurrency } from "../../libs/utils";
import type { CheckoutItemProps } from "../../types/checkoutItem";

const CheckoutItem: React.FC<CheckoutItemProps> = ({
  image,
  title,
  price,
  oldPrice,
}) => {
  return (
    <Card sx={{ display: "flex", py: 1, boxShadow: "none", gap: 1 }}>
      <CardMedia sx={{ width: 50, height: 50 }} image={image} />
      <CardContent sx={{ flex: 1, p: 0 }}>
        <Typography fontSize={14} fontWeight={600}>
          {title}
        </Typography>
      </CardContent>
      <Box textAlign="right" pr={2}>
        <Typography fontSize={14} fontWeight={700}>
          {formatCurrency(price)}
        </Typography>
        <Typography fontSize={12} sx={{ textDecoration: "line-through" }}>
          {formatCurrency(oldPrice || 0)}
        </Typography>
      </Box>
    </Card>
  );
};

export default CheckoutItem;
