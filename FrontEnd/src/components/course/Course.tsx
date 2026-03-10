import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Typography,
  IconButton,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import type { CourseProps } from "../../types/course";
import { TAGS_STYLE } from "../../libs/constants";
import { formatCurrency } from "../../libs/utils";
import CourseDetailPanel from "./CourseDetailPanel";

const Course: React.FC<CourseProps> = ({
  id,
  title,
  teacher,
  rating,
  reviews,
  price,
  oldPrice,
  image,
  tag,
  description,
  totalHours,
  level,
  updatedAt,
  learningPoints,
  isPurchased,
  slug,
}) => {
  const [showPanel, setShowPanel] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const [panelSide, setPanelSide] = useState<"left" | "right">("right");
  const timeoutRef = useRef<number | null>(null);

  const style = tag ? TAGS_STYLE[tag] : null;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    // Clear timeout nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const panelWidth = 320; // khớp với width w-80 của panel
    const gap = 12;

    const rawY = rect.top + window.scrollY - 120; // đẩy panel lên trên 120px
    const minY = window.scrollY + 16; // không vượt quá mép trên
    const maxY = window.scrollY + window.innerHeight - 220; // tránh tràn đáy (ước lượng chiều cao panel)
    const clampedY = Math.min(Math.max(rawY, minY), maxY);

    const preferredX = rect.right + window.scrollX + gap;
    const viewportRight = window.scrollX + window.innerWidth;
    const fitsOnRight = preferredX + panelWidth <= viewportRight;
    const fallbackX = Math.max(
      rect.left + window.scrollX - panelWidth - gap,
      window.scrollX + gap,
    );

    setPanelPosition({
      x: fitsOnRight ? preferredX : fallbackX,
      y: clampedY,
    });
    setPanelSide(fitsOnRight ? "right" : "left");
    setShowPanel(true);
  };

  const handleMouseLeave = () => {
    // Delay để có thể di chuột vào panel
    timeoutRef.current = setTimeout(() => {
      setShowPanel(false);
    }, 100);
  };

  const handlePanelMouseEnter = () => {
    // Clear timeout khi hover vào panel
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handlePanelMouseLeave = () => {
    setShowPanel(false);
  };

  return (
    <div
      style={{ height: "100%" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={`/course/${slug || encodeURIComponent(title.toLowerCase().replace(/\s+/g, "-").slice(0, 60))}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <Card
          sx={{
            maxWidth: 345,
            cursor: "pointer",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 12px 24px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)",
              borderColor: "primary.main",
            },
          }}
        >
          {/* Image Container with Overlay */}
          <Box sx={{ position: "relative", overflow: "hidden" }}>
            <CardMedia
              sx={{
                height: 180,
                objectFit: "cover",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
              image={image}
              title={title}
            />
            {/* Tag Overlay */}
            {tag && (
              <Chip
                size="small"
                label={tag}
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  backgroundColor: style?.bg,
                  color: style?.text,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              />
            )}
          </Box>

          <CardContent
            sx={{
              padding: 2.5,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {/* Title */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontSize: "1rem",
                fontWeight: 700,
                lineHeight: 1.4,
                minHeight: 44,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                color: "text.primary",
                mb: 0.5,
              }}
            >
              {title}
            </Typography>

            {/* Teacher */}
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.875rem",
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              {teacher}
            </Typography>

            {/* Rating */}
            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "warning.main",
                }}
              >
                {(rating || 0).toFixed(1)}
              </Typography>
              <Rating
                size="small"
                name="course-rating"
                value={rating || 0}
                readOnly
                precision={0.1}
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "warning.main",
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: "text.secondary",
                  ml: 0.5,
                }}
              >
                ({reviews})
              </Typography>
            </Box>

            {/* Price & Cart */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: "auto", pt: 1.5 }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  {formatCurrency(price)}
                </Typography>
                {oldPrice && (
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      textDecoration: "line-through",
                      color: "text.disabled",
                    }}
                  >
                    {formatCurrency(oldPrice)}
                  </Typography>
                )}
              </Box>

              <IconButton
                size="small"
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#2563eb",
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "#2563eb", color: "white" }
                }}
              >
                <AddShoppingCartIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Link>
      {/* Hover Detail Panel - Render via Portal */}
      {
        showPanel &&
        createPortal(
          <CourseDetailPanel
            id={id}
            title={title}
            tag={tag}
            description={description}
            totalHours={totalHours}
            level={level}
            updatedAt={updatedAt}
            learningPoints={learningPoints}
            position={panelPosition}
            side={panelSide}
            onMouseEnter={handlePanelMouseEnter}
            onMouseLeave={handlePanelMouseLeave}
            isPurchased={isPurchased}
          />,
          document.body,
        )
      }
    </div >
  );
};

export default Course;
