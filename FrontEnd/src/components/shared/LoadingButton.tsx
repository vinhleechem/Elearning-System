import { Button, type ButtonProps, CircularProgress } from "@mui/material";
import { forwardRef } from "react";

interface LoadingButtonProps extends Omit<ButtonProps, "disabled"> {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Button with integrated loading state
 * Replaces duplicate loading logic across components
 */
export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText, children, startIcon, ...props }, ref) => {
    return (
      <Button
        {...props}
        ref={ref}
        disabled={loading || props.disabled}
        startIcon={
          loading ? <CircularProgress size={16} color="inherit" /> : startIcon
        }
      >
        {loading && loadingText ? loadingText : children}
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";

export default LoadingButton;
