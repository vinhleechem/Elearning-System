import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PurchasedCourseCard from "../../components/learning/PurchasedCourseCard";
import type { PurchasedCourse } from "../../types/purchasedCourse";
import { Schedule } from "@mui/icons-material";

const MyLearningPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Mock data - trong thực tế sẽ lấy từ API
  const purchasedCourses: PurchasedCourse[] = [
    {
      id: 1,
      title: "Viết ứng dụng bán hàng với Java Springboot API và Angular",
      instructor: "Nguyen Duc Hoang",
      image: "https://img-c.udemycdn.com/course/240x135/1565838_e54e_16.jpg",
      progress: 45,
      totalLectures: 150,
      completedLectures: 68,
      totalDuration: 20,
      lastAccessed: "2025-10-30",
      rating: 4.5,
      slug: "java-springboot-angular",
    },
    {
      id: 2,
      title: "How to Create an Online Course: The Official Udemy Course",
      instructor: "Udemy Instructor Team",
      image: "https://img-c.udemycdn.com/course/240x135/1565838_e54e_16.jpg",
      progress: 0,
      totalLectures: 50,
      completedLectures: 0,
      totalDuration: 5,
      lastAccessed: "2025-10-28",
      slug: "create-online-course",
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 2) {
      // Tab "Danh sách mong ước"
      navigate("/my-learning/wishlist");
    }
  };

  const getFilteredCourses = () => {
    switch (activeTab) {
      case 0: // Tất cả khóa học
        return purchasedCourses;
      case 1: // Danh sách của tôi
        return purchasedCourses.filter((course) => course.progress > 0);
      case 2: // Danh sách mong ước
        return [];
      case 3: // Đã lưu trữ
        return [];
      case 4: // Công cụ học tập
        return [];
      default:
        return purchasedCourses;
    }
  };

  const filteredCourses = getFilteredCourses();

  return (
    <>
      <Box sx={{ bgcolor: "#1c1d1f", color: "white", py: 3 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, lg: 4 } }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
            Học tập
          </Typography>
          <Tabs
            value={activeTab}
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
          {activeTab === 0 && (
            <Stack spacing={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid #edeff1",
                  boxShadow: "0 12px 34px rgba(15,23,42,0.08)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 3,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Bắt đầu một chuỗi hàng tuần
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hãy thực hiện từng mục tiêu học tập của bạn.
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          0 tuần
                        </Typography>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            border: "6px solid #d1d7dc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mt: 1,
                          }}
                        >
                          <Typography variant="h5" fontWeight={700}>
                            0
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          0/30 phút khóa học
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          1/1 lượt truy cập
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          24 thg 11 - 1
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid #edeff1",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Schedule sx={{ fontSize: 32, color: "#5c5f61" }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Lên lịch thời gian học
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Học một chút mỗi ngày sẽ giúp bạn tích lũy kiến thức.
                        Nghiên cứu cho thấy rằng những học viên biến việc học
                        thành thói quen sẽ có nhiều khả năng đạt được mục tiêu
                        hơn.
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                          variant="outlined"
                          sx={{
                            borderColor: "#3b82f6",
                            color: "#3b82f6",
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Bắt đầu
                        </Button>
                        <Button
                          variant="text"
                          sx={{
                            color: "#3b82f6",
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Hủy bỏ
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          )}

          <Box sx={{ mt: 4 }}>
            {filteredCourses.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 3,
                }}
              >
                {filteredCourses.map((course) => (
                  <Box key={course.id}>
                    <PurchasedCourseCard course={course} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Chưa có khóa học nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hãy khám phá các khóa học và bắt đầu học ngay!
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    mt: 3,
                    bgcolor: "#3b82f6",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: "#2563eb",
                    },
                  }}
                >
                  Khám phá khóa học
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default MyLearningPage;
