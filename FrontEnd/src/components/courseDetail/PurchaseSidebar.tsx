import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { IconButton } from "@mui/material";
import { useWishlistStore } from "../../store/wishlistStore";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface Props {
  courseId: number;
  price: number;
  oldPrice?: number | null;
  ctaDisabled?: boolean;
  sx?: SxProps<Theme>;
  isPurchased?: boolean;
  purchasedAt?: string;
  // Promotion info
  promotionName?: string;
  promotionType?: string;
  discountPercentage?: number;
  promotionEndDate?: string;
}

const formatCurrency = (num: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    num,
  );

const PurchaseSidebar: React.FC<Props> = ({
  courseId,
  price,
  oldPrice,
  ctaDisabled,
  sx,
  isPurchased,
  purchasedAt,
  promotionName,
  promotionType,
  discountPercentage,
  promotionEndDate,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } =
    useWishlistStore();
  const { addToCart, isInCart } = useCartStore();
  const inWishlist = isInWishlist(courseId);
  const inCart = isInCart(courseId);

  const handleWishlistClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (inWishlist) {
      await removeFromWishlist(courseId);
    } else {
      await addToWishlist(courseId);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (inCart) {
      // If already in cart, navigate to cart page
      navigate("/cart");
    } else {
      // Otherwise add to cart
      await addToCart(courseId);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    await addToCart(courseId);
    navigate("/payment/checkout");
  };

  const handleGoToCourse = () => {
    navigate(`/course/${courseId}/learn`);
  };

  const formattedDate = purchasedAt
    ? new Date(purchasedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
    : "";

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!promotionEndDate) return;

    const calculateTimeLeft = () => {
      const endDate = new Date(promotionEndDate);
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [promotionEndDate]);

  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 380,
        ...sx,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 6px 18px rgba(15,15,15,0.06)",
      }}
    >
      {/* Preview image with centered play button */}
      <Box sx={{ position: "relative", height: 220, bgcolor: "grey.900", cursor: "pointer" }}>
        <Box
          component="img"
          src="/images/carousel/carousel-01.png"
          alt="preview"
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0, 0, 0, 0.3)",
            transition: "background-color 0.3s",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.5)",
            }
          }}
        >
          <PlayCircleOutlineIcon
            sx={{
              color: "white",
              fontSize: 80,
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))"
            }}
          />
        </Box>
      </Box>

      <CardContent>
        {isPurchased ? (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
              <Box
                sx={{
                  bgcolor: "#8f2abd",
                  color: "white",
                  borderRadius: "50%",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1.5,
                  flexShrink: 0,
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  i
                </Typography>
              </Box>
              <Typography variant="body1" color="text.primary">
                Bạn đã mua khóa học này vào {formattedDate}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoToCourse}
              sx={{
                mt: 1,
                textTransform: "none",
                borderColor: "#6C2BD9",
                color: "#6C2BD9",
                fontWeight: 700,
                py: 1.5,
                "&:hover": {
                  borderColor: "#5b21b6",
                  bgcolor: "rgba(108, 43, 217, 0.04)",
                },
              }}
            >
              Chuyển đến khóa học
            </Button>
          </Box>
        ) : (
          <>
            <Box
              sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}
            >
              <Typography variant="h5" fontWeight={900}>
                {formatCurrency(price)}
              </Typography>
              {oldPrice && (
                <>
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: "line-through",
                      color: "text.secondary",
                    }}
                  >
                    {formatCurrency(oldPrice)}
                  </Typography>
                  {discountPercentage && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#2d2f31",
                        fontWeight: 700,
                      }}
                    >
                      Giảm {discountPercentage}%
                    </Typography>
                  )}
                </>
              )}
            </Box>

            {timeLeft && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: "#d1293d" }} />
                <Typography variant="caption" sx={{ color: "#d1293d", fontWeight: 700 }}>
                  {timeLeft.hours} giờ {timeLeft.minutes} phút còn lại với mức giá này!
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <Button
                fullWidth
                variant="contained"
                disabled={ctaDisabled}
                onClick={handleAddToCart}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  background: "linear-gradient(180deg, #a435f0 0%, #8710d8 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: 0,
                  boxShadow: "none",
                  "&:hover": {
                    background: "linear-gradient(180deg, #8710d8 0%, #6c0eb5 100%)",
                    boxShadow: "none",
                  },
                  "&:disabled": {
                    background: "#e0e0e0",
                    color: "#9e9e9e"
                  }
                }}
              >
                {inCart ? "Chuyển đến giỏ hàng" : "Thêm vào giỏ hàng"}
              </Button>
              <IconButton
                onClick={handleWishlistClick}
                sx={{
                  border: "2px solid",
                  borderColor: "#2d2f31",
                  borderRadius: "50%",
                  color: inWishlist ? "#ec5252" : "#2d2f31",
                  width: 48,
                  height: 48,
                  "&:hover": {
                    borderColor: "#2d2f31",
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  }
                }}
              >
                {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleBuyNow}
              sx={{
                textTransform: "none",
                borderColor: "#2d2f31",
                color: "#2d2f31",
                fontWeight: 700,
                py: 1.5,
                borderRadius: 0,
                borderWidth: 1,
                "&:hover": {
                  borderColor: "#2d2f31",
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                  borderWidth: 1,
                }
              }}
            >
              Mua ngay
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="caption" sx={{ mb: 0.5, display: "block", color: "text.secondary" }}>
                Đảm bảo hoàn tiền trong 30 ngày
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                Quyền truy cập đầy đủ suốt đời
              </Typography>
            </Box>
          </>
        )}



        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Khóa học này bao gồm:
          </Typography>
          <List dense disablePadding>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="9,5 giờ video theo yêu cầu" />
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="1 bài viết" />
            </ListItem>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="8 tài nguyên có thể tải xuống" />
            </ListItem>
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PurchaseSidebar;
