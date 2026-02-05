import React from "react";
import { Box, Typography, Divider, Paper, Stack, Chip } from "@mui/material";
import type { DiscountCalculationResponse } from "../../types/voucher";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CampaignIcon from "@mui/icons-material/Campaign";
import { formatCurrency } from "../../libs/utils";

interface DiscountSummaryProps {
  discountCalculation: DiscountCalculationResponse | null;
}

export const DiscountSummary: React.FC<DiscountSummaryProps> = ({
  discountCalculation,
}) => {
  if (!discountCalculation) {
    return null;
  }

  const getDiscountIcon = (type: string) => {
    return type === "PROMOTION" ? <CampaignIcon /> : <LocalOfferIcon />;
  };

  const getDiscountColor = (type: string) => {
    return type === "PROMOTION" ? "primary" : "success";
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Chi tiết thanh toán
      </Typography>

      {/* Subtotal */}
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body1">Tạm tính:</Typography>
        <Typography variant="body1" fontWeight={500}>
          {formatCurrency(discountCalculation.subtotal)}
        </Typography>
      </Box>

      {/* Applied Discounts */}
      {discountCalculation.discounts &&
        discountCalculation.discounts.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Giảm giá áp dụng:
            </Typography>
            <Stack spacing={1.5}>
              {discountCalculation.discounts.map((discount, index) => (
                <Box key={index}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    {getDiscountIcon(discount.type)}
                    <Chip
                      label={
                        discount.type === "PROMOTION" ? "Khuyến mãi" : "Voucher"
                      }
                      size="small"
                      color={getDiscountColor(discount.type)}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {discount.name}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    pl={5}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {discount.description}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={getDiscountColor(discount.type) + ".main"}
                    >
                      -{formatCurrency(discount.amount)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </>
        )}

      {/* Total Discount */}
      {discountCalculation.totalDiscount > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body1" fontWeight={600} color="success.main">
              Tổng giảm giá:
            </Typography>
            <Typography variant="body1" fontWeight={600} color="success.main">
              -{formatCurrency(discountCalculation.totalDiscount)}
            </Typography>
          </Box>
        </>
      )}

      {/* Final Amount */}
      <Divider sx={{ my: 2 }} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700}>
          Tổng thanh toán:
        </Typography>
        <Typography variant="h5" fontWeight={700} color="primary">
          {formatCurrency(discountCalculation.finalAmount)}
        </Typography>
      </Box>

      {/* Savings Summary */}
      {discountCalculation.totalDiscount > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            backgroundColor: "success.50",
            borderRadius: 1,
          }}
        >
          <Typography
            variant="body2"
            textAlign="center"
            color="success.dark"
            fontWeight={600}
          >
            🎉 Bạn đã tiết kiệm được{" "}
            {formatCurrency(discountCalculation.totalDiscount)}!
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DiscountSummary;
