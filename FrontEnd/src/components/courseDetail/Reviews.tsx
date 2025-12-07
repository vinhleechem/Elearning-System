import { Box, Divider, Rating, Typography } from "@mui/material";
import type { ReviewItem } from "../../types/courseDetail";

const Reviews: React.FC<{ items: ReviewItem[] }> = ({ items = [] }) => {
  return (
    <Box mt={3}>
      <Typography variant="h6" fontWeight={800} mb={1.5}>
        Nhận xét
      </Typography>
      {items.map((r) => (
        <Box key={r.id} mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontWeight={700}>{r.user}</Typography>
            <Rating size="small" value={r.rating} readOnly />
            <Typography color="text.secondary" fontSize={12}>
              {r.date}
            </Typography>
          </Box>
          <Typography mt={0.5}>{r.comment}</Typography>
          <Divider sx={{ mt: 1.5 }} />
        </Box>
      ))}
    </Box>
  );
};

export default Reviews;
