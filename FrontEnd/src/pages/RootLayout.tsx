import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Box } from "@mui/material";

const RootLayout: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet /> {/* cho dat non dung cua route con */}
      </Box>
      <Footer />
    </Box>
  );
};

export default RootLayout;
