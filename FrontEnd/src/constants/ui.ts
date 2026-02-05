/**
 * UI Constants
 * Reusable style patterns and configurations
 */

export const BUTTON_STYLES = {
  pill: {
    borderRadius: "50px",
    textTransform: "none" as const,
    paddingX: 2,
    paddingY: 0.5,
  },
  outlined: {
    borderColor: "#ccc",
    color: "#000",
    "&:hover": {
      borderColor: "#808080",
    },
  },
} as const;

export const GRID_CONFIGS = {
  courseGrid: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    lg: "repeat(3, 1fr)",
    xl: "repeat(4, 1fr)",
  },
  wishlistGrid: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    lg: "repeat(4, 1fr)",
    xl: "repeat(5, 1fr)",
  },
  standardGrid: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    lg: "repeat(4, 1fr)",
  },
} as const;

export const ANIMATION = {
  duration: {
    short: 200,
    medium: 300,
    long: 500,
  },
  easing: {
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    enter: "cubic-bezier(0, 0, 0.2, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  modal: 1300,
  tooltip: 1500,
  popover: 1600,
} as const;
