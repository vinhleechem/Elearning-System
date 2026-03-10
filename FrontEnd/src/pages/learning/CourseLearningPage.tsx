import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  Avatar,
  Rating,
  CircularProgress,
  Fab,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer, {
  type VideoPlayerRef,
} from "../../components/learning/VideoPlayer";
import CourseSidebar from "../../components/learning/CourseSidebar";
import CourseQA from "../../components/learning/CourseQA";
import CourseNotes from "../../components/learning/CourseNotes";
import type {
  CourseLearning,
  Section as SectionType,
  Lecture,
} from "../../types/lecture";
import { Chat as ChatIcon, MoreVert, StarRate, Share, School as SchoolIcon } from "@mui/icons-material";
import ChatDrawer from "../../components/chat/ChatDrawer";
import { courseService } from "../../service/courseService";
import { sectionService } from "../../service/sectionService";
import { lessonService } from "../../service/lessonService";
import { formatDate } from "../../libs/dateUtils";
import { useAuthStore } from "../../store/authStore";
import { httpClient } from "../../service/httpClient";
import { lessonProgressService } from "../../service/lessonProgressService";
import type { LessonProgress } from "../../types/lessonProgress";
import { useToast } from "../../hooks/useToast";

const CourseLearningPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [currentLectureId, setCurrentLectureId] = useState<number | null>(null);
  const [courseData, setCourseData] = useState<CourseLearning | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const playerRef = useRef<VideoPlayerRef>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount] = useState(0); // TODO: Get from API
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [lessonProgressMap, setLessonProgressMap] = useState<
    Record<number, LessonProgress>
  >({});
  const heartbeatTimeoutRef = useRef<number | null>(null);
  const autoCompleteRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        // 1. Fetch Course Detail
        const courseDetail = await courseService.getCourseById(
          Number(courseId),
        );

        // 2. Fetch Sections
        const sectionsRes = await sectionService.getSectionsByCourse(
          Number(courseId),
        );

        // 3. Fetch Lessons for each section
        const sectionsMapped: SectionType[] = await Promise.all(
          sectionsRes.map(async (sec) => {
            const lessons = await lessonService.getLessonsBySection(
              sec.sectionId,
            );

            const lectures: Lecture[] = lessons.map((l) => ({
              id: l.lessonId,
              title: l.title,
              duration: l.durationSeconds || 0,
              isCompleted: false,
              videoUrl: l.videoUrl,
              description: l.description,
            }));

            return {
              id: sec.sectionId,
              title: sec.title,
              lectures: lectures,
              totalDuration: lectures.reduce(
                (acc, curr) => acc + curr.duration,
                0,
              ),
              completedLectures: 0,
            };
          }),
        );

        const mappedCourseData: CourseLearning = {
          id: courseDetail.courseId,
          title: courseDetail.title,
          instructor: courseDetail.instructorName || "Giảng viên",
          rating: courseDetail.averageRating || 4.5,
          totalStudents: courseDetail.totalStudents || 0,
          lastUpdated: courseDetail.publishedAt
            ? formatDate(courseDetail.publishedAt)
            : "Mới cập nhật",
          sections: sectionsMapped,
          currentLectureId: undefined,
        };

        setCourseData(mappedCourseData);

        // Set initial lecture if available
        if (
          sectionsMapped.length > 0 &&
          sectionsMapped[0].lectures.length > 0 &&
          !currentLectureId
        ) {
          setCurrentLectureId(sectionsMapped[0].lectures[0].id);
        }
      } catch (error: any) {
        console.error(error);
        enqueueSnackbar(
          error?.message || "Không tải được dữ liệu khóa học",
          { variant: "error" },
        );
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      await fetchCourseData();

      // Sau khi có dữ liệu khóa học, tìm enrollment hiện tại của user cho khóa học này
      if (!courseId) return;
      try {
        const enrollmentRes = await httpClient<
          {
            enrollmentId: number;
            courseId: number;
            progress: number;
          }[]
        >("/enrollments", { method: "GET" });

        const found = enrollmentRes.data?.find(
          (e) => e.courseId === Number(courseId),
        );

        if (found) {
          setEnrollmentId(found.enrollmentId);
          // Lấy danh sách progress từng bài học cho enrollment này
          const progressList =
            await lessonProgressService.getEnrollmentProgress(
              found.enrollmentId,
            );

          const map: Record<number, LessonProgress> = {};
          progressList.forEach((p) => {
            map[p.lessonId] = p;
          });
          setLessonProgressMap(map);

          // Áp tiến độ vào courseData
          setCourseData((prev) => {
            if (!prev) return prev;
            const updatedSections = prev.sections.map((sec) => {
              const updatedLectures = sec.lectures.map((lec) => {
                const lp = map[lec.id];
                return {
                  ...lec,
                  isCompleted: lp?.isCompleted ?? lec.isCompleted,
                };
              });
              const completedLectures = updatedLectures.filter(
                (l) => l.isCompleted,
              ).length;
              return {
                ...sec,
                lectures: updatedLectures,
                completedLectures,
              };
            });
            return { ...prev, sections: updatedSections };
          });
        }
      } catch (error) {
        console.error(error);
        // Không show toast lớn nếu chỉ lỗi phần progress
      }
    };

    void init();

    return () => {
      if (heartbeatTimeoutRef.current) {
        window.clearTimeout(heartbeatTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getSafeVideoUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;

    // Luôn dùng origin (http://localhost:8080) cho file video,
    // tránh dính thêm path /api/v1 gây 404.
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const urlObj = new URL(baseUrl);
      const origin = urlObj.origin;
      const cleanUrl = url.startsWith("/") ? url : `/${url}`;
      return `${origin}${cleanUrl}`;
    } catch {
      const cleanUrl = url.startsWith("/") ? url : `/${url}`;
      return `http://localhost:8080${cleanUrl}`;
    }
  };

  const allLectures = courseData?.sections.flatMap((s) => s.lectures) || [];
  const currentIndex = allLectures.findIndex((l) => l.id === currentLectureId);
  const currentLecture = allLectures[currentIndex];

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

  const handleSeek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time);
    }
  };

  // Heartbeat lưu vị trí video (10s/lần)
  useEffect(() => {
    if (!enrollmentId || !currentLectureId) return;

    if (heartbeatTimeoutRef.current) {
      window.clearTimeout(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = window.setTimeout(async () => {
      try {
        await lessonProgressService.updateVideoPosition(
          enrollmentId,
          currentLectureId,
          Math.floor(playerCurrentTime),
        );
      } catch (error) {
        console.error("Failed to update video position", error);
      }
    }, 10000);
  }, [playerCurrentTime, enrollmentId, currentLectureId]);

  const getOverallProgress = () => {
    if (!courseData) return 0;
    const totalLectures = courseData.sections.reduce(
      (acc, sec) => acc + sec.lectures.length,
      0,
    );
    if (totalLectures === 0) return 0;
    const completedLectures = courseData.sections.reduce(
      (acc, sec) => acc + sec.completedLectures,
      0,
    );
    return Math.round((completedLectures * 100) / totalLectures);
  };

  const markLectureCompleted = async (lessonId: number, isToggle = false) => {
    if (!enrollmentId) return;

    // Nếu là auto-complete và đã completed rồi thì bỏ qua
    if (!isToggle) {
      if (autoCompleteRef.current[lessonId] && lessonProgressMap[lessonId]?.isCompleted) {
        return;
      }
    }

    try {
      await lessonProgressService.markLessonCompleted(
        enrollmentId,
        lessonId,
        { isToggle },
      );

      setLessonProgressMap((prev) => {
        const existing = prev[lessonId];
        const newCompleted = isToggle
          ? !existing?.isCompleted
          : true;
        const updated: LessonProgress = {
          ...(existing || {
            enrollmentId,
            lessonId,
          }),
          isCompleted: newCompleted,
        };
        return {
          ...prev,
          [lessonId]: updated,
        };
      });

      setCourseData((prev) => {
        if (!prev) return prev;
        const updatedSections = prev.sections.map((sec) => {
          const updatedLectures = sec.lectures.map((lec) =>
            lec.id === lessonId
              ? { ...lec, isCompleted: isToggle ? !lec.isCompleted : true }
              : lec,
          );
          const completedLectures = updatedLectures.filter(
            (l) => l.isCompleted,
          ).length;
          return {
            ...sec,
            lectures: updatedLectures,
            completedLectures,
          };
        });
        return { ...prev, sections: updatedSections };
      });
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(
        error?.message || "Không thể đánh dấu hoàn thành bài học",
        { variant: "error" },
      );
    }
  };

  // Tự động đánh dấu hoàn thành khi xem >= 90%
  useEffect(() => {
    if (!enrollmentId || !currentLectureId || !currentLecture) return;
    if (!currentLecture.duration || currentLecture.duration <= 0) return;

    const ratio = playerCurrentTime / currentLecture.duration;
    const alreadyCompleted = lessonProgressMap[currentLectureId]?.isCompleted;

    if (ratio >= 0.9 && !alreadyCompleted) {
      if (autoCompleteRef.current[currentLectureId]) return;
      autoCompleteRef.current[currentLectureId] = true;
      void markLectureCompleted(currentLectureId);
    }
  }, [playerCurrentTime, enrollmentId, currentLectureId, currentLecture, lessonProgressMap]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!courseData) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Không tìm thấy khóa học
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/my-courses/learning")}
        >
          Quay lại trang học tập
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* Udemy-style Header */}
      <Box
        sx={{
          bgcolor: "#1c1d1f",
          color: "white",
          height: 48,
          borderBottom: "1px solid #3e4143",
          display: "flex",
          alignItems: "center",
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1, gap: 3 }}>
          {/* Logo */}
          <Box
            onClick={() => navigate("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              "&:hover": { opacity: 0.8 },
            }}
          >
            <SchoolIcon sx={{ color: "#3b82f6", fontSize: 24 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: "white",
                letterSpacing: "-0.02em",
                fontSize: "1.1rem",
              }}
            >
              vidi
            </Typography>
          </Box>

          {/* Divider */}
          <Box
            sx={{
              width: "1px",
              height: 24,
              bgcolor: "#3e4143",
            }}
          />

          {/* Course Title */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: "15px",
              maxWidth: 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {courseData.title}
          </Typography>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Progress */}
          <Button
            sx={{
              color: "white",
              textTransform: "none",
              fontSize: "14px",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StarRate sx={{ fontSize: 18 }} />
              <Typography variant="body2">
                Tiến độ của bạn: {getOverallProgress()}%
              </Typography>
            </Box>
          </Button>

          {/* Ask Instructor Button */}
          <Tooltip title="Nhắn tin riêng với giảng viên của khóa học" arrow>
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  right: -3,
                  top: 3,
                },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ChatIcon />}
                onClick={() => setChatOpen(true)}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  px: 2,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Hỏi giảng viên
              </Button>
            </Badge>
          </Tooltip>

          {/* Share */}
          <IconButton
            sx={{
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <Share sx={{ fontSize: 20 }} />
          </IconButton>

          {/* More Options */}
          <IconButton
            sx={{
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MoreVert sx={{ fontSize: 20 }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => setAnchorEl(null)}>
              Về khóa học này
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>Lưu</MenuItem>
            <MenuItem onClick={() => navigate("/my-courses/learning")}>
              Thoát khóa học
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Video Player Section */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ bgcolor: "#000", minHeight: "65vh" }}>
            <VideoPlayer
              ref={playerRef}
              videoUrl={getSafeVideoUrl(currentLecture?.videoUrl)}
              title={currentLecture?.title || ""}
              onNext={handleNext}
              onPrevious={handlePrevious}
              hasNext={currentIndex < allLectures.length - 1}
              hasPrevious={currentIndex > 0}
              onTimeUpdate={setPlayerCurrentTime}
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
                    backgroundColor: "transparent",
                    borderBottom: "2px solid #1c1d1f",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#1c1d1f",
                    height: 0,
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
                    {courseData.title}
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
                      {/* TODO: Add description to courseDetail API response if needed */}
                      Khóa học chất lượng cao.
                    </Typography>
                  </Box>
                </Box>
              )}
              {activeTab === 1 && <CourseQA />}
              {activeTab === 2 && (
                <CourseNotes
                  currentTime={playerCurrentTime}
                  onSeek={handleSeek}
                />
              )}
              {activeTab === 3 && (
                <Typography sx={{ p: 2 }}>Chưa có thông báo</Typography>
              )}
              {activeTab === 4 && (
                <Typography sx={{ p: 2 }}>Chức năng đánh giá</Typography>
              )}
              {activeTab === 5 && (
                <Typography sx={{ p: 2 }}>Công cụ học tập</Typography>
              )}
            </Container>
          </Box>
        </Box>

        {/* Sidebar */}
        <CourseSidebar
          sections={courseData.sections}
          currentLectureId={currentLectureId || 0}
          onLectureClick={handleLectureClick}
          onToggleComplete={(lessonId) => {
            void markLectureCompleted(lessonId, true);
          }}
        />
      </Box>

      {/* Floating Chat Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={() => setChatOpen(true)}
      >
        <Badge badgeContent={unreadCount} color="error">
          <ChatIcon />
        </Badge>
      </Fab>

      {/* Chat Drawer */}
      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        courseId={Number(courseId)}
        currentUserId={user?.userId || 0}
        currentUserType={
          user?.roles?.includes("INSTRUCTOR") ? "INSTRUCTOR" : "STUDENT"
        }
      />
    </Box>
  );
};

export default CourseLearningPage;
