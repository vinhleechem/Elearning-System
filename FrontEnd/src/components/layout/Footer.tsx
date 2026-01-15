import React from "react";
import { Link } from "react-router-dom";
import { Box, Container, IconButton } from "@mui/material";
import {
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
} from "@mui/icons-material";

const Footer: React.FC = () => {
  const footerLinks = {
    quickLinks: [
      { label: "Trang chủ", path: "/" },
      { label: "Khóa học", path: "/courses" },
      { label: "Giảng viên", path: "/instructors" },
      { label: "Bảng giá", path: "/pricing" },
    ],
    topics: [
      { label: "Phát triển", path: "/courses?category=development" },
      { label: "Thiết kế", path: "/courses?category=design" },
      { label: "Marketing", path: "/courses?category=marketing" },
      { label: "Kinh doanh", path: "/courses?category=business" },
    ],
    support: [
      { label: "Trung tâm trợ giúp", path: "/help" },
      { label: "Câu hỏi thường gặp", path: "/faq" },
      { label: "Liên hệ", path: "/contact" },
      { label: "Cộng đồng", path: "/community" },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#f8f9fa",
        borderTop: "1px solid #e9ecef",
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="xl">
        {/* Main Footer Content */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "2fr repeat(3, 1fr)",
            },
            gap: 4,
            mb: 4,
          }}
        >
          {/* Brand Section */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#6366f1",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                }}
              >
                vidi
              </Box>
            </Box>
            <Box
              sx={{
                color: "#6c757d",
                fontSize: "0.875rem",
                lineHeight: 1.7,
                mb: 3,
                maxWidth: "280px",
              }}
            >
              Vidi là nền tảng học tập trực tuyến hàng đầu tại Việt Nam, kết nối
              hàng triệu học viên với những chuyên gia và kiến thức trực tế nhất
              để thay đổi sự nghiệp.
            </Box>
            {/* Social Media Icons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                component="a"
                href="https://facebook.com"
                target="_blank"
                size="small"
                sx={{
                  color: "#6c757d",
                  "&:hover": { color: "#1877f2", bgcolor: "#f0f2f5" },
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                component="a"
                href="https://linkedin.com"
                target="_blank"
                size="small"
                sx={{
                  color: "#6c757d",
                  "&:hover": { color: "#0a66c2", bgcolor: "#f0f2f5" },
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton
                component="a"
                href="https://instagram.com"
                target="_blank"
                size="small"
                sx={{
                  color: "#6c757d",
                  "&:hover": { color: "#e4405f", bgcolor: "#f0f2f5" },
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box>
            <Box
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#212529",
                mb: 2,
              }}
            >
              Liên kết nhanh
            </Box>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {footerLinks.quickLinks.map((link) => (
                <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                  <Link
                    to={link.path}
                    style={{
                      color: "#6c757d",
                      fontSize: "0.875rem",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#6366f1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#6c757d";
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Topics */}
          <Box>
            <Box
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#212529",
                mb: 2,
              }}
            >
              Chủ đề
            </Box>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {footerLinks.topics.map((link) => (
                <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                  <Link
                    to={link.path}
                    style={{
                      color: "#6c757d",
                      fontSize: "0.875rem",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#6366f1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#6c757d";
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Support */}
          <Box>
            <Box
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#212529",
                mb: 2,
              }}
            >
              Hỗ trợ
            </Box>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {footerLinks.support.map((link) => (
                <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                  <Link
                    to={link.path}
                    style={{
                      color: "#6c757d",
                      fontSize: "0.875rem",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#6366f1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#6c757d";
                    }}
                  >
                    {link.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: "1px solid #e9ecef",
            pt: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Copyright */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.75rem",
              color: "#6c757d",
            }}
          >
            <Box component="span" sx={{ mr: 0.5 }}>
              🌙
            </Box>
            <Box component="span">
              © Vidi eLearning. All rights reserved. Made with ❤️ for better
              education.
            </Box>
          </Box>

          {/* Legal Links */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              fontSize: "0.75rem",
            }}
          >
            <Link
              to="/privacy"
              style={{
                color: "#6c757d",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#6366f1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#6c757d";
              }}
            >
              Chính sách bảo mật
            </Link>
            <Link
              to="/terms"
              style={{
                color: "#6c757d",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#6366f1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#6c757d";
              }}
            >
              Điều khoản dịch vụ
            </Link>
            <Link
              to="/cookies"
              style={{
                color: "#6c757d",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#6366f1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#6c757d";
              }}
            >
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
