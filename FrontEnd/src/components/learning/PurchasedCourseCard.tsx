import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  LinearProgress,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import type { PurchasedCourse } from "../../types/purchasedCourse";
import { MoreVert, Star } from "@mui/icons-material";

interface PurchasedCourseCardProps {
  course: PurchasedCourse;
}

const PurchasedCourseCard: React.FC<PurchasedCourseCardProps> = ({
  course,
}) => {
  return (
    <Card
      component={Link}
      to={`/course/${course.id}/learn`}
      sx={{
        textDecoration: "none",
        borderRadius: 2,
        border: "1px solid #e8e9eb",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
        },
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="120"
          image={course.image}
          alt={course.title}
          sx={{ objectFit: "cover" }}
        />
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(255,255,255,0.9)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Box>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
        <Typography
          gutterBottom
          variant="h6"
          fontWeight={700}
          fontSize={15}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 40,
          }}
        >
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {course.instructor}
        </Typography>
        <Box sx={{ mt: "auto" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
              mb: 1,
            }}
          >
            <Typography variant="body2" fontWeight={600} color="primary">
              {course.progress === 0
                ? "BẮT ĐẦU KHÓA HỌC"
                : `Hoàn thành ${course.progress}%`}
            </Typography>
            {course.rating && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Star sx={{ fontSize: 16, color: "#f5a623" }} />
                <Typography variant="body2" fontSize={13}>
                  Xếp hạng của bạn: {course.rating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={course.progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "#ececec",
              "& .MuiLinearProgress-bar": {
                backgroundColor:
                  course.progress === 100 ? "#23a26d" : "#8f2ef9",
                borderRadius: 3,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PurchasedCourseCard;
