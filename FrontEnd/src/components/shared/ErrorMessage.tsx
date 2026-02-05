import { Alert, AlertTitle, Box, type AlertProps } from "@mui/material";

interface ErrorMessageProps extends Omit<AlertProps, "severity"> {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/**
 * Reusable error message component
 * Standardizes error display across the app
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Lỗi",
  message,
  onRetry,
  ...props
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error" {...props}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
        {onRetry && (
          <Box sx={{ mt: 1 }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onRetry();
              }}
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              Thử lại
            </a>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
