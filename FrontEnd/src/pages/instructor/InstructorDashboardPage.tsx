import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  InputAdornment,
  Grid,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Search,
  FilterList,
  Add,
  MoreVert,
  Download,
  School,
  AccessTime,
  Language,
  BarChart,
  EditOutlined,
  PlayCircleOutlined,
  SendOutlined,
  DeleteOutline,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  instructorService,
  type InstructorResponse,
  type UpdateInstructorProfileRequest,
} from "../../service/instructorService";
import {
  categoryService,
  type CategoryTreeResponse,
} from "../../service/categoryService";
import { CourseFormDialog } from "../../components/shared/CourseFormDialog";
import { userService } from "../../service/userService";
import {
  courseService,
  type CreateCourseRequest,
  type PublicCourseResponse,
} from "../../service/courseService";
import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../libs/errorUtils";
import { useLocation, useNavigate } from "react-router-dom";

const InstructorDashboardPage = () => {
  const { enqueueSnackbar } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"COURSES" | "PROFILE">(
    "COURSES",
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section === "PROFILE") setActiveSection("PROFILE");
    else setActiveSection("COURSES");
  }, [location.search]);

  const { tokens, user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<InstructorResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<"INFO" | "AVATAR" | "SECURITY">("INFO");
  const [profileForm, setProfileForm] = useState<UpdateInstructorProfileRequest>({
    headline: "", biography: "", website: "", linkedin: "", twitter: "", youtube: "",
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [createCourseDialogOpen, setCreateCourseDialogOpen] = useState(false);

  const [courses, setCourses] = useState<PublicCourseResponse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCourse, setEditingCourse] = useState<PublicCourseResponse | null>(null);
  const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Menu anchor
  const [courseMenuAnchor, setCourseMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});

  const flattenCategories = (
    cats: CategoryTreeResponse[],
    result: { id: number; name: string; level: number; path: string; hasChildren: boolean; }[] = [],
    parentPath = "",
  ): any[] => {
    cats.forEach((cat) => {
      const path = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
      const hasChildren = cat.children && cat.children.length > 0;
      result.push({ id: cat.id, name: cat.name, level: cat.level, path, hasChildren });
      if (hasChildren) flattenCategories(cat.children, result, path);
    });
    return result;
  };
  const flatCategories = flattenCategories(categories);

  useEffect(() => {
    categoryService.getCategoryTree().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!tokens?.accessToken) return;
      setCoursesLoading(true);
      try {
        const response = await courseService.getMyCourses({
          token: tokens.accessToken, search: searchTerm, size: 100,
        });
        setCourses(response.data);
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Không thể tải danh sách khóa học", { variant: "error" });
      } finally {
        setCoursesLoading(false);
      }
    };

    if (activeSection === "COURSES") {
      const timeoutId = setTimeout(() => void fetchCourses(), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [activeSection, searchTerm, tokens?.accessToken]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!tokens?.accessToken) return;
      try {
        setProfileLoading(true);
        const data = await instructorService.getMyProfile(tokens.accessToken);
        setProfile(data);
        setProfileForm({
          headline: data.headline ?? "", biography: data.biography ?? "", website: data.website ?? "",
          linkedin: data.linkedin ?? "", twitter: data.twitter ?? "", youtube: data.youtube ?? "",
        });
      } catch (error) {
        console.error(error);
      } finally {
        setProfileLoading(false);
      }
    };
    void fetchProfile();
  }, [tokens?.accessToken]);

  const handleSaveProfile = async () => {
    if (!tokens?.accessToken) return;
    try {
      setProfileSaving(true);
      const updated = await instructorService.updateMyProfile(tokens.accessToken, profileForm);
      setProfile(updated);
      enqueueSnackbar("Cập nhật hồ sơ thành công", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Không thể cập nhật hồ sơ", { variant: "error" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tokens?.accessToken) return;
    try {
      setAvatarUploading(true);
      const updatedUser = await userService.uploadAvatar(tokens.accessToken, file);
      setUser(updatedUser);
      enqueueSnackbar("Cập nhật ảnh thành công", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Upload avatar thất bại", { variant: "error" });
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const createSlug = (str: string): string => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  };

  const handleSubmitCourse = async (data: any) => {
    if (!tokens?.accessToken || !profile?.instructorId) return;
    try {
      const request: CreateCourseRequest = {
        instructorId: profile.instructorId, categoryId: Number(data.categoryId),
        title: data.title, slug: data.slug || createSlug(data.title),
        shortDescription: data.shortDescription, description: data.description,
        whatYouLearn: data.whatYouLearn, requirements: data.requirements,
        targetAudience: data.targetAudience, language: data.language,
        level: data.level, price: Number(data.price), hasCertificate: !!data.hasCertificate,
        thumbnailUrl: data.thumbnailUrl,
      };

      if (editingCourse) {
        await courseService.updateCourse(tokens.accessToken, editingCourse.courseId, request);
        enqueueSnackbar("Cập nhật thành công!", { variant: "success" });
      } else {
        await courseService.createCourse(tokens.accessToken, request);
        enqueueSnackbar("Tạo thành công!", { variant: "success" });
      }

      setCreateCourseDialogOpen(false);
      setEditingCourse(null);
      // Refresh
      const response = await courseService.getMyCourses({ token: tokens.accessToken, search: searchTerm, size: 100 });
      setCourses(response.data);
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error), { variant: "error" });
    }
  };

  const handleSubmitForApproval = async (courseId: number) => {
    if (!tokens?.accessToken) return;
    try {
      await courseService.submitForApproval(tokens.accessToken, courseId);
      enqueueSnackbar("Đã gửi duyệt", { variant: "success" });
      const res = await courseService.getMyCourses({ token: tokens.accessToken, search: searchTerm, size: 100 });
      setCourses(res.data);
      setCourseMenuAnchor({ ...courseMenuAnchor, [courseId]: null });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi", { variant: "error" });
    }
  };

  const handleExportExcel = async () => {
    if (!tokens?.accessToken) return;
    try {
      setExportLoading(true);
      const blob = await courseService.exportCourses(tokens.accessToken);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `my_courses.xlsx`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
      enqueueSnackbar("Export thành công", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar("Lỗi export", { variant: "error" });
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PUBLISHED": return { color: "#22c55e", label: "Đã xuất bản", bg: "#f0fdf4" };
      case "PENDING": return { color: "#f59e0b", label: "Đang chờ duyệt", bg: "#fffbeb" };
      case "REJECTED": return { color: "#ef4444", label: "Bị từ chối", bg: "#fef2f2" };
      case "DRAFT": return { color: "#64748b", label: "Bản nháp", bg: "#f8fafc" };
      default: return { color: "#64748b", label: status, bg: "#f8fafc" };
    }
  };

  return (
    <Box sx={{ p: { xs: 2.5, md: 5 }, maxWidth: 1400, mx: "auto", width: "100%" }}>
      {/* Header Area */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 5 }}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: "#0f172a", letterSpacing: "-0.02em" }}
          >
            {activeSection === "COURSES" ? "Khóa học của tôi" : "Hồ sơ cá nhân"}
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748b", mt: 0.5 }}>
            {activeSection === "COURSES"
              ? "Quản lý và cập nhật nội dung các khóa đào tạo của bạn."
              : "Xây dựng thương hiệu cá nhân để thu hút thêm học viên."}
          </Typography>
        </Box>
      </Box>

      {activeSection === "COURSES" ? (
        <>
          {/* Controls Bar */}
          <Card
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              borderRadius: "16px",
              bgcolor: "white",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              placeholder="Tìm kiếm theo tiêu đề..."
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#94a3b8", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#f8fafc",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "transparent" },
                  "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                },
              }}
            />

            <Stack direction="row" spacing={1.5} sx={{ width: { xs: "100%", md: "auto" } }}>
              <Button
                variant="outlined"
                startIcon={exportLoading ? <CircularProgress size={16} /> : <Download />}
                onClick={handleExportExcel}
                sx={{
                  borderRadius: "10px", textTransform: "none", fontWeight: 600,
                  borderColor: "#e2e8f0", color: "#475569", px: 2,
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                }}
              >
                Xuất Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateCourseDialogOpen(true)}
                sx={{
                  borderRadius: "10px", textTransform: "none", fontWeight: 700,
                  px: 3, py: 1.1, bgcolor: "#3b82f6",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                  "&:hover": { bgcolor: "#2563eb", boxShadow: "0 6px 16px rgba(59, 130, 246, 0.35)" },
                }}
              >
                Tạo khóa học mới
              </Button>
            </Stack>
          </Card>

          {/* Courses List */}
          {coursesLoading ? (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <CircularProgress size={40} />
            </Box>
          ) : courses.length === 0 ? (
            <Box
              sx={{
                py: 12, textAlign: "center", bgcolor: "white", borderRadius: "24px",
                border: "2px dashed #e2e8f0",
              }}
            >
              <Box sx={{ mb: 2 }}>
                <School sx={{ fontSize: 60, color: "#cbd5e1" }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="#334155">
                Chưa có khóa học nào
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mb: 3 }}>
                Gần đây bạn chưa tạo khóa học nào. Hãy bắt đầu ngay bây giờ!
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setCreateCourseDialogOpen(true)}
                sx={{ borderRadius: "10px", textTransform: "none", px: 3 }}
              >
                Bắt đầu tạo khóa học
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {courses.map((course) => {
                const status = getStatusConfig(course.status);
                return (
                  <Grid item xs={12} key={course.courseId}>
                    <Card
                      elevation={0}
                      sx={{
                        p: 0,
                        borderRadius: "20px",
                        border: "1px solid #e2e8f0",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "#3b82f6",
                          boxShadow: "0 12px 30px rgba(0,0,0,0.04)",
                          transform: "translateY(-2px)",
                        },
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        overflow: "hidden",
                      }}
                    >
                      {/* Thumbnail Container */}
                      <Box
                        sx={{
                          width: { xs: "100%", sm: 260 },
                          height: { xs: 160, sm: "auto" },
                          bgcolor: "#f1f5f9",
                          position: "relative",
                          overflow: "hidden"
                        }}
                      >
                        {course.thumbnailUrl ? (
                          <Box
                            component="img"
                            src={course.thumbnailUrl}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                            <PlayCircleOutlined sx={{ fontSize: 48, color: "#cbd5e1" }} />
                          </Box>
                        )}
                        <Box
                          sx={{
                            position: "absolute", top: 12, left: 12,
                            px: 1.5, py: 0.6, borderRadius: "6px",
                            fontSize: 11, fontWeight: 700,
                            bgcolor: status.bg, color: status.color,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          }}
                        >
                          {status.label}
                        </Box>
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="h6" fontWeight={800} sx={{ color: "#1e293b", lineHeight: 1.3 }}>
                            {course.title}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => setCourseMenuAnchor({ ...courseMenuAnchor, [course.courseId]: e.currentTarget })}
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b", mb: 2, display: "-webkit-box",
                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}
                        >
                          {course.shortDescription || course.description || "Chưa có mô tả chi tiết cho khóa học này."}
                        </Typography>

                        <Stack direction="row" spacing={3} sx={{ mt: "auto", pt: 2, borderTop: "1px solid #f1f5f9" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <Language sx={{ fontSize: 16, color: "#94a3b8" }} />
                            <Typography variant="caption" fontWeight={600} color="#64748b">{course.language}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <BarChart sx={{ fontSize: 16, color: "#94a3b8" }} />
                            <Typography variant="caption" fontWeight={600} color="#64748b">{course.level}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <AccessTime sx={{ fontSize: 16, color: "#94a3b8" }} />
                            <Typography variant="caption" fontWeight={600} color="#64748b">
                              {new Date(course.updatedAt || "").toLocaleDateString("vi-VN")}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Action Sidebar (Right part of card) */}
                      <Box
                        sx={{
                          width: { xs: "100%", sm: 200 },
                          p: 2.5,
                          bgcolor: "#fafbfc",
                          borderLeft: "1px solid #f1f5f9",
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.2,
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          onClick={() => navigate(`/instructor/courses/${course.courseId}/content`)}
                          sx={{
                            bgcolor: "#1e293b", color: "white", textTransform: "none",
                            fontWeight: 700, borderRadius: "8px", py: 1,
                            "&:hover": { bgcolor: "#0f172a" },
                          }}
                        >
                          Nội dung bài học
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          size="small"
                          startIcon={<EditOutlined />}
                          onClick={() => { setEditingCourse(course); setCreateCourseDialogOpen(true); }}
                          sx={{
                            borderColor: "#e2e8f0", color: "#475569", textTransform: "none",
                            fontWeight: 600, borderRadius: "8px", py: 1,
                          }}
                        >
                          Chỉnh sửa
                        </Button>
                      </Box>

                      {/* Row Menu */}
                      <Menu
                        anchorEl={courseMenuAnchor[course.courseId]}
                        open={Boolean(courseMenuAnchor[course.courseId])}
                        onClose={() => setCourseMenuAnchor({ ...courseMenuAnchor, [course.courseId]: null })}
                        elevation={2}
                        sx={{ "& .MuiPaper-root": { borderRadius: "12px", minWidth: 160, mt: 1 } }}
                      >
                        <MenuItem onClick={() => navigate(`/courses/${course.slug}`)}>
                          <VisibilityOutlined sx={{ fontSize: 18, mr: 1.5, color: "#64748b" }} />
                          <Typography variant="body2" fontWeight={500}>Xem trang khóa học</Typography>
                        </MenuItem>
                        {(course.status === "DRAFT" || course.status === "REJECTED") && (
                          <MenuItem onClick={() => handleSubmitForApproval(course.courseId)}>
                            <SendOutlined sx={{ fontSize: 18, mr: 1.5, color: "#3b82f6" }} />
                            <Typography variant="body2" fontWeight={500} color="#3b82f6">Gửi yêu cầu duyệt</Typography>
                          </MenuItem>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <MenuItem sx={{ color: "#ef4444" }}>
                          <DeleteOutline sx={{ fontSize: 18, mr: 1.5 }} />
                          <Typography variant="body2" fontWeight={500}>Xóa khóa học</Typography>
                        </MenuItem>
                      </Menu>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          <CourseFormDialog
            open={createCourseDialogOpen}
            onClose={() => { setCreateCourseDialogOpen(false); setEditingCourse(null); }}
            onSubmit={handleSubmitCourse}
            editingCourse={editingCourse}
            mode="INSTRUCTOR"
            flatCategories={flatCategories}
          />
        </>
      ) : (
        /* PROFILE SECTION Redesign */
        <Card
          elevation={0}
          sx={{ borderRadius: "24px", overflow: "hidden", border: "1px solid #e2e8f0" }}
        >
          <Box sx={{ borderBottom: "1px solid #f1f5f9", bgcolor: "#fafafa" }}>
            <Tabs
              value={activeProfileTab}
              onChange={(_, v) => setActiveProfileTab(v)}
              sx={{ px: 3, "& .MuiTab-root": { textTransform: "none", fontWeight: 700, minHeight: 64, py: 0, fontSize: "0.95rem" } }}
            >
              <Tab value="INFO" label="Thông tin tiểu sử" />
              <Tab value="AVATAR" label="Ảnh đại diện" />
              <Tab value="SECURITY" label="Bảo mật & Quyền riêng tư" />
            </Tabs>
          </Box>

          <Box sx={{ p: { xs: 3, md: 5 } }}>
            {activeProfileTab === "INFO" && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    <TextField
                      label="Đầu đề (Headline)"
                      fullWidth
                      helperText="Ví dụ: Chuyên gia thiết kế đồ họa, Kỹ sư phần mềm cao cấp..."
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    />
                    <TextField
                      label="Tiểu sử bản thân"
                      fullWidth
                      multiline
                      minRows={6}
                      value={profileForm.biography}
                      onChange={(e) => setProfileForm({ ...profileForm, biography: e.target.value })}
                    />
                    <Box sx={{ pt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>Mạng xã hội & Liên kết</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField label="Website cá nhân" fullWidth size="small" value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="LinkedIn" fullWidth size="small" value={profileForm.linkedin} onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="X (Twitter)" fullWidth size="small" value={profileForm.twitter} onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField label="YouTube" fullWidth size="small" value={profileForm.youtube} onChange={(e) => setProfileForm({ ...profileForm, youtube: e.target.value })} />
                        </Grid>
                      </Grid>
                    </Box>
                    <Box sx={{ pt: 2, display: "flex", gap: 2 }}>
                      <Button
                        variant="contained"
                        disabled={profileSaving}
                        onClick={handleSaveProfile}
                        sx={{ px: 4, borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                      >
                        {profileSaving ? <CircularProgress size={20} /> : "Lưu thay đổi"}
                      </Button>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 3, borderRadius: "20px", bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1, color: "#1e293b" }}>Mẹo nhỏ cho hồ sơ của bạn</Typography>
                    <Typography variant="caption" color="#64748b" sx={{ lineHeight: 1.6, display: "block" }}>
                      • Một tiêu đề ngắn gọn nhưng ấn tượng giúp thu hút học viên ngay cái nhìn đầu tiên.<br /><br />
                      • Chia sẻ về kinh nghiệm thực tế và những gì bạn đam mê.<br /><br />
                      • Đừng quên đính kèm website hoặc LinkedIn để tăng độ tin cậy.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}

            {activeProfileTab === "AVATAR" && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
                  <Avatar
                    src={user?.avatarUrl}
                    sx={{ width: 160, height: 160, borderRadius: "32px", border: "4px solid #fff", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
                  />
                  {avatarUploading && (
                    <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(255,255,255,0.7)", borderRadius: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                </Box>
                <Typography variant="h6" fontWeight={700}>Ảnh hồ sơ của bạn</Typography>
                <Typography variant="body2" color="#64748b" sx={{ mt: 1, mb: 4, maxWidth: 400, mx: "auto" }}>
                  Ảnh hồ sơ rõ nét giúp xây dựng lòng tin với cộng đồng học viên EduSpace.
                </Typography>
                <input type="file" hidden ref={avatarInputRef} accept="image/*" onChange={handleAvatarFileChange} />
                <Button
                  variant="contained"
                  onClick={() => avatarInputRef.current?.click()}
                  sx={{ borderRadius: "10px", px: 4, py: 1.2, textTransform: "none", fontWeight: 700 }}
                >
                  Tải ảnh mới lên
                </Button>
              </Box>
            )}

            {activeProfileTab === "SECURITY" && (
              <Box sx={{ maxWidth: 600 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Cài đặt bảo mật</Typography>
                <Typography variant="body2" color="#64748b">Phần này đang được cập nhật thêm các tính năng...</Typography>
              </Box>
            )}
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default InstructorDashboardPage;
