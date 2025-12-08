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
import { IconButton } from "@mui/material";
import { useWishlistStore } from "../../store/wishlistStore";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

interface Props {
  courseId: number;
  price: number;
  oldPrice?: number | null;
  ctaDisabled?: boolean;
  sx?: SxProps<Theme>;
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
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(courseId);

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

  // reference oldPrice in a no-op to avoid any false-positive unused-var linting
  void oldPrice;
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
      {/* Preview image with centered play circle */}
      <Box sx={{ position: "relative", height: 220, bgcolor: "grey.900" }}>
        <Box
          component="img"
          src="/images/carousel/carousel-01.png"
          alt="preview"
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              bgcolor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "common.white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlayCircleOutlineIcon sx={{ color: "#000", fontSize: 32 }} />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            left: 12,
            color: "common.white",
            fontWeight: 700,
          }}
        >
          Xem trước khóa học này
        </Box>
      </Box>

      <CardContent>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5 }}>
          {formatCurrency(price)}
        </Typography>
        {oldPrice ? (
          <Typography
            variant="body2"
            sx={{
              textDecoration: "line-through",
              color: "text.secondary",
              mb: 1,
            }}
          >
            {formatCurrency(oldPrice)}
          </Typography>
        ) : null}

        <Button
          fullWidth
          variant="contained"
          disabled={ctaDisabled}
          sx={{
            background: "linear-gradient(180deg,#7C2AE8,#6C2BD9)",
            color: "#fff",
            textTransform: "none",
            py: 1.5,
            fontWeight: 700,
            borderRadius: 1,
          }}
        >
          Chuyển đến giỏ hàng
        </Button>
        <Button
          fullWidth
          variant="outlined"
          sx={{
            mt: 1,
            textTransform: "none",
            borderColor: "#6C2BD9",
            color: "#6C2BD9",
          }}
        >
          Mua ngay
        </Button>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <IconButton
            onClick={handleWishlistClick}
            sx={{
              border: "1px solid",
              borderColor: inWishlist ? "error.main" : "divider",
              color: inWishlist ? "error.main" : "text.secondary",
              "&:hover": {
                borderColor: "error.dark",
                color: "error.dark",
              }
            }}
          >
            {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="center"
          sx={{ mt: 1 }}
        >
          Đảm bảo hoàn tiền trong 30 ngày
        </Typography>

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
