import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  InputAdornment,
  Pagination,
  Avatar,
  Tooltip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
  Grid,
  Alert,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Search,
  Block,
  CheckCircle,
  Person,
  School,
  AdminPanelSettings,
  FilterList,
  CloudUpload,
  Language,
  LinkedIn,
  Twitter,
  YouTube,
} from "@mui/icons-material";
import { useToast } from "../../hooks/useToast";
import { useAuthStore } from "../../store/authStore";
import { adminUserService } from "../../service/adminUserService";
import { instructorService } from "../../service/instructorService";

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
  avatar?: string;
  instructor?: {
    id?: number;
    headline?: string;
    biography?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    totalStudents?: number;
    totalCourses?: number;
  };
}

const UserManagement = () => {
  const theme = useTheme();
  const { tokens } = useAuthStore();
  const { enqueueSnackbar } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<"USERS" | "INSTRUCTORS">("USERS");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!tokens?.accessToken) return;
      try {
        const pageResult = await adminUserService.getUsers(tokens.accessToken, {
          page: page - 1,
          size: itemsPerPage,
          search: searchTerm,
        });

        const mappedUsers: User[] = (pageResult.data || []).map((u) => {
          const normalizedRoles =
            u.roles?.map((role) => role.toUpperCase()) ?? [];
          const role: User["role"] = normalizedRoles.includes("ADMIN")
            ? "ADMIN"
            : normalizedRoles.includes("INSTRUCTOR")
              ? "INSTRUCTOR"
              : "STUDENT";

          return {
            id: u.userId,
            name: u.fullName,
            email: u.email,
            // map roles từ backend sang 3 loại hiển thị chính
            role,
            // Map status từ backend: LOCKED -> BLOCKED, ACTIVE -> ACTIVE
            status: u.status === "LOCKED" ? "BLOCKED" : "ACTIVE",
            createdAt: new Date().toISOString().split("T")[0],
            avatar: u.avatarUrl,
            instructor:
              role === "INSTRUCTOR"
                ? {
                    id: u.instructorId,
                    headline: u.instructorHeadline,
                    biography: u.instructorBiography,
                    website: u.instructorWebsite,
                    linkedin: u.instructorLinkedin,
                    twitter: u.instructorTwitter,
                    youtube: u.instructorYoutube,
                    totalStudents: u.instructorTotalStudents,
                    totalCourses: u.instructorTotalCourses,
                  }
                : undefined,
          };
        });

        setUsers(mappedUsers);
        setTotalPages(pageResult.pagination?.totalPages || 1);
      } catch (error) {
        enqueueSnackbar("Không thể tải danh sách người dùng", {
          variant: "error",
        });
        console.error("Không thể tải danh sách người dùng:", error);
      }
    };

    void fetchUsers();
  }, [tokens?.accessToken, page, searchTerm, refreshKey]);

  const handleImportExcel = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !tokens?.accessToken) return;

    try {
      setIsImporting(true);
      await adminUserService.importUsers(tokens.accessToken, file);
      enqueueSnackbar("Import danh sách người dùng thành công", {
        variant: "success",
      });
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      enqueueSnackbar(error.message || "Import thất bại", {
        variant: "error",
      });
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT" as User["role"],
    status: "ACTIVE" as User["status"],
    instructorHeadline: "",
    instructorBiography: "",
    instructorWebsite: "",
    instructorLinkedin: "",
    instructorTwitter: "",
    instructorYoutube: "",
  });

  // Validation state
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    instructorWebsite: "",
    instructorLinkedin: "",
    instructorTwitter: "",
    instructorYoutube: "",
  });

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return "Email là bắt buộc";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return "Họ và tên là bắt buộc";
    }
    if (name.trim().length < 2) {
      return "Họ và tên phải có ít nhất 2 ký tự";
    }
    return "";
  };

  const validateUrl = (url: string): string => {
    if (!url.trim()) {
      return ""; // URL is optional
    }
    try {
      new URL(url);
      return "";
    } catch {
      return "URL không hợp lệ";
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      instructorWebsite: validateUrl(formData.instructorWebsite),
      instructorLinkedin: validateUrl(formData.instructorLinkedin),
      instructorTwitter: validateUrl(formData.instructorTwitter),
      instructorYoutube: validateUrl(formData.instructorYoutube),
    };

    setFormErrors(errors);

    // Check if any error exists
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Password not editable when updating
        role: user.role,
        status: user.status,
        instructorHeadline: user.instructor?.headline ?? "",
        instructorBiography: user.instructor?.biography ?? "",
        instructorWebsite: user.instructor?.website ?? "",
        instructorLinkedin: user.instructor?.linkedin ?? "",
        instructorTwitter: user.instructor?.twitter ?? "",
        instructorYoutube: user.instructor?.youtube ?? "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        status: "ACTIVE",
        instructorHeadline: "",
        instructorBiography: "",
        instructorWebsite: "",
        instructorLinkedin: "",
        instructorTwitter: "",
        instructorYoutube: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
      status: "ACTIVE",
      instructorHeadline: "",
      instructorBiography: "",
      instructorWebsite: "",
      instructorLinkedin: "",
      instructorTwitter: "",
      instructorYoutube: "",
    });
    setFormErrors({
      name: "",
      email: "",
      instructorWebsite: "",
      instructorLinkedin: "",
      instructorTwitter: "",
      instructorYoutube: "",
    });
  };

  const handleExportExcel = async () => {
    if (!tokens?.accessToken) return;

    setIsExporting(true);
    try {
      const blob = await adminUserService.exportUsers(tokens.accessToken);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Export Excel thành công!", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Export Excel thất bại", {
        variant: "error",
      });
    } finally {
      setIsExporting(false);
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
    if (!file || !tokens?.accessToken || !editingUser) return;

    try {
      setAvatarUploading(true);
      const updatedUser = await adminUserService.updateUserAvatar(
        tokens.accessToken,
        editingUser.id,
        file,
      );

      // Cập nhật avatar trong danh sách users
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, avatar: updatedUser.avatarUrl } : u,
        ),
      );

      // Cập nhật avatar trong dialog hiện tại
      setEditingUser((prev) =>
        prev ? { ...prev, avatar: updatedUser.avatarUrl } : prev,
      );
      enqueueSnackbar("Cập nhật avatar thành công", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Cập nhật avatar thất bại", {
        variant: "error",
      });
      console.error("Cập nhật avatar người dùng thất bại:", error);
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const handleSaveUser = async () => {
    if (!tokens?.accessToken) return;

    // Validate form before submitting
    if (!validateForm()) {
      enqueueSnackbar("Vui lòng kiểm tra lại thông tin", {
        variant: "warning",
      });
      return;
    }

    try {
      if (editingUser) {
        // Update existing user info
        await adminUserService.updateUser(tokens.accessToken, editingUser.id, {
          fullName: formData.name,
          email: formData.email,
          avatarUrl: editingUser.avatar,
        });

        // Update user role if changed or set
        if (formData.role) {
          const updatedUser = await adminUserService.assignRoles(
            tokens.accessToken,
            editingUser.id,
            [formData.role],
          );

          // Update the user in the local state immediately
          const normalizedRoles =
            updatedUser.roles?.map((role) => role.toUpperCase()) ?? [];
          const role: User["role"] = normalizedRoles.includes("ADMIN")
            ? "ADMIN"
            : normalizedRoles.includes("INSTRUCTOR")
              ? "INSTRUCTOR"
              : "STUDENT";

          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === editingUser.id
                ? {
                    ...user,
                    name: formData.name,
                    email: formData.email,
                    role,
                  }
                : user,
            ),
          );
        }

        // Update instructor info if role is INSTRUCTOR
        if (formData.role === "INSTRUCTOR") {
          await instructorService.updateInstructorByUserId(
            tokens.accessToken,
            editingUser.id,
            {
              headline: formData.instructorHeadline || undefined,
              biography: formData.instructorBiography || undefined,
              website: formData.instructorWebsite || undefined,
              linkedin: formData.instructorLinkedin || undefined,
              twitter: formData.instructorTwitter || undefined,
              youtube: formData.instructorYoutube || undefined,
            },
          );

          // Update instructor info in local state
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === editingUser.id
                ? {
                    ...user,
                    instructor: {
                      ...user.instructor,
                      headline: formData.instructorHeadline,
                      biography: formData.instructorBiography,
                      website: formData.instructorWebsite,
                      linkedin: formData.instructorLinkedin,
                      twitter: formData.instructorTwitter,
                      youtube: formData.instructorYoutube,
                    },
                  }
                : user,
            ),
          );
        }

        enqueueSnackbar("Cập nhật người dùng thành công", {
          variant: "success",
        });
      } else {
        // Create new user
        const payload: any = {
          fullName: formData.name,
          email: formData.email,
        };

        // Only include password if user provided one
        if (formData.password) {
          payload.passwordHash = formData.password;
        }

        const newUser = await adminUserService.createUser(
          tokens.accessToken,
          payload,
        );

        // Assign role for new user
        if (formData.role && newUser.userId) {
          await adminUserService.assignRoles(
            tokens.accessToken,
            newUser.userId,
            [formData.role],
          );
        }

        enqueueSnackbar("Tạo người dùng thành công", { variant: "success" });
        // Refresh the user list for new users
        setRefreshKey((prev) => prev + 1);
      }
      handleCloseDialog();
    } catch (error: any) {
      enqueueSnackbar(
        error.message ||
          (editingUser
            ? "Cập nhật người dùng thất bại"
            : "Tạo người dùng thất bại"),
        { variant: "error" },
      );
      console.error("Save user error:", error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!tokens?.accessToken) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      await adminUserService.deleteUser(tokens.accessToken, id);
      enqueueSnackbar("Xóa người dùng thành công", { variant: "success" });
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      enqueueSnackbar(error.message || "Xóa người dùng thất bại", {
        variant: "error",
      });
      console.error("Delete user error:", error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    if (!tokens?.accessToken) return;

    try {
      await adminUserService.toggleUserStatus(tokens.accessToken, id);
      enqueueSnackbar("Thay đổi trạng thái người dùng thành công", {
        variant: "success",
      });
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      enqueueSnackbar(
        error.message || "Thay đổi trạng thái người dùng thất bại",
        { variant: "error" },
      );
      console.error("Toggle user status error:", error);
    }
  };

  const baseFilteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = baseFilteredUsers.filter((user) => {
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesRole;
  });

  const instructorUsers = baseFilteredUsers.filter(
    (user) => user.role === "INSTRUCTOR",
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <AdminPanelSettings fontSize="small" color="error" />;
      case "INSTRUCTOR":
        return <School fontSize="small" color="primary" />;
      default:
        return <Person fontSize="small" color="action" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "INSTRUCTOR":
        return "Giảng viên";
      default:
        return "Học viên";
    }
  };

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{
              background: "linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Quản lý người dùng
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và theo dõi tất cả người dùng trong hệ thống
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={
              isExporting ? <CircularProgress size={20} /> : <CloudUpload />
            }
            disabled={isExporting}
            onClick={handleExportExcel}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderColor: "#10b981",
              color: "#10b981",
              "&:hover": {
                borderColor: "#059669",
                bgcolor: alpha("#10b981", 0.04),
              },
            }}
          >
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button
            component="label"
            variant="outlined"
            startIcon={
              isImporting ? <CircularProgress size={20} /> : <CloudUpload />
            }
            disabled={isImporting}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderColor: "#2563eb",
              color: "#2563eb",
              "&:hover": {
                borderColor: "#1d4ed8",
                bgcolor: alpha("#2563eb", 0.04),
              },
            }}
          >
            {isImporting ? "Đang import..." : "Import Excel"}
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.3)",
              background: "linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)",
              "&:hover": {
                boxShadow: "0 6px 20px 0 rgba(37, 99, 235, 0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Thêm người dùng
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            label: "Tổng người dùng",
            value: users.length,
            color: "#2563eb",
            icon: <Person />,
          },
          {
            label: "Đang hoạt động",
            value: users.filter((u) => u.status === "ACTIVE").length,
            color: "#10b981",
            icon: <CheckCircle />,
          },
          {
            label: "Đã khóa",
            value: users.filter((u) => u.status === "BLOCKED").length,
            color: "#ef4444",
            icon: <Block />,
          },
        ].map((stat, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                border: "1px solid",
                borderColor: "grey.100",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      display: "flex",
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" fontWeight="700">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Card với Tabs */}
      <Card
        sx={{
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid",
          borderColor: "grey.100",
          overflow: "visible",
        }}
      >
        {/* Tabs header */}
        <Box
          px={3}
          pt={2}
          pb={1}
          borderBottom="1px solid"
          borderColor="grey.100"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Tabs
              value={activeTab}
              onChange={(_, value) =>
                setActiveTab(value as "USERS" | "INSTRUCTORS")
              }
              sx={{ minHeight: 0 }}
            >
              <Tab
                value="USERS"
                sx={{ textTransform: "none", minHeight: 0 }}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person fontSize="small" />
                    <span>Người dùng</span>
                    <Chip
                      label={users.length}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                }
              />
              <Tab
                value="INSTRUCTORS"
                sx={{ textTransform: "none", minHeight: 0 }}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <School fontSize="small" />
                    <span>Giảng viên</span>
                    <Chip
                      label={instructorUsers.length}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                }
              />
            </Tabs>
          </Box>
        </Box>

        {/* Filters Toolbar */}
        <Box p={3} borderBottom="1px solid" borderColor="grey.100">
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    bgcolor: "grey.50",
                    "& fieldset": { border: "none" },
                    "&:hover": { bgcolor: "grey.100" },
                    "&.Mui-focused": {
                      bgcolor: "white",
                      boxShadow:
                        "0 0 0 2px " + alpha(theme.palette.primary.main, 0.2),
                    },
                  },
                }}
              />
            </Grid>
            {activeTab === "USERS" && (
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: "12px",
                      bgcolor: "grey.50",
                      "& fieldset": { border: "none" },
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterList fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="ALL">Tất cả vai trò</MenuItem>
                    <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                    <MenuItem value="INSTRUCTOR">Giảng viên</MenuItem>
                    <MenuItem value="STUDENT">Học viên</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: "12px",
                    bgcolor: "grey.50",
                    "& fieldset": { border: "none" },
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                  <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                  <MenuItem value="BLOCKED">Đã khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Table phần thân – render theo tab */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell
                  sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                >
                  Người dùng
                </TableCell>
                {activeTab === "USERS" && (
                  <TableCell
                    sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                  >
                    Vai trò
                  </TableCell>
                )}
                <TableCell
                  sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                >
                  Ngày tham gia
                </TableCell>
                {activeTab === "INSTRUCTORS" && (
                  <TableCell
                    sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                  >
                    Thông tin giảng viên
                  </TableCell>
                )}
                <TableCell
                  align="right"
                  sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(activeTab === "USERS" ? filteredUsers : instructorUsers).map(
                (user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      transition: "all 0.2s",
                      "&:hover": { bgcolor: "primary.50" },
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={user.avatar}
                          alt={user.name}
                          sx={{
                            width: 46,
                            height: 46,
                            border: "2px solid white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            color="text.primary"
                          >
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    {activeTab === "USERS" && (
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "8px",
                            bgcolor:
                              user.role === "ADMIN"
                                ? alpha(theme.palette.error.main, 0.1)
                                : user.role === "INSTRUCTOR"
                                  ? alpha(theme.palette.primary.main, 0.1)
                                  : alpha(theme.palette.grey[500], 0.1),
                            color:
                              user.role === "ADMIN"
                                ? "error.main"
                                : user.role === "INSTRUCTOR"
                                  ? "primary.main"
                                  : "text.secondary",
                          }}
                        >
                          {getRoleIcon(user.role)}
                          <Typography variant="caption" fontWeight="600">
                            {getRoleLabel(user.role)}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "20px",
                          bgcolor:
                            user.status === "ACTIVE"
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.error.main, 0.1),
                          color:
                            user.status === "ACTIVE"
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "currentColor",
                          }}
                        />
                        <Typography variant="caption" fontWeight="600">
                          {user.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </Typography>
                    </TableCell>
                    {activeTab === "INSTRUCTORS" && (
                      <TableCell>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          {user.instructor?.headline && (
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="text.primary"
                            >
                              {user.instructor.headline}
                            </Typography>
                          )}
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {typeof user.instructor?.totalCourses ===
                              "number" && (
                              <Chip
                                size="small"
                                label={`${user.instructor.totalCourses} khóa học`}
                                color="primary"
                                variant="outlined"
                              />
                            )}
                            {typeof user.instructor?.totalStudents ===
                              "number" && (
                              <Chip
                                size="small"
                                label={`${user.instructor.totalStudents} học viên`}
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          <Box display="flex" gap={0.5} mt={0.5}>
                            {user.instructor?.website && (
                              <Tooltip title="Website cá nhân">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={user.instructor.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Language fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {user.instructor?.linkedin && (
                              <Tooltip title="LinkedIn">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={user.instructor.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <LinkedIn fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {user.instructor?.twitter && (
                              <Tooltip title="Twitter / X">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={user.instructor.twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Twitter fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {user.instructor?.youtube && (
                              <Tooltip title="YouTube">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={user.instructor.youtube}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <YouTube fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={1}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(user)}
                            sx={{
                              color: "primary.main",
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={user.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(user.id)}
                            sx={{
                              color:
                                user.status === "ACTIVE"
                                  ? "warning.main"
                                  : "success.main",
                              bgcolor:
                                user.status === "ACTIVE"
                                  ? alpha(theme.palette.warning.main, 0.1)
                                  : alpha(theme.palette.success.main, 0.1),
                              "&:hover": {
                                bgcolor:
                                  user.status === "ACTIVE"
                                    ? alpha(theme.palette.warning.main, 0.2)
                                    : alpha(theme.palette.success.main, 0.2),
                              },
                            }}
                          >
                            {user.status === "ACTIVE" ? (
                              <Block fontSize="small" />
                            ) : (
                              <CheckCircle fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{
                              color: "error.main",
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(theme.palette.error.main, 0.2),
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          p={3}
          borderTop="1px solid"
          borderColor="grey.100"
          display="flex"
          justifyContent="center"
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            size="large"
          />
        </Box>
      </Card>

      {/* Modern Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            pt: 3,
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              bgcolor: "primary.50",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {editingUser ? <Edit /> : <Add />}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="700">
              {editingUser ? "Cập nhật thông tin" : "Thêm người dùng mới"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingUser
                ? "Chỉnh sửa thông tin chi tiết của người dùng"
                : "Điền thông tin để tạo tài khoản mới"}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            {/* Avatar Upload */}
            <Box display="flex" justifyContent="center">
              <Box position="relative">
                <Avatar
                  src={editingUser?.avatar}
                  sx={{
                    width: 100,
                    height: 100,
                    border: "4px solid white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                  size="small"
                  onClick={handleClickAvatarUpload}
                >
                  {avatarUploading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <CloudUpload fontSize="small" />
                  )}
                </IconButton>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarFileChange}
                />
              </Box>
            </Box>

            <TextField
              label="Họ và tên"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setFormErrors({
                  ...formErrors,
                  name: validateName(e.target.value),
                });
              }}
              error={!!formErrors.name}
              helperText={formErrors.name}
              InputProps={{
                sx: { borderRadius: "12px" },
              }}
            />
            <TextField
              label="Email"
              fullWidth
              required
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setFormErrors({
                  ...formErrors,
                  email: validateEmail(e.target.value),
                });
              }}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                sx: { borderRadius: "12px" },
              }}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    value={formData.role}
                    label="Vai trò"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as User["role"],
                      })
                    }
                    sx={{ borderRadius: "12px" }}
                  >
                    <MenuItem value="ADMIN">Quản trị viên</MenuItem>
                    <MenuItem value="INSTRUCTOR">Giảng viên</MenuItem>
                    <MenuItem value="STUDENT">Học viên</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={formData.status}
                    label="Trạng thái"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as User["status"],
                      })
                    }
                    sx={{ borderRadius: "12px" }}
                  >
                    <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                    <MenuItem value="BLOCKED">Đã khóa</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {formData.role === "INSTRUCTOR" && (
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Thông tin giảng viên
                </Typography>
                <TextField
                  label="Tiêu đề (headline)"
                  fullWidth
                  value={formData.instructorHeadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instructorHeadline: e.target.value,
                    })
                  }
                  InputProps={{
                    sx: { borderRadius: "12px" },
                  }}
                />
                <TextField
                  label="Giới thiệu (biography)"
                  fullWidth
                  multiline
                  minRows={3}
                  value={formData.instructorBiography}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instructorBiography: e.target.value,
                    })
                  }
                  InputProps={{
                    sx: { borderRadius: "12px" },
                  }}
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Website"
                      fullWidth
                      placeholder="https://example.com"
                      value={formData.instructorWebsite}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          instructorWebsite: e.target.value,
                        });
                        setFormErrors({
                          ...formErrors,
                          instructorWebsite: validateUrl(e.target.value),
                        });
                      }}
                      error={!!formErrors.instructorWebsite}
                      helperText={formErrors.instructorWebsite}
                      InputProps={{
                        sx: { borderRadius: "12px" },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="LinkedIn"
                      fullWidth
                      placeholder="https://linkedin.com/in/..."
                      value={formData.instructorLinkedin}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          instructorLinkedin: e.target.value,
                        });
                        setFormErrors({
                          ...formErrors,
                          instructorLinkedin: validateUrl(e.target.value),
                        });
                      }}
                      error={!!formErrors.instructorLinkedin}
                      helperText={formErrors.instructorLinkedin}
                      InputProps={{
                        sx: { borderRadius: "12px" },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Twitter"
                      fullWidth
                      placeholder="https://twitter.com/..."
                      value={formData.instructorTwitter}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          instructorTwitter: e.target.value,
                        });
                        setFormErrors({
                          ...formErrors,
                          instructorTwitter: validateUrl(e.target.value),
                        });
                      }}
                      error={!!formErrors.instructorTwitter}
                      helperText={formErrors.instructorTwitter}
                      InputProps={{
                        sx: { borderRadius: "12px" },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="YouTube"
                      fullWidth
                      placeholder="https://youtube.com/..."
                      value={formData.instructorYoutube}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          instructorYoutube: e.target.value,
                        });
                        setFormErrors({
                          ...formErrors,
                          instructorYoutube: validateUrl(e.target.value),
                        });
                      }}
                      error={!!formErrors.instructorYoutube}
                      helperText={formErrors.instructorYoutube}
                      InputProps={{
                        sx: { borderRadius: "12px" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Activation Email Notice - only for creating new user */}
            {!editingUser && (
              <Alert severity="info" sx={{ borderRadius: "12px", mt: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  📧 Kích hoạt tài khoản qua email
                </Typography>
                <Typography variant="body2">
                  Người dùng sẽ nhận email kích hoạt tài khoản với link để tự
                  đặt mật khẩu. Link có hiệu lực trong 24 giờ.
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            variant="text"
            color="inherit"
            sx={{ borderRadius: "10px", px: 3 }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            sx={{
              borderRadius: "10px",
              px: 4,
              py: 1,
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            }}
          >
            {editingUser ? "Lưu thay đổi" : "Tạo người dùng"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
