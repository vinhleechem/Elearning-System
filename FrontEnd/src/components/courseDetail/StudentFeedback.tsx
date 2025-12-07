import { Box, LinearProgress, Rating, Typography } from "@mui/material";
import type { ReviewsSummary } from "../../types/courseDetail";

interface Props {
  summary?: ReviewsSummary;
}

const StudentFeedback: React.FC<Props> = ({ summary }) => {
  if (!summary) return null;

  // distribution is number[] counts for [5,4,3,2,1]
  const counts = Array.isArray(summary.distribution)
    ? summary.distribution
    : [];
  const total = counts.reduce((a, b) => a + (b || 0), 0) || summary.count || 0;

  const distribution = counts.map((c, i) => ({
    stars: 5 - i,
    percent: total ? Math.round((c * 100) / total) : 0,
  }));

  return (
    <Box mt={3}>
      <Typography variant="h6" fontWeight={800} mb={1.5}>
        Đánh giá của học viên
      </Typography>

      <Box display="flex" gap={4} alignItems="center" mb={2}>
        <Box textAlign="center">
          <Typography variant="h3" fontWeight={800}>
            {(summary.average ?? 0).toFixed(1)}
          </Typography>
          <Rating value={summary.average ?? 0} precision={0.1} readOnly />
          <Typography color="text.secondary">
            {summary.count ?? 0} đánh giá
          </Typography>
        </Box>

        <Box flex={1}>
          {distribution.map((d) => (
            <Box
              key={d.stars}
              display="flex"
              alignItems="center"
              gap={1}
              mb={0.5}
            >
              <Typography width={28}>{d.stars}★</Typography>
              <LinearProgress
                variant="determinate"
                value={d.percent}
                sx={{ flex: 1, height: 8, borderRadius: 1 }}
              />
              <Typography width={40} textAlign="right">
                {d.percent}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default StudentFeedback;
