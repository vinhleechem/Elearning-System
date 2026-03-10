import { useCallback } from "react";
import toast from "react-hot-toast";

// Helper hook to replace notistack's enqueueSnackbar
export const useToast = () => {
  const enqueueSnackbar = useCallback(
    (
      message: string,
      options?: { variant?: "success" | "error" | "warning" | "info" },
    ) => {
      const variant = options?.variant || "info";

      switch (variant) {
        case "success":
          return toast.success(message);
        case "error":
          return toast.error(message);
        case "warning":
          return toast(message, {
            icon: "⚠️",
            style: {
              borderLeft: "4px solid #f59e0b",
              background: "#fffbeb",
              color: "#92400e",
              fontWeight: "500",
            },
          });
        case "info":
          return toast(message, {
            icon: "ℹ️",
            style: {
              borderLeft: "4px solid #3b82f6",
            },
          });
        default:
          return toast(message);
      }
    },
    [],
  );

  return { enqueueSnackbar };
};

// Export direct toast for convenience
export { toast };
