import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  keyframes,
  Collapse,
  Paper,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Add,
  EditOutlined,
  DeleteOutline,
  VideoLibrary,
  Article,
  Quiz,
  CloudUpload,
  PlayCircleFilledWhite,
  ArrowBack,
  LibraryAdd,
} from "@mui/icons-material";
import { useToast } from "../../hooks/useToast";
import {
  courseService,
  type PublicCourseResponse,
} from "../../service/courseService";
import {
  sectionService,
  type SectionResponse,
  type SectionRequest,
} from "../../service/sectionService";
import {
  lessonService,
  type LessonResponse,
  type LessonRequest,
} from "../../service/lessonService";
import { videoAssetService } from "../../service/videoAssetService";

// --- Animation ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Helpers ---
const formatDuration = (seconds?: number) => {
  if (typeof seconds !== "number") return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const CourseContentManagementPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useToast();

  const isInstructor = location.pathname.startsWith("/instructor");
  const backLink = isInstructor ? "/instructor/dashboard" : "/admin/courses";

  // const { tokens } = useAuthStore(); // Unused for now

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<PublicCourseResponse | null>(null);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [lessonsMap, setLessonsMap] = useState<
    Record<number, LessonResponse[]>
  >({});

  // Expanded state map for sections
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});

  // Dialogs State
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionResponse | null>(
    null,
  );
  const [sectionForm, setSectionForm] = useState<SectionRequest>({
    title: "",
    position: 1,
  });

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonResponse | null>(
    null,
  );
  const [targetSectionId, setTargetSectionId] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonRequest>({
    title: "",
    description: "",
    type: "VIDEO",
    videoAssetId: undefined,
    durationSeconds: 0,
    isPreview: false,
    sortOrder: 1,
  });

  // Video Preview State
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // Video Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initial Fetch ---
  useEffect(() => {
    if (!courseId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const cId = parseInt(courseId);
        const courseData = await courseService.getCourseById(cId);
        setCourse(courseData);

        const secs = await sectionService.getSectionsByCourse(cId);
        setSections(secs.sort((a, b) => a.position - b.position));

        // Auto expand all sections or first one? Let's just keep them collapsed or expand first.
        // Let's expand the first one by default if exists
        if (secs.length > 0) {
          setExpandedSections({ [secs[0].sectionId]: true });
        }

        const lessonsPromises = secs.map((sec) =>
          lessonService.getLessonsBySection(sec.sectionId),
        );
        const allLessons = await Promise.all(lessonsPromises);
        const map: Record<number, LessonResponse[]> = {};
        secs.forEach((sec, index) => {
          map[sec.sectionId] = allLessons[index].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          );
        });
        setLessonsMap(map);
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Không thể tải nội dung khóa học", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]); // Remove enqueueSnackbar from dependencies

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // --- Handlers: Section ---
  const handleOpenCreateSection = () => {
    setEditingSection(null);
    setSectionForm({ title: "", position: sections.length + 1 });
    setSectionDialogOpen(true);
  };

  const handleOpenEditSection = (sec: SectionResponse) => {
    setEditingSection(sec);
    setSectionForm({ title: sec.title, position: sec.position });
    setSectionDialogOpen(true);
  };

  const handleCreateOrUpdateSection = async () => {
    if (!courseId) return;
    try {
      const cId = parseInt(courseId);
      if (editingSection) {
        const updated = await sectionService.updateSection(
          cId,
          editingSection.sectionId,
          sectionForm,
        );
        setSections((prev) =>
          prev
            .map((s) => (s.sectionId === updated.sectionId ? updated : s))
            .sort((a, b) => a.position - b.position),
        );
        enqueueSnackbar("Cập nhật chương học thành công", {
          variant: "success",
        });
      } else {
        const created = await sectionService.createSection(cId, sectionForm);
        setSections((prev) =>
          [...prev, created].sort((a, b) => a.position - b.position),
        );
        setLessonsMap((prev) => ({ ...prev, [created.sectionId]: [] }));
        setExpandedSections((prev) => ({ ...prev, [created.sectionId]: true }));
        enqueueSnackbar("Thêm chương học mới thành công", {
          variant: "success",
        });
      }
      setSectionDialogOpen(false);
    } catch (error: any) {
      enqueueSnackbar(error.message || "Có lỗi xảy ra", { variant: "error" });
    }
  };

  const handleDeleteSection = async (secId: number) => {
    if (!courseId || !window.confirm("Bạn có chắc chắn muốn xóa chương này?"))
      return;
    try {
      await sectionService.deleteSection(parseInt(courseId), secId);
      setSections((prev) => prev.filter((s) => s.sectionId !== secId));
      enqueueSnackbar("Đã xóa chương học", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Có lỗi xảy ra", { variant: "error" });
    }
  };

  // --- Handlers: Lesson ---
  const handleOpenCreateLesson = (secId: number) => {
    setTargetSectionId(secId);
    setEditingLesson(null);
    setLessonForm({
      title: "",
      description: "",
      type: "VIDEO",
      videoAssetId: undefined,
      durationSeconds: 0,
      isPreview: false,
      sortOrder: (lessonsMap[secId]?.length || 0) + 1,
    });
    setVideoPreviewUrl(null);
    setLessonDialogOpen(true);
  };

  const handleOpenEditLesson = (secId: number, lesson: LessonResponse) => {
    setTargetSectionId(secId);
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      type: lesson.type,
      videoAssetId: lesson.videoAssetId,
      videoUrl: lesson.videoUrl,
      durationSeconds: lesson.durationSeconds || 0,
      isPreview: lesson.isPreview,
      sortOrder: lesson.sortOrder,
    });

    // Resolve video URL for preview
    let vidUrl = lesson.videoUrl || null;
    if (vidUrl && vidUrl.startsWith("/") && !vidUrl.startsWith("blob:")) {
      const baseUrl =
        import.meta.env.VITE_BASE_URL || "http://localhost:8080/api/v1";
      const domain = baseUrl.replace(/\/api\/v1\/?$/, "");
      vidUrl = `${domain}${vidUrl}`;
    }
    setVideoPreviewUrl(vidUrl);
    setLessonDialogOpen(true);
  };

  const handleCreateOrUpdateLesson = async () => {
    if (!targetSectionId) return;
    try {
      if (editingLesson) {
        const updated = await lessonService.updateLesson(
          targetSectionId,
          editingLesson.lessonId,
          lessonForm,
        );
        setLessonsMap((prev) => ({
          ...prev,
          [targetSectionId]: prev[targetSectionId]
            .map((l) => (l.lessonId === updated.lessonId ? updated : l))
            .sort((a, b) => a.sortOrder - b.sortOrder),
        }));
        enqueueSnackbar("Cập nhật bài học thành công", { variant: "success" });
      } else {
        const created = await lessonService.createLesson(
          targetSectionId,
          lessonForm,
        );
        setLessonsMap((prev) => ({
          ...prev,
          [targetSectionId]: [...(prev[targetSectionId] || []), created].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          ),
        }));
        enqueueSnackbar("Thêm bài học mới thành công", { variant: "success" });
      }
      setLessonDialogOpen(false);
    } catch (error: any) {
      enqueueSnackbar(error.message || "Có lỗi xảy ra", { variant: "error" });
    }
  };

  const handleDeleteLesson = async (secId: number, lId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) return;
    try {
      await lessonService.deleteLesson(secId, lId);
      setLessonsMap((prev) => ({
        ...prev,
        [secId]: prev[secId].filter((l) => l.lessonId !== lId),
      }));
      enqueueSnackbar("Đã xóa bài học", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Có lỗi xảy ra", { variant: "error" });
    }
  };

  // --- Handlers: Video Upload ---
  // --- Handlers: Video Upload ---
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Helper to get duration from file
    const getVideoDuration = (file: File): Promise<number> => {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = function () {
          window.URL.revokeObjectURL(video.src);
          resolve(video.duration);
        };
        video.onerror = function () {
          resolve(0);
        };
        video.src = URL.createObjectURL(file);
      });
    };

    setUploading(true);
    setUploadProgress(0);

    const timer = setInterval(() => {
      setUploadProgress((old) => {
        if (old >= 90) return 90;
        return old + 10;
      });
    }, 500);

    try {
      // Upload and get duration in parallel
      const [duration, asset] = await Promise.all([
        getVideoDuration(file),
        videoAssetService.uploadVideo(file, file.name),
      ]);

      clearInterval(timer);
      setUploadProgress(100);

      // Create preview URL for the new file
      const objectUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(objectUrl);

      setLessonForm((prev) => ({
        ...prev,
        videoAssetId: asset.assetId,
        // Use client-side duration if available, otherwise fallback to backend or 0
        durationSeconds: Math.round(duration) || asset.duration || 0,
        title: prev.title || file.name.split(".")[0],
      }));
      enqueueSnackbar("Upload video thành công!", { variant: "success" });
    } catch (error: any) {
      clearInterval(timer);
      setUploadProgress(0);
      enqueueSnackbar(error.message || "Upload video thất bại", {
        variant: "error",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Render content
  return (
    <Box sx={{ animation: `${fadeIn} 0.5s ease-out`, p: { xs: 2, md: 4 } }}>
      {/* --- HEADER BANNER --- */}
      <Box
        sx={{
          bgcolor: "#e6f3fd", // Light blue background, specifically closer to the image
          p: 4,
          borderRadius: 3,
          mb: 5,
          position: "relative",
        }}
      >
        {/* Back Link */}
        <Box
          onClick={() => navigate(backLink)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "#64748b",
            cursor: "pointer",
            mb: 2,
            width: "fit-content",
            transition: "color 0.2s",
            "&:hover": { color: "#0ea5e9" },
          }}
        >
          <ArrowBack sx={{ fontSize: 18 }} />
          <Typography variant="body2" fontWeight={600}>
            Quay lại
          </Typography>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{ mb: 1, color: "#334155", letterSpacing: "-0.02em" }}
            >
              Nội dung khóa học
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#64748b", fontWeight: 500 }}
            >
              {course?.title || "Đang tải..."}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateSection}
            sx={{
              bgcolor: "#4776ca", // Adjusted to a softer blue
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderRadius: 2,
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              "&:hover": { bgcolor: "#3b69bd" },
            }}
          >
            Thêm chương mới
          </Button>
        </Box>
      </Box>

      {/* --- CONTENT LIST --- */}
      {sections.length === 0 && !loading ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 2,
            border: "2px dashed #e2e8f0",
            borderRadius: 4,
            bgcolor: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: "white",
              borderRadius: "50%",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            }}
          >
            <LibraryAdd sx={{ fontSize: 48, color: "#94a3b8" }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              color="#334155"
              gutterBottom
            >
              Chưa có nội dung nào
            </Typography>
            <Typography variant="body1" color="#64748b" maxWidth={500}>
              Khóa học này chưa có chương nào. Hãy bắt đầu bằng việc tạo chương
              đầu tiên để xây dựng nội dung cho học viên.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleOpenCreateSection}
            sx={{
              mt: 1,
              textTransform: "none",
              fontWeight: 600,
              borderWidth: 2,
              borderColor: "#cbd5e1",
              color: "#475569",
              "&:hover": {
                borderWidth: 2,
                borderColor: "#2563eb",
                color: "#2563eb",
                bgcolor: "#eff6ff",
              },
            }}
          >
            Tạo chương đầu tiên
          </Button>
        </Box>
      ) : (
        <Stack spacing={3}>
          {sections.map((section) => (
            <Paper
              key={section.sectionId}
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                overflow: "hidden",
                transition: "box-shadow 0.2s",
                "&:hover": {
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              {/* SECTION HEADER */}
              <Box
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  bgcolor: "white",
                }}
                onClick={() => toggleSection(section.sectionId)}
              >
                <Box
                  display="flex"
                  gap={3}
                  alignItems="flex-start"
                  width="100%"
                >
                  {/* Large Number */}
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: "#cbd5e1", lineHeight: 1, minWidth: 30 }}
                  >
                    {section.position}.
                  </Typography>

                  {/* Vertical Line */}
                  <Box
                    sx={{
                      width: "3px",
                      bgcolor: "#3b82f6",
                      alignSelf: "stretch",
                      borderRadius: 1,
                      minHeight: 50,
                      mr: 1,
                    }}
                  />

                  {/* Content */}
                  <Box flex={1} pt={0.5}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{ color: "#1e293b", mb: 0.5 }}
                        >
                          Phần {section.position}: {section.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          {lessonsMap[section.sectionId]?.length || 0} bài học
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditSection(section);
                          }}
                          sx={{
                            color: "#94a3b8",
                            "&:hover": { color: "#3b82f6", bgcolor: "#eff6ff" },
                          }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(section.sectionId);
                          }}
                          sx={{
                            color: "#94a3b8",
                            "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" },
                          }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: "#64748b" }}>
                          {expandedSections[section.sectionId] ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          )}
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* SECTION CONTENT (LESSONS) */}
              <Collapse in={expandedSections[section.sectionId]}>
                <Box sx={{ pl: { xs: 2, md: 10 }, pr: 3, pb: 3, pt: 0 }}>
                  {/* Add Lesson Button Row */}
                  <Box sx={{ mb: 2 }}>
                    <Button
                      startIcon={<Add />}
                      onClick={() => handleOpenCreateLesson(section.sectionId)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        color: "#2563eb",
                        fontSize: "0.9rem",
                        p: 1,
                        "&:hover": { bgcolor: "#eff6ff" },
                      }}
                    >
                      Thêm bài học
                    </Button>
                  </Box>

                  {/* Lessons List */}
                  <Stack spacing={1.5}>
                    {lessonsMap[section.sectionId]?.map((lesson) => (
                      <Paper
                        key={lesson.lessonId}
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "1px solid #f1f5f9",
                          bgcolor: "#f8fafc", // Slight contrast for lesson items
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          "&:hover": {
                            bgcolor: "white",
                            borderColor: "#e2e8f0",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          {/* Type Icon */}
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: "white",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#3b82f6",
                            }}
                          >
                            {lesson.type === "VIDEO" ? (
                              <PlayCircleFilledWhite
                                sx={{ color: "#3b82f6" }}
                              />
                            ) : lesson.type === "QUIZ" ? (
                              <Quiz fontSize="small" />
                            ) : (
                              <Article fontSize="small" />
                            )}
                          </Box>

                          <Box>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1.5}
                              mb={0.5}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                color="#1e293b"
                              >
                                {lesson.title}
                              </Typography>
                              {lesson.isPreview && (
                                <Chip
                                  label="Học thử"
                                  size="small"
                                  // Custom small chip style
                                  sx={{
                                    height: 20,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    bgcolor: "#d1fae5",
                                    color: "#059669",
                                    border: "none",
                                  }}
                                />
                              )}
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 500 }}
                            >
                              {lesson.type} •{" "}
                              {formatDuration(lesson.durationSeconds)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Actions */}
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleOpenEditLesson(section.sectionId, lesson)
                            }
                            sx={{
                              color: "#cbd5e1",
                              "&:hover": { color: "#3b82f6" },
                            }}
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDeleteLesson(
                                section.sectionId,
                                lesson.lessonId,
                              )
                            }
                            sx={{
                              color: "#cbd5e1",
                              "&:hover": { color: "#ef4444" },
                            }}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Stack>
      )}

      {/* --- Dialog: Section --- */}
      <Dialog
        open={sectionDialogOpen}
        onClose={() => setSectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>
          {editingSection ? "Chỉnh sửa chương" : "Thêm chương mới"}
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: "none" }}>
          <Stack spacing={3} py={1}>
            <TextField
              label="Tiêu đề chương"
              fullWidth
              value={sectionForm.title}
              onChange={(e) =>
                setSectionForm({ ...sectionForm, title: e.target.value })
              }
              autoFocus
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <FormControl fullWidth>
              <InputLabel>Vị trí</InputLabel>
              <Select
                label="Vị trí"
                value={sectionForm.position}
                onChange={(e) =>
                  setSectionForm({
                    ...sectionForm,
                    position: Number(e.target.value),
                  })
                }
                MenuProps={{
                  PaperProps: { sx: { maxHeight: 300, borderRadius: 2 } },
                }}
                sx={{ borderRadius: 2 }}
              >
                {Array.from({ length: 100 }, (_, i) => i + 1).map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    Phần {pos}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setSectionDialogOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              color: "#64748b",
              borderColor: "#cbd5e1",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateOrUpdateSection}
            variant="contained"
            disabled={!sectionForm.title}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Dialog: Lesson --- */}
      <Dialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>
          {editingLesson ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: "none" }}>
          <Stack spacing={3} py={1}>
            <TextField
              label="Tiêu đề bài học"
              fullWidth
              value={lessonForm.title}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, title: e.target.value })
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              label="Mô tả (tùy chọn)"
              fullWidth
              multiline
              rows={2}
              value={lessonForm.description}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, description: e.target.value })
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Loại bài học</InputLabel>
                <Select
                  label="Loại bài học"
                  value={lessonForm.type}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      type: e.target.value as any,
                    })
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="VIDEO">Video</MenuItem>
                  <MenuItem value="ARTICLE">Bài viết</MenuItem>
                  <MenuItem value="QUIZ">Trắc nghiệm</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Thứ tự</InputLabel>
                <Select
                  label="Thứ tự"
                  value={lessonForm.sortOrder}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      sortOrder: Number(e.target.value),
                    })
                  }
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                  sx={{ borderRadius: 2 }}
                >
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Cho phép học thử?</InputLabel>
              <Select
                label="Cho phép học thử?"
                value={lessonForm.isPreview ? "true" : "false"}
                onChange={(e) =>
                  setLessonForm({
                    ...lessonForm,
                    isPreview: e.target.value === "true",
                  })
                }
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="false">Không</MenuItem>
                <MenuItem value="true">Có</MenuItem>
              </Select>
            </FormControl>

            {lessonForm.type === "VIDEO" && (
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#f8fafc",
                  borderRadius: 3,
                  border: "1px dashed #cbd5e1",
                }}
              >
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  fontWeight={700}
                  color="#334155"
                >
                  Video bài giảng
                </Typography>

                {/* --- Video Preview Player --- */}
                {videoPreviewUrl && (
                  <Box
                    mt={1}
                    mb={2}
                    borderRadius={2}
                    overflow="hidden"
                    bgcolor="black"
                    sx={{ aspectRatio: "16/9" }}
                  >
                    <video
                      controls
                      width="100%"
                      height="100%"
                      src={videoPreviewUrl}
                      style={{ display: "block" }}
                    />
                  </Box>
                )}

                {/* --- Video Info or Upload Button --- */}
                {lessonForm.videoAssetId ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    bgcolor="white"
                    p={2}
                    borderRadius={2}
                    border="1px solid #e2e8f0"
                    boxShadow="0 1px 2px 0 rgba(0,0,0,0.05)"
                  >
                    <Box sx={{ p: 1, bgcolor: "#eff6ff", borderRadius: 2 }}>
                      <VideoLibrary color="primary" />
                    </Box>
                    <Box flex={1}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="#1e293b"
                      >
                        Video đã tải lên (ID: {lessonForm.videoAssetId})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Thời lượng: {formatDuration(lessonForm.durationSeconds)}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setLessonForm({
                          ...lessonForm,
                          videoAssetId: undefined,
                          durationSeconds: 0,
                        });
                        setVideoPreviewUrl(null);
                      }}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Xóa
                    </Button>
                  </Box>
                ) : (
                  <Box textAlign="center" py={2}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      style={{ display: "none" }}
                      onChange={handleFileSelect}
                    />
                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        backgroundColor: "white",
                        color: "#334155",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                        "&:hover": {
                          backgroundColor: "#f1f5f9",
                        },
                      }}
                    >
                      {uploading ? "Đang tải lên..." : "Tải video lên"}
                    </Button>
                    <Typography
                      variant="caption"
                      display="block"
                      mt={1.5}
                      color="text.secondary"
                    >
                      Hỗ trợ MP4, WebM. Tối đa 2GB.
                    </Typography>
                  </Box>
                )}

                {uploading && (
                  <Box mt={2}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography
                      variant="caption"
                      align="right"
                      display="block"
                      mt={0.5}
                      fontWeight={600}
                      color="primary"
                    >
                      {uploadProgress}%
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setLessonDialogOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              color: "#64748b",
              borderColor: "#cbd5e1",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateOrUpdateLesson}
            variant="contained"
            disabled={
              !lessonForm.title ||
              (lessonForm.type === "VIDEO" &&
                !lessonForm.videoAssetId &&
                !editingLesson?.videoUrl)
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
            }}
          >
            Lưu bài học
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseContentManagementPage;
