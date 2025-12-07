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
  };
}

export default function CourseHero({ data }: CourseHeroProps) {
  // Kiểm tra an toàn cho data
  if (!data) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 3, md: 4 } }}>
            {/* Breadcrumb */}
            <Box sx={{ mb: 2 }}>
              {data.categories &&
                data.categories.map((category, index) => (
                  <Typography
                    key={index}
                    component="span"
                    sx={{
                      color: "#c0c4fc",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      textDecoration: "underline",
                      cursor: "pointer",
                      "&:hover": { color: "#a855f7" },
                    }}
                  >
                    {category}
                    {index < data.categories.length - 1 && (
                      <Typography
                        component="span"
                        sx={{ mx: 1, color: "white", textDecoration: "none" }}
                      >
                        &gt;
                      </Typography>
                    )}
                  </Typography>
                ))}
            </Box>

            {/* Course Title */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2rem", md: "2rem" },
                fontWeight: 700,
                mb: 2,
                color: "white",
              }}
            >
              {data.title || "Thành Thạo Docker Từ Cơ Bản Đến Nâng Cao"}
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                fontSize: "1rem",
                mb: 2,
              }}
            >
              {data.description ||
                "Thành thạo Docker trong thực tế: Xây dựng, quản lý và triển khai ứng dụng nhanh chóng và hiệu quả."}
            </Typography>

            {/* Course Tags */}
            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
              <Chip
                label="Xếp hạng cao nhất"
                size="small"
                sx={{
                  backgroundColor: "#fbbf24",
                  color: "#1c1d1f",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  height: "24px",
                }}
              />
              <Chip
                label="Thịnh hành & mới"
                size="small"
                sx={{
                  backgroundColor: "#ec4899",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  height: "24px",
                }}
              />
            </Box>

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
