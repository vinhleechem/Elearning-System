import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Rating,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { formatCurrency } from "../../libs/utils";
import { TAGS_STYLE } from "../../libs/constants";
import type { CartItemProps } from "../../types/cartItem";
import Button from "../ui/Button";
import { Sell } from "@mui/icons-material";

const CartItem: React.FC<CartItemProps> = ({
  id,
  title,
  author,
  rating,
  reviews,
  price,
  oldPrice,
  image,
  tag,
  lesson,
  duration,
}) => {
  const [ratingValue, setRatingValue] = useState<number | null>(rating || 0);
  const style = tag ? TAGS_STYLE[tag] : null;

  return (
    <>
      <Divider /> {/* Dấu gạch ngang */}
      <Card
        sx={{
          display: "grid",
          gridTemplateColumns: "120px 1fr auto auto",
          gap: 2,
          boxShadow: "none",
          py: 2,
        }}
      >
        <CardMedia
          sx={{ width: 120, height: 68, objectFit: "cover" }}
          image={image}
          title="course image"
        />
        <CardContent sx={{ padding: 0 }}>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            fontSize={16}
            fontWeight={700}
            sx={{
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
            fontSize={12}
            sx={{ color: "text.secondary" }}
          >
            {author}
          </Typography>
          <Box display={"flex"} alignItems={"center"} mt={1} gap={0.5}>
            {tag && (
              <Chip
                size="small"
                label={tag}
                className="px-3 py-1 text-sm font-semibold"
                sx={{
                  backgroundColor: style?.bg,
                  color: style?.text,
                }}
              />
            )}
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
              onChange={(event, newValue) => {
                setRatingValue(newValue);
              }}
              readOnly
            />
            <Typography
              fontSize={13}
              component="legend"
              sx={{ color: "text.secondary" }}
            >
              {`(${reviews} xếp hạng)`}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            fontSize={12}
            sx={{ color: "text.secondary", mt: 1 }}
          >
            Tổng số {lesson} • {duration} giờ • Tất cả cấp độ
          </Typography>
        </CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            pr: 2,
            gap: 1,
          }}
        >
          <Button variant="text" sx={{ p: 0, textTransform: "none" }}>
            Xóa
          </Button>
          <Button variant="text" sx={{ p: 0, textTransform: "none" }}>
            Lưu để mua sau
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            pr: 2,
          }}
        >
          <Typography
            fontSize={15}
            fontWeight={700}
            color="primary"
            sx={{ mb: 0.5 }}
          >
            {formatCurrency(price)} <Sell fontSize="small" />
          </Typography>
          <Typography
            fontSize={12}
            color="primary.light"
            sx={{ textDecoration: "line-through" }}
          >
            {formatCurrency(oldPrice || 0)}
          </Typography>
        </Box>
      </Card>
    </>
  );
};

export default CartItem;
