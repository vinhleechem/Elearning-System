import { Box, Typography } from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Reusable empty state component
 * Used for empty cart, no courses, etc.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <ShoppingCart sx={{ fontSize: 64, color: "text.disabled" }} />,
  title,
  description,
  action,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 2,
        textAlign: "center",
      }}
    >
      {icon}
      <Typography variant="h6" fontWeight={600} mt={2} color="text.primary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" mt={1}>
          {description}
        </Typography>
      )}
      {action && <Box mt={3}>{action}</Box>}
    </Box>
  );
};

export default EmptyState;
