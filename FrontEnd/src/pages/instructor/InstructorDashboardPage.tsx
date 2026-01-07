import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Search, FilterList, Add, MoreVert, Download } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  instructorService,
  type InstructorResponse,
  type UpdateInstructorProfileRequest,
} from "../../service/instructorService";
import { categoryService, type CategoryTreeResponse } from "../../service/categoryService";
import { CourseFormDialog } from "../../components/shared/CourseFormDialog";

import { userService } from "../../service/userService";
import {
  courseService,
  type CreateCourseRequest,
  type PublicCourseResponse,
} from "../../service/courseService";
import { useToast } from "../../hooks/useToast";
import { useLocation } from "react-router-dom";


const InstructorDashboardPage = () => {
  const { enqueueSnackbar } = useToast();
  const location = useLocation();
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
  const [activeProfileTab, setActiveProfileTab] = useState<
    "INFO" | "AVATAR" | "SECURITY"
  >("INFO");
  const [profileForm, setProfileForm] =
    useState<UpdateInstructorProfileRequest>({
      headline: "",
      biography: "",
      website: "",
      linkedin: "",
      twitter: "",
      youtube: "",
    });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [securitySettings, setSecuritySettings] = useState({
    showProfileToLoggedInUsers: true,
    showEnrolledCoursesOnProfile: true,
  });
  const [createCourseDialogOpen, setCreateCourseDialogOpen] = useState(false);

  const [courses, setCourses] = useState<PublicCourseResponse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCourse, setEditingCourse] = useState<PublicCourseResponse | null>(null);
  const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Flatten categories util
  const flattenCategories = (
    cats: CategoryTreeResponse[],
    result: { id: number; name: string; level: number; path: string; hasChildren: boolean }[] = [],
    parentPath = "",
  ): { id: number; name: string; level: number; path: string; hasChildren: boolean }[] => {
    cats.forEach((cat) => {
      const path = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
      const hasChildren = cat.children && cat.children.length > 0;
      result.push({ id: cat.id, name: cat.name, level: cat.level, path, hasChildren });
      if (hasChildren) {
        flattenCategories(cat.children, result, path);
      }
    });
    return result;
  };
  const flatCategories = flattenCategories(categories);


  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getCategoryTree();
        setCategories(cats);
      } catch (error) { console.error(error); }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!tokens?.accessToken) return;
      setCoursesLoading(true);
      try {
        const response = await courseService.getMyCourses({
          token: tokens.accessToken,
          search: searchTerm,
          size: 100, // Fetch more for now
        });
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
        enqueueSnackbar("Không thể tải danh sách khóa học", {
          variant: "error",
        });
      } finally {
        setCoursesLoading(false);
      }
    };

    if (activeSection === "COURSES") {
      const timeoutId = setTimeout(() => {
        void fetchCourses();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [activeSection, searchTerm, tokens?.accessToken, enqueueSnackbar]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!tokens?.accessToken) return;
      try {
        setProfileLoading(true);
        const data = await instructorService.getMyProfile(tokens.accessToken);
        setProfile(data);
        setProfileForm({
          headline: data.headline ?? "",
          biography: data.biography ?? "",
          website: data.website ?? "",
          linkedin: data.linkedin ?? "",
          twitter: data.twitter ?? "",
          youtube: data.youtube ?? "",
        });
      } catch (error) {
        console.error("Không thể tải hồ sơ giảng viên:", error);
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
      const updated = await instructorService.updateMyProfile(
        tokens.accessToken,
        profileForm,
      );
      setProfile(updated);
      enqueueSnackbar("Cập nhật hồ sơ thành công", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Không thể cập nhật hồ sơ giảng viên", {
        variant: "error",
      });
      console.error("Không thể cập nhật hồ sơ giảng viên:", error);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleClickAvatarUpload = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleAvatarFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !tokens?.accessToken) return;

    try {
      setAvatarUploading(true);
      const updatedUser = await userService.uploadAvatar(
        tokens.accessToken,
        file,
      );
      setUser(updatedUser);
      enqueueSnackbar("Cập nhật ảnh đại diện thành công", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Upload avatar thất bại", {
        variant: "error",
      });
      console.error("Upload avatar thất bại:", error);
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmitCourse = async (data: any) => {
    if (!tokens?.accessToken || !profile?.instructorId) {
      enqueueSnackbar("Không tìm thấy thông tin giảng viên", {
        variant: "error",
      });
      return;
    }
    try {
      const request: CreateCourseRequest = {
        instructorId: profile.instructorId,
        categoryId: Number(data.categoryId),
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/ /g, "-"),
        shortDescription: data.shortDescription,
        description: data.description,
        whatYouLearn: data.whatYouLearn,
        requirements: data.requirements,
        targetAudience: data.targetAudience,
        language: data.language,
        level: data.level,
        price: data.price ? Number(data.price) : 0,
        hasCertificate: data.hasCertificate,
      };
      // Manually add extra fields if CreateCourseRequest interface is strict but backend accepts them
      (request as any).thumbnailUrl = data.thumbnailUrl;

      if (editingCourse) {

        await courseService.updateCourse(tokens.accessToken, editingCourse.courseId, request);
        enqueueSnackbar("Cập nhật khóa học thành công!", { variant: "success" });
      } else {
        await courseService.createCourse(tokens.accessToken, request);
        enqueueSnackbar("Tạo khóa học thành công!", { variant: "success" });
      }

      // Refresh list
      const response = await courseService.getMyCourses({
        token: tokens.accessToken,
        search: searchTerm,
        size: 100,
      });
      setCourses(response.data);
      setCreateCourseDialogOpen(false);
      setEditingCourse(null);

    } catch (error: any) {
      throw error;
    }
  };

  const handleEditClick = (course: PublicCourseResponse) => {
    setEditingCourse(course);
    setCreateCourseDialogOpen(true);
  };

  const handleSubmitForApproval = async (courseId: number) => {
    if (!tokens?.accessToken) return;
    try {
      await courseService.submitForApproval(tokens.accessToken, courseId);
      enqueueSnackbar("Đã gửi yêu cầu duyệt khóa học", { variant: "success" });
      // Refresh courses
      const response = await courseService.getMyCourses({
        token: tokens.accessToken,
        search: searchTerm,
        size: 100,
      });
      setCourses(response.data);
    } catch (error: any) {
      enqueueSnackbar(error.message || "Không thể gửi yêu cầu", {
        variant: "error",
      });
    }
  };

  const handleExportExcel = async () => {
    if (!tokens?.accessToken) return;
    try {
      setExportLoading(true);
      const blob = await courseService.exportCourses(tokens.accessToken);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `courses_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      enqueueSnackbar("Export danh sách khóa học thành công", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Không thể export khóa học", { variant: "error" });
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
      case "ARCHIVED":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "Đã xuất bản";
      case "PENDING":
        return "Chờ duyệt";
      case "REJECTED":
        return "Bị từ chối";
      case "ARCHIVED":
        return "Lưu trữ";
      case "DRAFT":
        return "Nháp";
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            {activeSection === "COURSES" ? "Khóa học" : "Hồ sơ & cài đặt"}
          </Typography>
        </Box>

        {activeSection === "COURSES" && (
          <>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ mb: 3 }}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                placeholder="Tìm kiếm khóa học của bạn"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                sx={{ textTransform: "none", whiteSpace: "nowrap" }}
              >
                Mới nhất
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={exportLoading ? <CircularProgress size={20} /> : <Download />}
                onClick={handleExportExcel}
                disabled={exportLoading}
                sx={{ textTransform: "none", whiteSpace: "nowrap" }}
              >
                Xuất Excel
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateCourseDialogOpen(true)}
                sx={{ textTransform: "none", bgcolor: "#3b82f6", whiteSpace: "nowrap" }}
              >
                Khóa học mới
              </Button>
            </Stack>

            <CourseFormDialog
              open={createCourseDialogOpen}
              onClose={() => {
                setCreateCourseDialogOpen(false);
                setEditingCourse(null);
              }}
              onSubmit={handleSubmitCourse}
              editingCourse={editingCourse}
              mode="INSTRUCTOR"
              flatCategories={flatCategories}
            />

            <Stack spacing={2}>
              {coursesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : courses.length === 0 ? (
                <Typography
                  textAlign="center"
                  color="text.secondary"
                  sx={{ py: 4 }}
                >
                  Không tìm thấy khóa học nào.
                </Typography>
              ) : (
                courses.map((course) => (
                  <Card
                    key={course.courseId}
                    sx={{
                      p: { xs: 2, md: 3 },
                      border: "1px solid #edeff1",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {course.title}
                      </Typography>
                      <Box>
                        <Chip
                          label={getStatusLabel(course.status)}
                          color={getStatusColor(course.status) as any}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <IconButton>
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {course.shortDescription ||
                        course.description ||
                        "Chưa có mô tả"}
                    </Typography>
                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        mt: 1,
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          href={`/instructor/courses/${course.courseId}/content`}
                          sx={{ textTransform: "none" }}
                        >
                          Quản lý nội dung
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          sx={{ textTransform: "none" }}
                          onClick={() => handleEditClick(course)}
                        >
                          Chỉnh sửa
                        </Button>
                      </Box>
                      {(course.status === "DRAFT" ||
                        course.status === "REJECTED") && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() =>
                              handleSubmitForApproval(course.courseId)
                            }
                          >
                            Gửi duyệt
                          </Button>
                        )}
                    </Box>
                  </Card>
                ))
              )}
            </Stack>
          </>
        )}

        {activeSection === "PROFILE" && (
          <Card
            sx={{
              p: { xs: 2, md: 3 },
              border: "1px solid #edeff1",
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            }}
          >
            <Tabs
              value={activeProfileTab}
              onChange={(_, value) =>
                setActiveProfileTab(value as "INFO" | "AVATAR" | "SECURITY")
              }
              sx={{ mb: 3 }}
            >
              <Tab
                value="INFO"
                label="Hồ sơ Udemy"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
              <Tab
                value="AVATAR"
                label="Ảnh hồ sơ"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
              <Tab
                value="SECURITY"
                label="Cài đặt bảo mật"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
            </Tabs>

            {activeProfileTab === "INFO" && (
              <>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Thông tin cơ bản
                </Typography>
                {profileLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      py: 4,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" gap={3}>
                    <TextField
                      label="Đầu đề (headline)"
                      fullWidth
                      value={profileForm.headline ?? ""}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          headline: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      label="Tiểu sử (biography)"
                      fullWidth
                      multiline
                      minRows={4}
                      value={profileForm.biography ?? ""}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          biography: e.target.value,
                        }))
                      }
                    />
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField
                          label="Trang web"
                          fullWidth
                          value={profileForm.website ?? ""}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              website: e.target.value,
                            }))
                          }
                        />
                        <TextField
                          label="LinkedIn"
                          fullWidth
                          value={profileForm.linkedin ?? ""}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              linkedin: e.target.value,
                            }))
                          }
                        />
                      </Stack>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField
                          label="Twitter / X"
                          fullWidth
                          value={profileForm.twitter ?? ""}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              twitter: e.target.value,
                            }))
                          }
                        />
                        <TextField
                          label="YouTube"
                          fullWidth
                          value={profileForm.youtube ?? ""}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              youtube: e.target.value,
                            }))
                          }
                        />
                      </Stack>
                    </Stack>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <Button
                        variant="outlined"
                        sx={{ textTransform: "none" }}
                        onClick={() => {
                          if (!profile) return;
                          setProfileForm({
                            headline: profile.headline ?? "",
                            biography: profile.biography ?? "",
                            website: profile.website ?? "",
                            linkedin: profile.linkedin ?? "",
                            twitter: profile.twitter ?? "",
                            youtube: profile.youtube ?? "",
                          });
                        }}
                      >
                        Hoàn tác
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ textTransform: "none" }}
                        onClick={handleSaveProfile}
                        disabled={profileSaving}
                      >
                        {profileSaving ? "Đang lưu..." : "Lưu hồ sơ"}
                      </Button>
                    </Box>
                  </Box>
                )}
              </>
            )}

            {activeProfileTab === "AVATAR" && (
              <Box display="flex" flexDirection="column" gap={3}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Ảnh hồ sơ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ảnh hồ sơ giúp học viên nhận ra bạn trên Udemy. Sử dụng ảnh rõ
                  nét, chuyên nghiệp.
                </Typography>
                <Box display="flex" alignItems="center" gap={3}>
                  <Avatar
                    src={user?.avatarUrl}
                    sx={{
                      width: 120,
                      height: 120,
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Button
                      variant="contained"
                      sx={{ textTransform: "none" }}
                      onClick={handleClickAvatarUpload}
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? "Đang tải..." : "Tải hình ảnh lên"}
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Tối thiểu 200x200 pixel, tối đa 6000x6000 pixel.
                    </Typography>
                  </Box>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarFileChange}
                  />
                </Box>
              </Box>
            )}

            {activeProfileTab === "SECURITY" && (
              <Box display="flex" flexDirection="column" gap={3}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Cài đặt bảo mật
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={securitySettings.showProfileToLoggedInUsers}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({
                          ...prev,
                          showProfileToLoggedInUsers: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Hiển thị hồ sơ của bạn cho người dùng đã đăng nhập"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={securitySettings.showEnrolledCoursesOnProfile}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({
                          ...prev,
                          showEnrolledCoursesOnProfile: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Hiển thị các khóa học bạn đang tham gia trên trang hồ sơ của bạn"
                />
                <Box>
                  <Button
                    variant="contained"
                    sx={{ textTransform: "none" }}
                  // Hiện tại chỉ lưu local state, chưa gọi API riêng.
                  >
                    Lưu
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default InstructorDashboardPage;
