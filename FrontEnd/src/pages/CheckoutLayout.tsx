import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import { Box } from "@mui/material";

const CheckoutLayout: React.FC = () => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header checkoutMode={true} />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default CheckoutLayout;
