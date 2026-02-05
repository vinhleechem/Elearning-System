import { Box, CircularProgress, type SxProps, type Theme } from "@mui/material";

interface LoadingSpinnerProps {
  size?: number;
  fullPage?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Reusable loading spinner component
 * Can be used as inline or full-page loader
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  fullPage = false,
  sx,
}) => {
  const containerSx: SxProps<Theme> = fullPage
    ? {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        ...sx,
      }
    : {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        ...sx,
      };

  return (
    <Box sx={containerSx}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingSpinner;
