import { Box, Typography, Chip, Button } from "@mui/material";
import type { CourseDetailProps } from "../../types/course";
import { TAGS_STYLE } from "../../libs/constants";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const CourseDetailPanel: React.FC<CourseDetailProps> = ({
  title,
  tag,
  description,
  totalHours,
  level,
  updatedAt,
  learningPoints,
  position,
  onMouseEnter,
  onMouseLeave,
}) => {
  const style = tag ? TAGS_STYLE[tag] : null;

  return (
    <Box
      className="absolute bg-white rounded-lg shadow-2xl p-4 w-80"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 10000,
        border: "1px solid #e0e0e0",
        minHeight: "420px", // luôn cao hơn card tiêu chuẩn (~345px + padding)
        maxHeight: "80vh",
        overflow: "visible",
        overflowY: "auto",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Title */}
      <Typography
        variant="h6"
        fontWeight={700}
        fontSize={16}
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
        mb={1}
      >
        {title}
      </Typography>

      {/* Tag */}
      {tag && (
        <Chip
          size="small"
          label={tag}
          className="mb-2"
          sx={{
            backgroundColor: style?.bg,
            color: style?.text,
            fontSize: 12,
            height: 24,
          }}
        />
      )}

      {/* Updated Date */}
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Đã cập nhật {updatedAt}
      </Typography>

      {/* Duration & Level */}
      <Typography variant="body2" color="text.secondary" mb={2}>
        Tổng số {totalHours} - {level}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        fontSize={14}
        mb={2}
      >
        {description}
      </Typography>

      {/* Learning Points */}
      <Box mb={2}>
        <Typography variant="body2" fontWeight={600} mb={1}>
          Bạn sẽ học được:
        </Typography>
        {learningPoints?.map((point, index) => (
          <Box key={index} display="flex" alignItems="flex-start" mb={1}>
            <span className="text-blue-600 mr-2">•</span>
            <Typography
              variant="body2"
              fontSize={13}
            >
              {point}
            </Typography>
          </Box>
        ))}
      </Box>
     
      {/* Add to Cart Button */}
      <Button
        variant="contained"
        fullWidth
        startIcon={<ShoppingCartIcon />}
        sx={{
          backgroundColor: "#3b82f6",
          textTransform: "none",
          fontWeight: 700,
          "&:hover": {
            backgroundColor: "#2563eb",
          },
        }}
      >
        Thêm vào giỏ hàng
      </Button>
    </Box>
  );
};

export default CourseDetailPanel;

