import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";

interface Related {
  id: string;
  title: string;
  rating: number;
  price: number;
  image: string;
}

interface Props {
  courses?: Related[];
}

const RelatedCourses: React.FC<Props> = ({ courses }) => {
  if (!courses || courses.length === 0) return null;
  return (
    <Box mt={4}>
      <Typography variant="h6" fontWeight={800} mb={1.5}>
        Khóa học liên quan
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        {courses.map((c) => (
          <Box key={c.id}>
            <Card>
              <CardMedia
                component="img"
                image={c.image}
                alt={c.title}
                sx={{ height: 120, objectFit: 'cover' }}
              />
              <CardContent>
                <Typography
                  fontWeight={700}
                  fontSize={14}
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {c.title}
                </Typography>
                <Typography color="text.secondary" fontSize={13}>
                  {c.rating} ★
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RelatedCourses;
