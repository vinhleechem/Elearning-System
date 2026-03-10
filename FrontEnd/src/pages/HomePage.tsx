import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Card,
  Avatar,
  AvatarGroup,
  IconButton,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import CourseList from "../components/course/CourseList";
import PaymentSuccessDialog from "../components/payment/PaymentSuccessDialog";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DevicesIcon from "@mui/icons-material/Devices";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import confetti from "canvas-confetti";

/* ─── Data ─────────────────────────────────────── */
const WHY_VIDI = [
  {
    icon: <SchoolIcon sx={{ fontSize: 32 }} />,
    title: "Giảng viên chuyên nghiệp",
    desc: "Học hỏi trực tiếp từ các chuyên gia hàng đầu và có kinh nghiệm thực chiến trong ngành.",
    color: "#3b82f6",
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 32 }} />,
    title: "Học theo tốc độ của bạn",
    desc: "Không áp lực thời gian, bạn có thể tự do sắp xếp lịch học phù hợp với cuộc sống cá nhân.",
    color: "#3b82f6",
  },
  {
    icon: <DevicesIcon sx={{ fontSize: 32 }} />,
    title: "Đa nền tảng",
    desc: "Truy cập toàn bộ tài liệu và video bài giảng trên mọi thiết bị di động, tablet hay máy tính.",
    color: "#3b82f6",
  },
  {
    icon: <WorkspacePremiumIcon sx={{ fontSize: 32 }} />,
    title: "Chứng chỉ uy tín",
    desc: "Nhận chứng chỉ hoàn thành khóa học có giá trị, giúp bạn nổi bật trong mắt nhà tuyển dụng.",
    color: "#3b82f6",
  },
];

