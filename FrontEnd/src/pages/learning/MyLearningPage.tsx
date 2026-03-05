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
// ... imports
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PurchasedCourseCard from "../../components/learning/PurchasedCourseCard";
import type { PurchasedCourse } from "../../types/purchasedCourse";

import { httpClient } from "../../service/httpClient";
import { useToast } from "../../hooks/useToast";

interface EnrollmentResponse {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  courseImage: string;
  instructorName: string;
  progress: number;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  slug: string;
}

const MyLearningPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<number>(
    (location.state as any)?.tab ?? 0,
  );
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useToast();

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  const fetchMyEnrollments = async () => {
    try {
      setLoading(true);
      const response = await httpClient<EnrollmentResponse[]>("/enrollments");
      if (response.data) {
        const mappedCourses: PurchasedCourse[] = response.data.map((item) => ({
          id: item.courseId,
          title: item.courseTitle,
          instructor: item.instructorName || "Unknown Instructor",
          image: item.courseImage,
          progress: item.progress,
          totalLectures: item.totalLessons || 0,
          completedLectures: item.completedLessons || 0,
          totalDuration: 0, // Not available in API yet
          lastAccessed: item.enrolledAt,
          slug: item.slug,
          rating: 0, // Not available
        }));
        setPurchasedCourses(mappedCourses);
      }
    } catch (error) {
      console.error("Failed to fetch enrollments", error);
      enqueueSnackbar("Không thể tải danh sách khóa học", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 2) {
      // Tab "Danh sách mong ước"
      navigate("/my-courses/wishlist");
    }
  };

  const getFilteredCourses = () => {
    // Logic:
    // Tab 0 ("Tất cả"): Show all purchased courses
    // Tab 1 ("Danh sách của tôi"): Show all (or filter by some criterion? User asked "who bought ... will be in all courses")
    // Usually "All Courses" tab shows everything.

    switch (activeTab) {
      case 0: // Tất cả khóa học
        return purchasedCourses;
      case 1: // Danh sách của tôi
        return purchasedCourses;
      case 2: // Danh sách mong ước
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
          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography>Đang tải...</Typography>
            </Box>
          ) : (
            <>
              {/* Keep the static cards for "Start a streak" etc if desired, or remove if user wants clean slate. 
                   User said "remove fake data", implying the course list. I'll keep the top widgets as they seem feature-placeholder but not "fake course data". 
                   Actually, user said "remove fake data in my-learning", referring to the mocked courses. 
               */}
              {activeTab === 0 && (
                <Stack spacing={3}>
                  {/* Static banner cards - keep or remove? User "remove fake data" usually refers to content. I'll keep them as UI elements unless specified. */}
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
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 3 }}
                        >
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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
                      onClick={() => navigate("/")}
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
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default MyLearningPage;
