import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import theme from "./configs/muiConfig";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
createRoot(document.getElementById("root")!).render(
  <MuiThemeProvider theme={theme}>
    <RouterProvider router={router} />
  </MuiThemeProvider>,
);
