import React from "react";
import { Link } from "react-router-dom";
import { Box, Container, IconButton, Typography, Stack, Grid, Divider } from "@mui/material";
import {
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  School as SchoolIcon,
} from "@mui/icons-material";

const Footer: React.FC = () => {
  const footerLinks = {
    explore: [
      { label: "Khóa học phổ biến", path: "/courses" },
      { label: "Chủ đề mới", path: "/courses" },
      { label: "Giảng viên nổi bật", path: "/instructors" },
      { label: "Đánh giá học viên", path: "/" },
    ],
    support: [
      { label: "Trung tâm trợ giúp", path: "/help" },
      { label: "Điều khoản dịch vụ", path: "/terms" },
      { label: "Chính sách bảo mật", path: "/privacy" },
      { label: "Liên hệ chúng tôi", path: "/contact" },
    ],
    business: [
      { label: "vidi for Business", path: "/business" },
      { label: "Tuyển dụng", path: "/career" },
      { label: "Hợp tác giảng dạy", path: "/instructor/register" },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#fff",
        borderTop: "1px solid #f1f5f9",
        pt: 6,
        pb: 4,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#2563eb", mb: 3 }}>
              <SchoolIcon sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={900} sx={{ color: "#0f172a", letterSpacing: "-0.02em" }}>
                vidi
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.95rem",
                lineHeight: 1.8,
                mb: 4,
                maxWidth: 320,
              }}
            >
              vidi là nền tảng học tập trực tuyến kết nối hàng triệu học viên với những chuyên gia hàng đầu thế giới để giúp mọi người học những kỹ năng mới và đạt được mục tiêu của mình.
            </Typography>

            <Stack direction="row" spacing={1.5}>
              {[
                { icon: <FacebookIcon fontSize="small" />, color: "#1877f2" },
                { icon: <TwitterIcon fontSize="small" />, color: "#1da1f2" },
                { icon: <LinkedInIcon fontSize="small" />, color: "#0a66c2" }
              ].map((social, idx) => (
                <IconButton
                  key={idx}
                  size="small"
                  sx={{
                    width: 40, height: 40,
                    bgcolor: "#f8fafc",
                    color: "#64748b",
                    transition: "all 0.3s",
                    "&:hover": {
                      bgcolor: "#2563eb",
                      color: "#fff",
                      transform: "translateY(-4px)"
                    }
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Links Sections */}
          <Grid size={{ xs: 6, md: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.1em", mb: 3 }}>
              Khám phá
            </Typography>
            <Stack spacing={2}>
              {footerLinks.explore.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  style={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.2s",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.1em", mb: 3 }}>
              Hỗ trợ
            </Typography>
            <Stack spacing={2}>
              {footerLinks.support.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  style={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.2s",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.1em", mb: 3 }}>
              Doanh nghiệp
            </Typography>
            <Stack spacing={2}>
              {footerLinks.business.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  style={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.2s",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "#f1f5f9" }} />

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500 }}>
            © 2024 vidi Online Learning. Tất cả quyền được bảo lưu.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
