import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { CourseProps } from "../../types/course";
import { TAGS_STYLE } from "../../libs/constants";
import { formatCurrency } from "../../libs/utils";

const Course: React.FC<CourseProps> = ({
  title,
  teacher,
  rating,
  reviews,
  price,
  oldPrice,
  image,
  tag,
}) => {
  const [ratingValue, setRatingValue] = useState<number | null>(2);
  const style = tag ? TAGS_STYLE[tag] : null;
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        sx={{ height: 150, objectFit: "cover" }}
        image={image}
        title="green iguana"
      />
      <CardContent sx={{ padding: 1 }}>
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
            {`(${reviews})`}
          </Typography>
        </Box>
        <Box display={"flex"} alignItems={"center"} mt={1} gap={0.2}>
          <Typography fontSize={18} fontWeight={700}>
            {formatCurrency(price)}
            <Typography
              component="span"
              fontSize={14}
              sx={{ verticalAlign: "super" }} // làm chữ nhỏ và bay lên trên
            ></Typography>
          </Typography>
          {oldPrice && (
            <Typography
              fontSize={14}
              sx={{ textDecoration: "line-through", color: "text.secondary" }}
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
              backgroundColor: style?.bg,
              color: style?.text,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Course;
