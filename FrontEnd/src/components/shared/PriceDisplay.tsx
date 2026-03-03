import { Box, Typography, Chip, type SxProps, type Theme } from "@mui/material";
import { formatCurrency } from "../../libs/utils";

interface PriceDisplayProps {
  current: number;
  original?: number | null;
  discountPercent?: number | null;
  size?: "small" | "medium" | "large";
  orientation?: "horizontal" | "vertical";
  sx?: SxProps<Theme>;
}

/**
 * Reusable component for displaying prices with discount information
 * Used across Cart, Checkout, Course cards, etc.
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  current,
  original,
  discountPercent,
  size = "medium",
  orientation = "horizontal",
  sx,
}) => {
  const hasDiscount = original != null && original > current;

  const currentPriceVariant =
    size === "large" ? "h4" : size === "medium" ? "h6" : "body1";
  const originalPriceVariant = size === "large" ? "body1" : "body2";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: orientation === "vertical" ? "column" : "row",
        alignItems: orientation === "vertical" ? "flex-start" : "center",
        gap: 1,
        ...sx,
      }}
    >
      <Typography
        variant={currentPriceVariant}
        fontWeight={700}
        color="primary"
      >
        {formatCurrency(current)}
      </Typography>

      {hasDiscount && (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography
            variant={originalPriceVariant}
            sx={{
              textDecoration: "line-through",
              color: "text.secondary",
            }}
          >
            {formatCurrency(original)}
          </Typography>

          {discountPercent != null && discountPercent > 0 && (
            <Chip
              label={`-${discountPercent}%`}
              color="success"
              size="small"
              sx={{ height: 20, fontSize: 11 }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default PriceDisplay;
