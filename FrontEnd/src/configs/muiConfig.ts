import { createTheme, type ThemeOptions } from "@mui/material";

const theme: ThemeOptions = {
  palette: {
    primary: {
      main: "#A435F0",
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
};
export default createTheme(theme);
