import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Rating,
  Tabs,
  Tab,
} from "@mui/material";
import { Favorite } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../libs/utils";
import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore } from "../store/cartStore";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { items: wishlistCourses, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  const handleRemoveFromWishlist = async (courseId: number) => {
    await removeFromWishlist(courseId);
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
                backgroundColor: "#3b82f6",
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
                  bgcolor: "#3b82f6",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": {
                    bgcolor: "#2563eb",
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
                  key={course.courseId}
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
                    onClick={() => handleRemoveFromWishlist(course.courseId)}
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
                    to={`/course/${course.courseId}`} // Fallback to ID since slug is missing
                    image={course.courseImage}
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
                      to={`/course/${course.courseId}`}
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
                          color: "#3b82f6",
                        },
                      }}
                    >
                      {course.courseTitle}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize="0.75rem"
                      sx={{ mb: 0.5 }}
                    >
                      {course.instructorName}
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
                        {course.rating?.toFixed(1) || "0.0"}
                      </Typography>
                      <Rating
                        value={course.rating || 0}
                        readOnly
                        size="small"
                        precision={0.1}
                        sx={{ fontSize: "0.9rem" }}
                      />
                    </Box>

                    <Box sx={{ mt: "auto" }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        fontSize="1.1rem"
                      >
                        {formatCurrency(course.discountPrice || course.price)}
                      </Typography>
                      {course.discountPrice && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: "line-through" }}
                          fontSize="0.8rem"
                        >
                          {formatCurrency(course.price)}
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
