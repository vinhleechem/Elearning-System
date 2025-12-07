import { createTheme, type ThemeOptions } from "@mui/material";

const theme: ThemeOptions = {
  palette: {
    primary: {
      main: "#3b82f6",
      light: "#60a5fa",
    },
    secondary: {
      main: "#fff",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  typography: {
    fontFamily:
      '"Public Sans Variable", "Public Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
    h1: {
      fontSize: "3.25rem",
      fontWeight: 900,
      lineHeight: 1.02,
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 800,
      lineHeight: 1.06,
    },
    h3: {
      fontSize: "1.875rem",
      fontWeight: 700,
      lineHeight: 1.1,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
};
export default createTheme(theme);
