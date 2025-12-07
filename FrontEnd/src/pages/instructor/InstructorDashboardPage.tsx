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
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  PlayCircleOutline,
  ForumOutlined,
  EqualizerOutlined,
  BuildOutlined,
  HelpOutlineOutlined,
  Search,
  FilterList,
  Add,
  MoreVert,
  Menu as MenuIcon,
  PersonOutline,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  instructorService,
  type InstructorResponse,
  type UpdateInstructorProfileRequest,
} from "../../service/instructorService";

const sidebarItems: {
  label: string;
  icon: JSX.Element;
  hasDot?: boolean;
  section?: "COURSES" | "PROFILE";
}[] = [
  { label: "Khóa học", icon: <PlayCircleOutline />, section: "COURSES" },
  { label: "Giao tiếp", icon: <ForumOutlined />, hasDot: true, section: "COURSES" },
  { label: "Hiệu suất", icon: <EqualizerOutlined />, section: "COURSES" },
  { label: "Công cụ", icon: <BuildOutlined />, section: "COURSES" },
  { label: "Tài nguyên", icon: <HelpOutlineOutlined />, section: "COURSES" },
  { label: "Hồ sơ", icon: <PersonOutline />, section: "PROFILE" },
];

const courseDrafts = [
  {
    id: 1,
    title: "đSaaaaaaaaaa",
    status: "BẢN NHÁP",
    visibility: "Công khai",
    progress: 45,
    description: "Kết thúc khóa học của bạn",
  },
  {
    id: 2,
    title: "Xây dựng ứng dụng React + TypeScript",
    status: "BẢN NHÁP",
    visibility: "Riêng tư",
    progress: 30,
    description: "Hoàn thiện nội dung và bài tập",
  },
];

import { userService } from "../../service/userService";

const InstructorDashboardPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<"COURSES" | "PROFILE">(
    "COURSES",
  );
  const [activeSidebarItem, setActiveSidebarItem] =
    useState<string>("Khóa học");
  const { tokens, user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<InstructorResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<
    "INFO" | "AVATAR" | "SECURITY"
  >("INFO");
  const [profileForm, setProfileForm] = useState<UpdateInstructorProfileRequest>(
    {
      headline: "",
      biography: "",
      website: "",
      linkedin: "",
      twitter: "",
      youtube: "",
    },
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [securitySettings, setSecuritySettings] = useState({
    showProfileToLoggedInUsers: true,
    showEnrolledCoursesOnProfile: true,
  });

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

    if (activeSection === "PROFILE" && activeProfileTab === "INFO") {
      void fetchProfile();
    }
  }, [activeSection, activeProfileTab, tokens?.accessToken]);

  const handleSaveProfile = async () => {
    if (!tokens?.accessToken) return;
    try {
      setProfileSaving(true);
      const updated = await instructorService.updateMyProfile(
        tokens.accessToken,
        profileForm,
      );
      setProfile(updated);
    } catch (error) {
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
    } catch (error) {
      console.error("Upload avatar thất bại:", error);
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fb" }}>
      <Box
        sx={{
          width: sidebarCollapsed ? 80 : 240,
          bgcolor: "#0e0f1a",
          color: "white",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          py: 3,
          px: 2,
          gap: 3,
          transition: "width 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
            gap: 1,
          }}
        >
          {!sidebarCollapsed && (
            <Typography variant="h5" fontWeight={700}>
              vidi
            </Typography>
          )}
          <IconButton
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.08)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Stack spacing={1} alignItems={sidebarCollapsed ? "center" : "stretch"}>
          {sidebarItems.map((item) => {
            const isActive = item.label === activeSidebarItem;
            return (
              <Button
                key={item.label}
                startIcon={!sidebarCollapsed ? item.icon : undefined}
                onClick={() => {
                  setActiveSidebarItem(item.label);
                  if (item.section === "PROFILE") {
                    setActiveSection("PROFILE");
                  } else if (item.section === "COURSES") {
                    setActiveSection("COURSES");
                  }
                }}
                sx={{
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: sidebarCollapsed ? 0 : 2,
                  py: 1.25,
                  bgcolor: isActive ? "#3b82f6" : "transparent",
                  position: "relative",
                  minWidth: sidebarCollapsed ? 48 : "auto",
                  "&:hover": { bgcolor: "#1f1f2b" },
                }}
              >
                {sidebarCollapsed ? item.icon : item.label}
                {item.hasDot && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: "#3b82f6",
                      borderRadius: "50%",
                      ml: "auto",
                    }}
                  />
                )}
              </Button>
            );
          })}
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          p: { xs: 2, md: 4 },
          transition: "margin-left 0.3s ease",
        }}
      >
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
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                sx={{ textTransform: "none" }}
              >
                Mới nhất
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ textTransform: "none", bgcolor: "#a435f0" }}
              >
                Khóa học mới
              </Button>
            </Stack>

            <Card
              sx={{
                mb: 3,
                p: { xs: 2, md: 3 },
                border: "1px solid #edeff1",
                boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Chip label="Mới" color="success" size="small" />
                <Typography fontWeight={700}>
                  Chúng tôi đã nâng cấp các bài kiểm tra thực hành để bạn có
                  thể nâng cấp bài kiểm tra của bạn.
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Với những cải tiến về sáng tạo câu hỏi, các câu hỏi mới và các
                tính năng AI tạo sinh, sẽ tăng tối đa tiềm năng luyện thi chứng
                chỉ cho bài kiểm tra thực hành của bạn.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  sx={{ textTransform: "none", bgcolor: "#3b82f6" }}
                >
                  Tìm hiểu thêm
                </Button>
                <Button variant="text" sx={{ textTransform: "none" }}>
                  Hủy bỏ
                </Button>
              </Stack>
            </Card>

            <Stack spacing={2}>
              {courseDrafts.map((course) => (
                <Card
                  key={course.id}
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
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {course.status} · {course.visibility}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.description}
                  </Typography>
                  <Divider />
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        height: 8,
                        bgcolor: "#edeff1",
                        borderRadius: 4,
                      }}
                    >
                      <Box
                        sx={{
                          width: `${course.progress}%`,
                          bgcolor: "#3b82f6",
                          height: "100%",
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {course.progress}%
                    </Typography>
                  </Box>
                </Card>
              ))}
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
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
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
                      </Grid>
                      <Grid item xs={12} md={6}>
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
                      </Grid>
                      <Grid item xs={12} md={6}>
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
                      </Grid>
                      <Grid item xs={12} md={6}>
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
                      </Grid>
                    </Grid>
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
                  Ảnh hồ sơ giúp học viên nhận ra bạn trên Udemy. Sử dụng ảnh
                  rõ nét, chuyên nghiệp.
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
                  control={(
                    <Checkbox
                      checked={securitySettings.showProfileToLoggedInUsers}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({
                          ...prev,
                          showProfileToLoggedInUsers: e.target.checked,
                        }))
                      }
                    />
                  )}
                  label="Hiển thị hồ sơ của bạn cho người dùng đã đăng nhập"
                />
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={securitySettings.showEnrolledCoursesOnProfile}
                      onChange={(e) =>
                        setSecuritySettings((prev) => ({
                          ...prev,
                          showEnrolledCoursesOnProfile: e.target.checked,
                        }))
                      }
                    />
                  )}
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

