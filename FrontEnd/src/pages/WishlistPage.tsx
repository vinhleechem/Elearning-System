import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Rating,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import {  Favorite} from "@mui/icons-material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../libs/utils";

interface WishlistCourse {
  id: number;
  slug: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice?: number;
  image: string;
  tag?: string;
  level: string;
  totalHours: string;
  updatedAt: string;
}

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistCourses, setWishlistCourses] = useState<WishlistCourse[]>([
    {
      id: 1,
      slug: "java-spring-restful-apis",
      title: "Java Spring RESTful APIs - Xây Dựng Backend với Spring Boot",
      instructor: "Hỏi Dân IT với Eric",
      rating: 4.8,
      reviews: 143,
      price: 1799000,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Bán chạy nhất",
      level: "Tất cả các cấp độ",
      totalHours: "25,5 giờ",
      updatedAt: "tháng 11 năm 2025",
    },
    {
      id: 2,
      slug: "docker-mastery",
      title: "Thành Thạo Docker Từ Cơ Bản Đến Nâng Cao",
      instructor: "Vinh Lê Quang",
      rating: 5.0,
      reviews: 1655,
      price: 279000,
      oldPrice: 659000,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Hot",
      level: "Trung cấp",
      totalHours: "9,5 giờ",
      updatedAt: "tháng 10 năm 2025",
    },
  ]);

  const handleRemoveFromWishlist = (courseId: number) => {
    setWishlistCourses(wishlistCourses.filter((c) => c.id !== courseId));
  };

  const handleAddToCart = (courseId: number) => {
    console.log("Add to cart:", courseId);
    // Logic thêm vào giỏ hàng
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate("/my-learning");
    else if (newValue === 1) navigate("/my-learning");
    // Tab 2 là wishlist - đang ở đây rồi
  };

  return (
    <>
      <Box sx={{ bgcolor: "#1c1d1f", color: "white", py: 3 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, lg: 4 } }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
            Học tập
          </Typography>
          <Tabs
            value={2}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              "& .MuiTab-root": {
                color: "#d1d7dc",
                textTransform: "none",
                fontSize: 16,
                fontWeight: 600,
                minWidth: "auto",
                mr: 3,
              },
              "& .Mui-selected": {
                color: "#fff",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#a435f0",
                height: 3,
              },
            }}
          >
            <Tab label="Tất cả khóa học" />
            <Tab label="Danh sách của tôi" />
            <Tab label="Danh sách mong ước" />
            <Tab label="Chứng chỉ" />
            <Tab label="Đã lưu trữ" />
            <Tab label="Công cụ học tập" />
          </Tabs>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#fff", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, lg: 4 } }}>
          {wishlistCourses.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                bgcolor: "white",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Danh sách mong ước của bạn đang trống
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Khám phá các khóa học và thêm vào danh sách mong ước!
              </Typography>
              <Button
                component={Link}
                to="/"
                variant="contained"
                sx={{
                  bgcolor: "#5624d0",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": {
                    bgcolor: "#3d1a99",
                  },
                }}
              >
                Khám phá khóa học
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                  xl: "repeat(5, 1fr)",
                },
                gap: 3,
              }}
            >
              {wishlistCourses.map((course) => (
                <Card
                  key={course.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #d1d7dc",
                    borderRadius: 0,
                    boxShadow: "none",
                    position: "relative",
                    "&:hover": {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  {/* Heart Icon */}
                  <IconButton
                    onClick={() => handleRemoveFromWishlist(course.id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "white",
                      zIndex: 1,
                      width: 32,
                      height: 32,
                      "&:hover": {
                        bgcolor: "white",
                      },
                    }}
                  >
                    <Favorite sx={{ color: "#ec5252", fontSize: 20 }} />
                  </IconButton>

                  {/* Image */}
                  <CardMedia
                    component={Link}
                    to={`/course/${course.slug}`}
                    image={course.image}
                    sx={{
                      height: 135,
                      display: "block",
                      textDecoration: "none",
                    }}
                  />

                  {/* Content */}
                  <CardContent
                    sx={{
                      p: 1.5,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      component={Link}
                      to={`/course/${course.slug}`}
                      variant="h6"
                      fontWeight={700}
                      fontSize="0.95rem"
                      sx={{
                        textDecoration: "none",
                        color: "#2d2f31",
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "2.8em",
                        "&:hover": {
                          color: "#5624d0",
                        },
                      }}
                    >
                      {course.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize="0.75rem"
                      sx={{ mb: 0.5 }}
                    >
                      {course.instructor}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="#b4690e"
                        fontSize="0.85rem"
                      >
                        {course.rating.toFixed(1)}
                      </Typography>
                      <Rating
                        value={course.rating}
                        readOnly
                        size="small"
                        precision={0.1}
                        sx={{ fontSize: "0.9rem" }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontSize="0.7rem"
                      >
                        ({course.reviews.toLocaleString()})
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize="0.7rem"
                      sx={{ mb: 1 }}
                    >
                      {course.totalHours} • {course.level}
                    </Typography>

                    <Box sx={{ mt: "auto" }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        fontSize="1.1rem"
                      >
                        {formatCurrency(course.price)}
                      </Typography>
                      {course.oldPrice && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: "line-through" }}
                          fontSize="0.8rem"
                        >
                          {formatCurrency(course.oldPrice)}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default WishlistPage;
