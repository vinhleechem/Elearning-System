import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Typography,
} from "@mui/material";
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
}) => {
  const [ratingValue] = useState<number | null>(rating);
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
        to={`/course/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, "-").slice(0, 60))}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        <Card
          sx={{
            maxWidth: 345,
            cursor: "pointer",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardMedia
            sx={{ height: 150, objectFit: "cover" }}
            image={image}
            title="green iguana"
          />
          <CardContent
            sx={{
              padding: 1,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              gutterBottom
              variant="h5"
              component="div"
              fontSize={16}
              fontWeight={700}
              sx={{
                minHeight: 48,
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              fontSize={13}
              sx={{ color: "text.secondary" }}
            >
              {teacher}
            </Typography>
            <Box display={"flex"} alignItems={"center"} mt={1} gap={0.2}>
              <Typography
                fontSize={13}
                component="legend"
                className="text-dark-200"
                fontWeight={700}
              >
                {rating} stars
              </Typography>
              <Rating
                size="small"
                name="simple-controlled"
                value={ratingValue}
                readOnly
              />
              <Typography
                fontSize={13}
                component="legend"
                sx={{ color: "text.secondary" }}
              >
                {`(${reviews})`}
              </Typography>
            </Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              gap={0.2}
              sx={{ mt: "auto", pt: 1 }}
            >
              <Typography fontSize={18} fontWeight={700}>
                {formatCurrency(price)}
                <Typography
                  component="span"
                  fontSize={14}
                  sx={{ verticalAlign: "super" }}
                ></Typography>
              </Typography>
              {oldPrice && (
                <Typography
                  fontSize={14}
                  sx={{
                    textDecoration: "line-through",
                    color: "text.secondary",
                  }}
                >
                  {formatCurrency(oldPrice)}
                </Typography>
              )}
            </Box>
            {tag && (
              <Chip
                size="small"
                label={tag}
                className="mt-2 px-3 py-1 text-sm font-semibold"
                sx={{
                  alignSelf: "flex-start",
                  width: "fit-content",
                  backgroundColor: style?.bg,
                  color: style?.text,
                }}
              />
            )}
          </CardContent>
        </Card>
      </Link>
      {/* Hover Detail Panel - Render via Portal */}
      {showPanel &&
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
        )}
    </div>
  );
};

export default Course;
