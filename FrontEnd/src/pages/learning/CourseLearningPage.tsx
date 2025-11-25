import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  Avatar,
  Rating,
} from "@mui/material";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../../components/learning/VideoPlayer";
import CourseSidebar from "../../components/learning/CourseSidebar";
import type { CourseLearning, Section } from "../../types/lecture";
import { ArrowBack, Share, Bookmark } from "@mui/icons-material";

const CourseLearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentLectureId, setCurrentLectureId] = useState<number>(1);

  // Mock data - sẽ lấy từ API dựa trên courseId
  const courseData: CourseLearning = {
    id: 1,
    title: "Viết ứng dụng bán hàng với Java Springboot API và Angular",
    instructor: "Nguyen Duc Hoang",
    rating: 4.5,
    totalStudents: 3003,
    lastUpdated: "24 giờ",
    sections: [
      {
        id: 1,
        title: "Phần 1: Giới thiệu khóa học",
        totalDuration: 3600,
        completedLectures: 3,
        lectures: [
          {
            id: 1,
            title: "1. Giới thiệu khóa học",
            duration: 300,
            isCompleted: true,
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
          {
            id: 2,
            title: "2. Cài đặt môi trường",
            duration: 600,
            isCompleted: true,
          },
          {
            id: 3,
            title: "3. Tạo project đầu tiên",
            duration: 900,
            isCompleted: true,
          },
        ],
      },
      {
        id: 2,
        title: "Phần 2: Các action cơ bản với ProductController",
        totalDuration: 5400,
        completedLectures: 1,
        lectures: [
          {
            id: 4,
            title: "8. Các action cơ bản với ProductController",
            duration: 720,
            isCompleted: true,
          },
          {
            id: 5,
            title: "9. Viết request upload và đổi tên 1 file ảnh",
            duration: 960,
            isCompleted: false,
          },
          {
            id: 6,
            title: "10. Upload nhiều file ảnh-multiple uploading",
            duration: 720,
            isCompleted: false,
          },
          {
            id: 7,
            title: "11. Các method với UserController",
            duration: 1140,
            isCompleted: false,
          },
          {
            id: 8,
            title: "12. Hướng dẫn download source code",
            duration: 60,
            isCompleted: false,
          },
        ],
      },
      {
        id: 3,
        title: "Phần 3: Xây dựng ứng dụng Java Spring Backend phần 2",
        totalDuration: 14400,
        completedLectures: 0,
        lectures: [
          {
            id: 9,
            title: "1. Giới thiệu phần 2",
            duration: 300,
            isCompleted: false,
          },
          {
            id: 10,
            title: "2. Tạo database và models",
            duration: 1200,
            isCompleted: false,
          },
          {
            id: 11,
            title: "3. Xây dựng API CRUD",
            duration: 1800,
            isCompleted: false,
          },
        ],
      },
      {
        id: 4,
        title: "Phần 4: Xây dựng ứng dụng Java Spring Backend phần 3",
        totalDuration: 10800,
        completedLectures: 0,
        lectures: [
          {
            id: 12,
            title: "1. Authentication và Authorization",
            duration: 1800,
            isCompleted: false,
          },
          {
            id: 13,
            title: "2. JWT Token Implementation",
            duration: 2400,
            isCompleted: false,
          },
        ],
      },
      {
        id: 5,
        title: "Phần 5: Spring Security quản lý đăng nhập với JwtToken",
        totalDuration: 18000,
        completedLectures: 0,
        lectures: [
          {
            id: 14,
            title: "1. Cài đặt Spring Security",
            duration: 1200,
            isCompleted: false,
          },
          {
            id: 15,
            title: "2. Cấu hình JWT",
            duration: 1800,
            isCompleted: false,
          },
        ],
      },
      {
        id: 6,
        title: "Phần 6: Tạo ứng dụng Angular và viết giao diện phía Client",
        totalDuration: 19800,
        completedLectures: 0,
        lectures: [
          {
            id: 16,
            title: "1. Setup Angular Project",
            duration: 900,
            isCompleted: false,
          },
          {
            id: 17,
            title: "2. Tạo components",
            duration: 1500,
            isCompleted: false,
          },
        ],
      },
      {
        id: 7,
        title: "Phần 7: Ghép API từ Angular sang Java Spring Boot Backend-phần 1",
        totalDuration: 30600,
        completedLectures: 0,
        lectures: [
          {
            id: 18,
            title: "1. Tạo services",
            duration: 1200,
            isCompleted: false,
          },
          {
            id: 19,
            title: "2. Kết nối API",
            duration: 1800,
            isCompleted: false,
          },
        ],
      },
    ],
    currentLectureId: 1,
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentLecture = courseData.sections
    .flatMap((s) => s.lectures)
    .find((l) => l.id === currentLectureId);

  const allLectures = courseData.sections.flatMap((s) => s.lectures);
  const currentIndex = allLectures.findIndex((l) => l.id === currentLectureId);

  const handleNext = () => {
    if (currentIndex < allLectures.length - 1) {
      setCurrentLectureId(allLectures[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentLectureId(allLectures[currentIndex - 1].id);
    }
  };

  const handleLectureClick = (lectureId: number) => {
    setCurrentLectureId(lectureId);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#1c1d1f",
          color: "white",
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #3e4143",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/my-learning")}
            sx={{
              color: "white",
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Quay lại
          </Button>
          <Typography variant="body1" fontWeight={700} noWrap>
            {courseData.title}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            startIcon={<Share />}
            sx={{
              color: "white",
              textTransform: "none",
            }}
          >
            Chia sẻ
          </Button>
          <Button
            startIcon={<Bookmark />}
            sx={{
              color: "white",
              textTransform: "none",
            }}
          >
            Lưu
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Video Player Section */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ flex: 1, bgcolor: "#000" }}>
            <VideoPlayer
              videoUrl={currentLecture?.videoUrl}
              title={currentLecture?.title || ""}
              onNext={handleNext}
              onPrevious={handlePrevious}
              hasNext={currentIndex < allLectures.length - 1}
              hasPrevious={currentIndex > 0}
            />
          </Box>

          {/* Tabs Section */}
          <Box sx={{ bgcolor: "white", borderTop: "1px solid #d1d7dc" }}>
            <Container maxWidth="xl">
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 600,
                    minWidth: "auto",
                    px: 3,
                  },
                  "& .Mui-selected": {
                    color: "#1c1d1f !important",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#1c1d1f",
                    height: 3,
                  },
                }}
              >
                <Tab label="Tổng quan" />
                <Tab label="Hỏi đáp" />
                <Tab label="Ghi chú" />
                <Tab label="Thông báo" />
                <Tab label="Đánh giá" />
                <Tab label="Công cụ học tập" />
              </Tabs>
            </Container>
          </Box>

          {/* Tab Content */}
          <Box sx={{ bgcolor: "#f7f9fa", flex: 1, overflowY: "auto", p: 3 }}>
            <Container maxWidth="xl">
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    Thực chiến, xây dựng ứng dụng bán hàng với Java Springboot
                    API và Angular
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        {courseData.rating}
                      </Typography>
                      <Rating
                        value={courseData.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {courseData.totalStudents.toLocaleString()} học viên
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cập nhật {courseData.lastUpdated}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{ width: 56, height: 56 }}
                      alt={courseData.instructor}
                    />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Được tạo bởi
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {courseData.instructor}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      Mô tả
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Khóa học này sẽ hướng dẫn bạn từng bước xây dựng một ứng
                      dụng bán hàng hoàn chỉnh với Java Spring Boot làm backend
                      và Angular làm frontend. Bạn sẽ học được cách tạo RESTful
                      API, xác thực người dùng với JWT, và tích hợp frontend
                      với backend.
                    </Typography>
                  </Box>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Tất cả các câu hỏi trong khóa học này
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
                  </Typography>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Ghi chú của tôi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bạn chưa có ghi chú nào. Tạo ghi chú để lưu lại những điểm
                    quan trọng!
                  </Typography>
                </Box>
              )}
            </Container>
          </Box>
        </Box>

        {/* Sidebar */}
        <CourseSidebar
          sections={courseData.sections}
          currentLectureId={currentLectureId}
          onLectureClick={handleLectureClick}
        />
      </Box>
    </Box>
  );
};

export default CourseLearningPage;

