import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Box } from "@mui/material";

const RootLayout: React.FC = () => {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith("/instructor");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!hideHeader && <Header />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet /> {/* cho dat non dung cua route con */}
      </Box>
      <Footer />
    </Box>
  );
};

export default RootLayout;
