import { Box, Typography, Rating, Chip, } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LanguageIcon from "@mui/icons-material/Language";

interface CourseHeroProps {
  data: {
    title: string;
    description: string;
    rating: number;
    reviewCount: number;
    studentCount: number;
    lastUpdated: string;
    language: string;
    instructor: {
      name: string;
      avatar: string;
    };
    categories: string[];
    price?: number;
    originalPrice?: number;
    badges?: string[];
  };
}

export default function CourseHero({ data }: CourseHeroProps) {
  // Kiểm tra an toàn cho data
  if (!data) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 3, md: 4 } }}>
      {/* Breadcrumb - Chỉ hiển thị categories nếu có */}
      {data.categories && data.categories.length > 0 && (
        <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.5 }}>
          {data.categories.map((category, index) => (
            <Box key={index} component="span" sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                component="span"
                sx={{
                  color: "#cec0fc", // Udemy-like light purple
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.3px",
                  "&:hover": { color: "#fff" },
                }}
              >
                {category}
              </Typography>
              {index < data.categories.length - 1 && (
                <Typography
                  component="span"
                  sx={{ mx: 1, color: "white", fontSize: "1rem", display: "flex", alignItems: "center" }}
                >
                  ›
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Course Title */}
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "1.75rem", md: "2.5rem" },
          fontWeight: 800,
          mb: 2,
          color: "white",
          lineHeight: 1.2,
        }}
      >
        {data.title || "Thành Thạo Docker Từ Cơ Bản Đến Nâng Cao"}
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        sx={{
          fontSize: "1.125rem",
          mb: 3,
          color: "rgba(255,255,255,0.9)",
          lineHeight: 1.6,
          maxWidth: "800px",
        }}
      >
        {data.description ||
          "Thành thạo Docker trong thực tế: Xây dựng, quản lý và triển khai ứng dụng nhanh chóng và hiệu quả."}
      </Typography>

      {/* Course Tags/Badges - Hiển thị badge động */}
      {data.badges && data.badges.length > 0 && (
        <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
          {data.badges.map((badge, index) => {
            // Customize colors based on badge text content (demo logic)
            let bgcolor = "#eceb98"; // Default yellow-ish
            let color = "#1c1d1f";

            if (badge.toLowerCase().includes("bestseller") || badge.toLowerCase().includes("bán chạy")) {
              bgcolor = "#fbbf24"; // Yellow
            } else if (badge.toLowerCase().includes("new") || badge.toLowerCase().includes("mới")) {
              bgcolor = "#10b981"; // Green
              color = "white";
            } else if (badge.toLowerCase().includes("hot") || badge.toLowerCase().includes("nổi bật")) {
              bgcolor = "#ec4899"; // Pink
              color = "white";
            }

            return (
              <Chip
                key={index}
                label={badge}
                size="small"
                sx={{
                  backgroundColor: bgcolor,
                  color: color,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  height: "24px",
                  borderRadius: "4px",
                  "& .MuiChip-label": { px: 1.5 },
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Rating & Stats */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            sx={{
              color: "#fbbf24",
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            {data.rating || 5.0}
          </Typography>
          <Rating
            value={data.rating || 5.0}
            readOnly
            size="small"
            precision={0.1}
            sx={{
              "& .MuiRating-iconFilled": {
                color: "#fbbf24",
              },
              "& .MuiRating-iconEmpty": {
                color: "rgba(255,255,255,0.3)",
              },
            }}
          />
          <Typography
            sx={{
              color: "#c0c4fc",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.875rem",
              "&:hover": { color: "#60a5fa" },
            }}
          >
            ({(data.reviewCount || 121).toLocaleString()} xếp hạng)
          </Typography>
        </Box>
        <Typography
          sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}
        >
          {(data.studentCount || 1656).toLocaleString()} học viên
        </Typography>
      </Box>

      {/* Instructor */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}
        >
          Được tạo bởi{" "}
          <Typography
            component="span"
            sx={{
              color: "#c0c4fc",
              textDecoration: "underline",
              cursor: "pointer",
              "&:hover": { color: "#60a5fa" },
            }}
          >
            {data.instructor?.name || "AI Coding"}
          </Typography>
        </Typography>
      </Box>

      {/* Course Meta */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CalendarTodayIcon
            sx={{ fontSize: "16px", color: "rgba(255,255,255,0.7)" }}
          />
          <Typography
            sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}
          >
            Lần cập nhật gần đây nhất {data.lastUpdated || "10/2025"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LanguageIcon
            sx={{ fontSize: "16px", color: "rgba(255,255,255,0.7)" }}
          />
          <Typography
            sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}
          >
            {data.language || "Tiếng Việt"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
