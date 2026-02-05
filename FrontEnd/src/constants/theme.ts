/**
 * Theme Constants
 * Centralized color palette and design tokens
 */

export const COLORS = {
  // Primary Colors
  primary: {
    main: "#1976d2",
    dark: "#115293",
    light: "#42a5f5",
  },

  // Background Colors
  background: {
    default: "#ffffff",
    dark: "#1c1d1f",
    gray: "#f3f4f6",
  },

  // Text Colors
  text: {
    primary: "#2d2f31",
    secondary: "#6c757d",
    light: "#d1d7dc",
    white: "#ffffff",
  },

  // Status Colors
  status: {
    success: "#23a26d",
    warning: "#b4690e",
    error: "#ec5252",
    info: "#3b82f6",
  },

  // Border Colors
  border: {
    default: "#d1d7dc",
    light: "#e5e7eb",
    transparent: "rgba(255,255,255,0.2)",
  },

  // Chart Colors
  chart: {
    purple: "#667eea",
    purpleDark: "#764ba2",
    pink: "#f093fb",
    pinkDark: "#f5576c",
    blue: "#4facfe",
    blueLight: "#00f2fe",
    green: "#43e97b",
    greenLight: "#38f9d7",
    teal: "#00C49F",
    yellow: "#FFBB28",
    orange: "#FF8042",
    indigo: "#8884d8",
    mint: "#82ca9d",
    primary: "#0088FE",
  },

  // Gradients
  gradient: {
    purpleIndigo: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    pinkRed: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    blueAqua: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    greenTeal: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },

  // Progress Colors
  progress: {
    incomplete: "#8f2ef9",
    complete: "#23a26d",
    background: "#ececec",
  },

  // Rating Color
  rating: "#f5a623",

  // Shadow
  shadow: {
    light: "0 1px 2px 0 rgba(0,0,0,0.05)",
    medium: "0 2px 8px rgba(0,0,0,0.1)",
  },
} as const;

export const SPACING = {
  gridGap: 2,
  cardBorderRadius: "8px",
} as const;

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;