/* ─── Component ─────────────────────────────────── */
const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

  /* payment-success callback */
  useEffect(() => {
    if (searchParams.get("payment_success") === "true") {
      setPaymentOrderId(searchParams.get("orderId"));
      setShowPaymentSuccess(true);
      searchParams.delete("payment_success");
      searchParams.delete("orderId");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  /* confetti for payment success */
  useEffect(() => {
    if (!showPaymentSuccess) return;
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#2563eb", "#93c5fd"]
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#2563eb", "#93c5fd"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [showPaymentSuccess]);

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh" }}>

      {/* ═══════════════════════════════════════
          1. HERO SECTION
      ═══════════════════════════════════════ */}
      <Box
        sx={{
          pt: { xs: 4, md: 8 },
          pb: { xs: 8, md: 12 },
          background: "radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.08) 0%, transparent 40%)",
          overflow: "hidden",
          position: "relative"
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={8} alignItems="center">
            {/* HERO LEFT */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ maxWidth: 620 }}>
                <Typography
                  sx={{
                    display: "inline-block",
                    bgcolor: "rgba(37, 99, 235, 0.08)",
                    color: "#2563eb",
                    px: 2, py: 0.8,
                    borderRadius: "100px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    mb: 4
                  }}
                >
                  Nền tảng học tập 4.0
                </Typography>

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.8rem", sm: "3.5rem", md: "4.2rem" },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    color: "#0f172a",
                    mb: 4,
                    letterSpacing: "-0.02em"
                  }}
                >
                  Đầu tư vào bản thân — <Box component="span" sx={{ color: "#2563eb" }}>khoản đầu tư tốt nhất</Box>
                </Typography>

                <Typography
                  sx={{
                    fontSize: "1.15rem",
                    color: "#64748b",
                    lineHeight: 1.7,
                    mb: 5,
                    maxWidth: 520
                  }}
                >
                  Tham gia cùng hàng ngàn học viên đã thay đổi sự nghiệp của họ thông qua nền tảng học tập hiện đại, linh hoạt và chất lượng của chúng tôi.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 6 }}>
                  <Button
                    component={Link} to="/register"
                    variant="contained"
                    sx={{
                      bgcolor: "#2563eb",
                      color: "white",
                      px: 5, py: 2,
                      borderRadius: "14px",
                      fontWeight: 800,
                      fontSize: "1rem",
                      textTransform: "none",
                      boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
                      "&:hover": {
                        bgcolor: "#1d4ed8",
                        transform: "translateY(-2px)",
                        boxShadow: "0 15px 30px rgba(37, 99, 235, 0.35)",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    Đăng ký miễn phí
                  </Button>
                  <Button
                    component={Link} to="/courses"
                    variant="outlined"
                    sx={{
                      borderColor: "#e2e8f0",
                      color: "#0f172a",
                      px: 5, py: 2,
                      borderRadius: "14px",
                      fontWeight: 700,
                      fontSize: "1rem",
                      textTransform: "none",
                      bgcolor: "white",
                      "&:hover": {
                        borderColor: "#cbd5e1",
                        bgcolor: "#f8fafc",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s"
                    }}
                  >
                    Khám phá khóa học
                  </Button>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 38, height: 38, border: "2px solid #fff" } }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Avatar key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} />
                    ))}
                  </AvatarGroup>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                    <Box component="span" sx={{ color: "#0f172a", fontWeight: 800 }}>10,000+</Box> học viên đang học tập mỗi ngày
                  </Typography>
                </Stack>
              </Box>
            </Grid>

            {/* HERO RIGHT */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: "none", md: "block" } }}>
              <Box sx={{ position: "relative" }}>
                {/* Decorative Blobs */}
                <Box sx={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, bgcolor: "rgba(37, 99, 235, 0.05)", borderRadius: "50%", filter: "blur(60px)", zIndex: 0 }} />
                <Box sx={{ position: "absolute", bottom: -40, left: -40, width: 250, height: 250, bgcolor: "rgba(37, 99, 235, 0.1)", borderRadius: "50%", filter: "blur(50px)", zIndex: 0 }} />

                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                  alt="Students working together"
                  sx={{
                    width: "100%",
                    height: "540px",
                    objectFit: "cover",
                    borderRadius: "32px",
                    boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
                    position: "relative",
                    zIndex: 1,
                    transition: "transform 0.5s ease",
                    "&:hover": { transform: "scale(1.02)" }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════
          2. FEATURED COURSES
      ═══════════════════════════════════════ */}
      <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: "#fff" }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              mb: 6,
              gap: 2,
              flexWrap: "wrap"
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", mb: 1, letterSpacing: "-0.01em" }}>
                Các khóa học nổi bật
              </Typography>
              <Typography variant="body1" sx={{ color: "#64748b" }}>
                Bắt đầu hành trình chinh phục kỹ năng mới ngay hôm nay
              </Typography>
            </Box>
            <Button
              component={Link} to="/courses"
              endIcon={<ArrowForwardIcon />}
              sx={{
                color: "#2563eb",
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(37, 99, 235, 0.05)" }
              }}
            >
              Xem tất cả
            </Button>
          </Box>

          <CourseList />
        </Container>
      </Box>

      {/* ═══════════════════════════════════════
          3. WHY CHOOSE US
      ═══════════════════════════════════════ */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#fff" }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", mb: 2, letterSpacing: "-0.01em" }}>
              Tại sao chọn vidi?
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 600, mx: "auto" }}>
              Nâng tầm kỹ năng của bạn với những lợi ích vượt trội từ nền tảng học tập chuyên nghiệp của chúng tôi.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {WHY_VIDI.map((item, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <Card
                  elevation={0}
                  sx={{
                    p: 5,
                    height: "100%",
                    borderRadius: "24px",
                    border: "1px solid #f1f5f9",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#2563eb",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
                      transform: "translateY(-8px)"
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 72, height: 72,
                      borderRadius: "20px",
                      bgcolor: "rgba(37, 99, 235, 0.1)",
                      color: "#2563eb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      mx: "auto", mb: 3
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: "#0f172a" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6 }}>
                    {item.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════
          4. CTA BANNER
      ═══════════════════════════════════════ */}
      <Box sx={{ py: { xs: 4, md: 6 }, px: 2 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              borderRadius: "40px",
              background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
              p: { xs: 4, md: 8 },
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Background Decorations */}
            <Box sx={{ position: "absolute", top: -80, right: -40, width: 300, height: 300, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(60px)" }} />
            <Box sx={{ position: "absolute", bottom: -80, left: -40, width: 250, height: 250, bgcolor: "rgba(0,0,0,0.05)", borderRadius: "50%", filter: "blur(60px)" }} />

            <Grid container spacing={6} alignItems="center">
              <Grid size={{ xs: 12, lg: 8 }}>
                <Typography variant="h3" sx={{ color: "white", fontWeight: 900, mb: 3, letterSpacing: "-0.01em" }}>
                  Sẵn sàng để bắt đầu?
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "1.2rem", maxWidth: 600, lineHeight: 1.6 }}>
                  Tham gia cộng đồng học tập của chúng tôi ngay hôm nay và nhận ưu đãi 50% cho khóa học đầu tiên.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack direction={{ xs: "column", sm: "row", lg: "column" }} spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: "white",
                      color: "#2563eb",
                      px: 4, py: 2.2,
                      borderRadius: "16px",
                      fontWeight: 800,
                      fontSize: "1rem",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#f8fafc",
                        transform: "scale(1.02)",
                      },
                      transition: "all 0.2s"
                    }}
                  >
                    Bắt đầu ngay
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: "rgba(255,255,255,0.4)",
                      color: "white",
                      px: 4, py: 2.2,
                      borderRadius: "16px",
                      fontWeight: 700,
                      fontSize: "1rem",
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255,255,255,0.1)",
                      }
                    }}
                  >
                    Liên hệ tư vấn
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* ═════ Payment Success Dialog ═════ */}
      <PaymentSuccessDialog
        open={showPaymentSuccess}
        orderId={paymentOrderId}
        onClose={() => setShowPaymentSuccess(false)}
      />
    </Box>
  );
};

export default HomePage;
