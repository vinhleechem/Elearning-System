import { Box, Typography, Chip, Button, IconButton } from "@mui/material";
import type { CourseDetailProps } from "../../types/course";
import { TAGS_STYLE } from "../../libs/constants";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useNavigate } from "react-router-dom";

const CourseDetailPanel: React.FC<CourseDetailProps> = ({
  id,
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
  isPurchased,
}) => {
  const style = tag ? TAGS_STYLE[tag] : null;
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const { addToCart, isInCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const inCart = isInCart(id);
  const inWishlist = isInWishlist(id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation if inside a link
    setLoading(true);
    try {
      await addToCart(id);
      enqueueSnackbar("Đã thêm khóa học vào giỏ hàng", { variant: "success" });
    } catch (error: any) {
      console.error("Add to cart error:", error);
      enqueueSnackbar(error.message || "Không thể thêm vào giỏ hàng", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (inWishlist) {
        await removeFromWishlist(id);
        enqueueSnackbar("Đã xóa khỏi danh sách yêu thích", { variant: "info" });
      } else {
        await addToWishlist(id);
        enqueueSnackbar("Đã thêm vào danh sách yêu thích", { variant: "success" });
      }
    } catch (error: any) {
      console.error("Wishlist error:", error);
      enqueueSnackbar(error.message || "Có lỗi xảy ra", { variant: "error" });
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPurchased) {
      navigate(`/course/${id}/learn`);
      return;
    }
    if (inCart) {
      navigate("/cart");
    } else {
      handleAddToCart(e);
    }
  };

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

      {/* Buttons Container */}
      <Box display="flex" alignItems="center" gap={1}>
        {/* Add to Cart Button */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCartIcon />}
          onClick={handleButtonClick}
          disabled={loading}
          sx={{
            backgroundColor: "#3b82f6", // System Blue
            textTransform: "none",
            fontWeight: 700,
            height: 48,
            fontSize: 16,
            "&:hover": {
              backgroundColor: "#2563eb",
            },
          }}
        >
          {loading ? "Đang thêm..." : isPurchased ? "Vào học ngay" : inCart ? "Chuyển đến giỏ hàng" : "Thêm vào giỏ hàng"}
        </Button>

        {/* Wishlist Button */}
        <IconButton
          onClick={handleToggleWishlist}
          sx={{
            width: 48,
            height: 48,
            border: "1px solid #2d2f31", // Default border
            borderColor: inWishlist ? "#3b82f6" : "#2d2f31",
            color: inWishlist ? "#3b82f6" : "#2d2f31",
            "&:hover": {
              bgcolor: "rgba(59, 130, 246, 0.04)",
            },
          }}
        >
          {inWishlist ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default CourseDetailPanel;
