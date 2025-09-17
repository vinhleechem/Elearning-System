type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant; // Light or solid variant
  size?: BadgeSize; // Badge size
  color?: BadgeColor; // Badge color
  startIcon?: React.ReactNode; // Icon at the start
  endIcon?: React.ReactNode; // Icon at the end
  children: React.ReactNode; // Badge content
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  // Define size styles
  const sizeStyles = {
    sm: "text-theme-xs", // Smaller padding and font size
    md: "text-sm", // Default padding and font size
  };

  // Define color styles for variants
  const variants: Record<BadgeVariant, Record<BadgeColor, string>> = {
    light: {
      primary:
        "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
      success: "bg-success-50 text-success-500",
      error: "bg-error-50 text-error-500",
      warning: "bg-warning-50 text-warning-500",
      info: "bg-sky-50 text-sky-600",
      light: "bg-gray-100 text-gray-700",
      dark: "bg-gray-500 text-white",
    },
    solid: {
      primary: "bg-blue-600 text-white",
      success: "bg-success-500 text-white",
      error: "bg-error-500 text-white",
      warning: "bg-warning-500 text-white",
      info: "bg-sky-500 text-white",
      light: "bg-gray-400 text-white",
      dark: "bg-gray-700 text-white",
    },
  };

  // Get styles based on size and color variant
  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
