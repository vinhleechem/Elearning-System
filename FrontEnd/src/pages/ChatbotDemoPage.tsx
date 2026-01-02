/**
 * Demo Page - Test ChatbotWidget
 * 
 * Trang demo để test chatbot với các scenarios khác nhau
 */

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import ChatbotWidget from "../components/chatbot/ChatbotWidget";

const ChatbotDemoPage: React.FC = () => {
  const [context, setContext] = useState<any>({
    page: "home",
  });

  const [position, setPosition] = useState<
    "bottom-right" | "bottom-left" | "top-right" | "top-left"
  >("bottom-right");

  // Các scenario để test
  const scenarios = [
    {
      name: "Trang chủ",
      context: { page: "home" },
      description: "Câu hỏi chung về nền tảng",
    },
    {
      name: "Chi tiết khóa học",
      context: { page: "course_detail", course_id: 123, course_title: "Python Basic" },
      description: "Câu hỏi về khóa học cụ thể",
    },
    {
      name: "Thanh toán",
      context: { page: "checkout", cart_total: 500000 },
      description: "Câu hỏi về phương thức thanh toán",
    },
    {
      name: "Học tập",
      context: { page: "learning", course_id: 123, lecture_id: 456 },
      description: "Câu hỏi khi đang học",
    },
    {
      name: "Giỏ hàng",
      context: { page: "cart", items_count: 3 },
      description: "Câu hỏi về giỏ hàng",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          🤖 Chatbot Demo
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Test chatbot với các scenarios khác nhau
        </Typography>
      </Box>

      {/* Scenarios */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          📋 Chọn Scenario
        </Typography>
        <Grid container spacing={2}>
          {scenarios.map((scenario, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "all 0.3s",
                  border: "2px solid",
                  borderColor:
                    JSON.stringify(context) === JSON.stringify(scenario.context)
                      ? "primary.main"
                      : "transparent",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => setContext(scenario.context)}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {scenario.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {scenario.description}
                  </Typography>
                  <Chip
                    label={scenario.context.page}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Position Control */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          📍 Vị trí Chatbot
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {["bottom-right", "bottom-left", "top-right", "top-left"].map((pos) => (
            <Button
              key={pos}
              variant={position === pos ? "contained" : "outlined"}
              onClick={() => setPosition(pos as any)}
            >
              {pos}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Current Context Display */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: "grey.100" }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          🔧 Context hiện tại
        </Typography>
        <Box
          component="pre"
          sx={{
            bgcolor: "background.paper",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
            fontSize: "0.875rem",
          }}
        >
          {JSON.stringify(context, null, 2)}
        </Box>
      </Paper>

      {/* Features Info */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          ✨ Tính năng có thể test
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              📝 Chat Features:
            </Typography>
            <ul>
              <li>Typing indicator (hiệu ứng đang gõ)</li>
              <li>Streaming responses</li>
              <li>Message timestamps</li>
              <li>Conversation history</li>
              <li>Message status</li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              🎯 Smart Features:
            </Typography>
            <ul>
              <li>Suggested questions (thay đổi theo context)</li>
              <li>Quick replies buttons</li>
              <li>Feedback system (👍 👎)</li>
              <li>Sources display</li>
              <li>Smart suggestions</li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              📎 Upload Features:
            </Typography>
            <ul>
              <li>Upload hình ảnh (max 5MB)</li>
              <li>Upload documents (max 10MB)</li>
              <li>Supported: JPG, PNG, PDF, DOC, TXT, CSV</li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              🧠 AI Features:
            </Typography>
            <ul>
              <li>Sentiment analysis (phân tích cảm xúc)</li>
              <li>Intent detection (phát hiện ý định)</li>
              <li>Personalized responses</li>
              <li>RAG-powered answers</li>
            </ul>
          </Grid>
        </Grid>
      </Paper>

      {/* Test Instructions */}
      <Paper sx={{ p: 3, bgcolor: "info.light" }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          🧪 Cách test
        </Typography>
        <Typography variant="body1" paragraph>
          1. <strong>Chọn scenario</strong> ở trên để thay đổi context
        </Typography>
        <Typography variant="body1" paragraph>
          2. <strong>Click vào icon chatbot</strong> ở góc màn hình
        </Typography>
        <Typography variant="body1" paragraph>
          3. <strong>Thử các câu hỏi</strong> hoặc click vào suggested questions
        </Typography>
        <Typography variant="body1" paragraph>
          4. <strong>Test upload</strong> bằng cách click vào icon 📷 hoặc 📎
        </Typography>
        <Typography variant="body1" paragraph>
          5. <strong>Đánh giá response</strong> bằng 👍 👎 buttons
        </Typography>
        <Typography variant="body1">
          6. <strong>Xem conversation history</strong> bằng menu (⋮)
        </Typography>
      </Paper>

      {/* Chatbot Widget */}
      <ChatbotWidget context={context} position={position} />
    </Container>
  );
};

export default ChatbotDemoPage;

