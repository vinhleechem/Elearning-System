import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ChatbotWidget from "../components/chatbot/ChatbotWidget";
import { Box } from "@mui/material";

const RootLayout: React.FC = () => {
  const location = useLocation();
  const hideHeader =
    location.pathname.startsWith("/instructor") ||
    location.pathname.match(/^\/course\/\d+\/learn$/);

  const hideFooter =
    location.pathname.startsWith("/instructor") ||
    location.pathname.match(/^\/course\/\d+\/learn$/);

  // Determine chatbot context based on current page
  const getChatbotContext = () => {
    const path = location.pathname;

    if (path.startsWith("/courses/")) {
      const courseId = path.split("/")[2];
      return {
        page: "course_detail",
        course_id: parseInt(courseId) || undefined,
      };
    } else if (path.startsWith("/learning/")) {
      return { page: "learning" };
    } else if (path.startsWith("/my-learning")) {
      return { page: "my_learning" };
    } else if (path === "/") {
      return { page: "home" };
    }

    return { page: path.replace("/", "") || "home" };
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!hideHeader && <Header />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet /> {/* cho dat non dung cua route con */}
      </Box>
      {!hideFooter && <Footer />}

      {/* AI Chatbot Widget - Available on all pages except instructor */}
      {!location.pathname.startsWith("/instructor") && (
        <ChatbotWidget context={getChatbotContext()} position="bottom-right" />
      )}
    </Box>
  );
};

export default RootLayout;
