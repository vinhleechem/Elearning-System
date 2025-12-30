import { useEffect, useState } from "react";
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
  Box,
  Typography,
  InputAdornment,
  Pagination,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  School,
  Visibility,
  FilterList,
  Add,
  FolderOpen,
  VideoLibrary,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useAuthStore } from "../../store/authStore";
import {
  adminCourseService,
  type CourseResponse,
} from "../../service/adminCourseService";
import {
  categoryService,
  type CategoryTreeResponse,
} from "../../service/categoryService";
import { useNavigate } from "react-router-dom";

const CourseManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { tokens } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    instructorId: "",
    shortDescription: "",
    price: "",
    discountPrice: "",
    level: "",
    language: "",
  });
  const itemsPerPage = 10;

  // Flatten categories for dropdown
  const flattenCategories = (
    cats: CategoryTreeResponse[],
    result: { id: number; name: string; level: number; path: string }[] = [],
    parentPath = ""
  ): { id: number; name: string; level: number; path: string }[] => {
    cats.forEach((cat) => {
      const path = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
      result.push({ id: cat.id, name: cat.name, level: cat.level, path });
      if (cat.children && cat.children.length > 0) {
        flattenCategories(cat.children, result, path);
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  // Helper function để tìm category info từ categoryId
  const getCategoryInfo = (categoryId: number) => {
    const cat = flatCategories.find((c) => c.id === categoryId);
    return cat || null;
  };

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getCategoryTree();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!tokens?.accessToken) return;
      setLoading(true);
      try {
        const pageResult = await adminCourseService.getCourses(
          tokens.accessToken,
          {
            page: page - 1,
            size: itemsPerPage,
            search: searchTerm || undefined,
            status:
              statusFilter !== "ALL"
                ? (statusFilter as "DRAFT" | "PUBLISHED" | "ACHIEVED")
                : undefined,
          },
        );

        setCourses(pageResult.data || []);
        const totalPagesValue = pageResult.pagination?.totalPages ?? 1;
        const totalElementsValue = pageResult.pagination?.totalElements ?? 0;
        setTotalPages(totalPagesValue);
        setTotalElements(totalElementsValue);
      } catch (error) {
        enqueueSnackbar("Không thể tải danh sách khóa học", {
          variant: "error",
        });
        console.error("Không thể tải danh sách khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchCourses();
  }, [tokens?.accessToken, page, searchTerm, statusFilter]);

  const handleDeleteClick = (courseId: number) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tokens?.accessToken || !courseToDelete) return;

    try {
      await adminCourseService.deleteCourse(tokens.accessToken, courseToDelete);
      setCourses(courses.filter((c) => c.courseId !== courseToDelete));
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      enqueueSnackbar("Xóa khóa học thành công", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Xóa khóa học thất bại. Vui lòng thử lại.", {
        variant: "error",
      });
      console.error("Xóa khóa học thất bại:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const handleEditClick = async (course: CourseResponse) => {
    if (!tokens?.accessToken) return;
    try {
      // Load full course data
      const fullCourse = await adminCourseService.getCourseById(
        tokens.accessToken,
        course.courseId
      );
      setEditingCourse(fullCourse);
      setFormData({
        title: fullCourse.title || "",
        categoryId: fullCourse.categoryId.toString(),
        instructorId: fullCourse.instructorId.toString(),
        shortDescription: fullCourse.shortDescription || "",
        price: fullCourse.price?.toString() || "",
        discountPrice: fullCourse.discountPrice?.toString() || "",
        level: fullCourse.level || "",
        language: fullCourse.language || "",
      });
      setCreateDialogOpen(true);
    } catch (error) {
      enqueueSnackbar("Không thể tải thông tin khóa học", {
        variant: "error",
      });
      console.error("Failed to load course", error);
    }
  };

  const handleCreateClick = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      categoryId: "",
      instructorId: "",
      shortDescription: "",
      price: "",
      discountPrice: "",
      level: "",
      language: "",
    });
    setCreateDialogOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!tokens?.accessToken) return;
    if (!formData.title.trim()) {
      enqueueSnackbar("Tiêu đề khóa học không được để trống", {
        variant: "warning",
      });
      return;
    }
    if (!formData.categoryId) {
      enqueueSnackbar("Vui lòng chọn danh mục", {
        variant: "warning",
      });
      return;
    }

    try {
      const courseData = {
        title: formData.title.trim(),
        categoryId: Number(formData.categoryId),
        shortDescription: formData.shortDescription || undefined,
        price: formData.price ? Number(formData.price) : undefined,
        discountPrice: formData.discountPrice
          ? Number(formData.discountPrice)
          : undefined,
        level: formData.level || undefined,
        language: formData.language || undefined,
      };

      if (editingCourse) {
        // Update
        await adminCourseService.updateCourse(
          tokens.accessToken,
          editingCourse.courseId,
          courseData
        );
        enqueueSnackbar("Cập nhật khóa học thành công", {
          variant: "success",
        });
      } else {
        // Create
        if (!formData.instructorId) {
          enqueueSnackbar("Vui lòng chọn giảng viên", {
            variant: "warning",
          });
          return;
        }
        await adminCourseService.createCourse(tokens.accessToken, {
          ...courseData,
          instructorId: Number(formData.instructorId),
        });
        enqueueSnackbar("Tạo khóa học thành công", {
          variant: "success",
        });
      }

      setCreateDialogOpen(false);
      setEditingCourse(null);
      // Reload courses
      const pageResult = await adminCourseService.getCourses(
        tokens.accessToken,
        {
          page: page - 1,
          size: itemsPerPage,
          search: searchTerm || undefined,
          status:
            statusFilter !== "ALL"
              ? (statusFilter as "DRAFT" | "PUBLISHED" | "ACHIEVED")
              : undefined,
        }
      );
      setCourses(pageResult.data || []);
    } catch (error) {
      enqueueSnackbar(
        editingCourse
          ? "Cập nhật khóa học thất bại"
          : "Tạo khóa học thất bại",
        {
          variant: "error",
        }
      );
      console.error("Save course failed", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "success";
      case "DRAFT":
        return "warning";
      case "ACHIEVED":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "Đã xuất bản";
      case "DRAFT":
        return "Bản nháp";
      case "ACHIEVED":
        return "Đã lưu trữ";
      default:
        return status;
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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
            Quản lý khóa học
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và theo dõi tất cả khóa học trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateClick}
          size="large"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
          }}
        >
          Tạo khóa học mới
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            label: "Tổng khóa học",
            value: totalElements,
            color: "#2563eb",
            icon: <School />,
          },
          {
            label: "Đã xuất bản",
            value: courses.filter((c) => c.status === "PUBLISHED").length,
            color: "#10b981",
            icon: <Visibility />,
          },
          {
            label: "Bản nháp",
            value: courses.filter((c) => c.status === "DRAFT").length,
            color: "#f59e0b",
            icon: <Edit />,
          },
        ].map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
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

      {/* Main Content Card */}
      <Card
        sx={{
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid",
          borderColor: "grey.100",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Search and Filter Bar */}
          <Box
            display="flex"
            gap={2}
            mb={3}
            flexWrap="wrap"
            alignItems="center"
          >
            <TextField
              placeholder="Tìm kiếm khóa học..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              sx={{
                flex: 1,
                minWidth: "250px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Box display="flex" gap={1} alignItems="center">
              <FilterList color="action" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PUBLISHED">Đã xuất bản</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="ACHIEVED">Đã lưu trữ</option>
              </select>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Danh mục</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Giảng viên</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Giá</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Học viên</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Đánh giá</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Không có khóa học nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow
                      key={course.courseId}
                      sx={{
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              cursor: "pointer",
                              "&:hover": {
                                color: "primary.main",
                              },
                            }}
                            onClick={() =>
                              navigate(`/course/${course.slug}`)
                            }
                          >
                            {course.title}
                          </Typography>
                          {course.shortDescription && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {course.shortDescription}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const catInfo = getCategoryInfo(course.categoryId);
                          return catInfo ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <FolderOpen
                                sx={{
                                  fontSize: 16,
                                  color:
                                    catInfo.level === 1
                                      ? "primary.main"
                                      : catInfo.level === 2
                                        ? "secondary.main"
                                        : "text.secondary",
                                }}
                              />
                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                  sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {catInfo.path}
                                </Typography>
                                <Chip
                                  label={`Level ${catInfo.level}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 18, fontSize: 9, mt: 0.5 }}
                                />
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              ID: {course.categoryId}
                            </Typography>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {course.instructorName || `ID: ${course.instructorId}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(course.status)}
                          color={getStatusColor(course.status) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatPrice(course.price)}
                        </Typography>
                        {course.discountPrice && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textDecoration: "line-through" }}
                          >
                            {formatPrice(course.discountPrice)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {course.totalStudents || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography variant="body2" fontWeight={600}>
                            {course.averageRating
                              ? course.averageRating.toFixed(1)
                              : "N/A"}
                          </Typography>
                          {course.totalReviews !== undefined &&
                            course.totalReviews > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                ({course.totalReviews})
                              </Typography>
                            )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/course/${course.slug}`)}
                            title="Xem chi tiết"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() =>
                              navigate(`/admin/courses/${course.courseId}/content`)
                            }
                            title="Quản lý nội dung"
                          >
                            <VideoLibrary fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleEditClick(course)}
                            title="Chỉnh sửa"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(course.courseId)}
                            title="Xóa"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 0 && totalElements > 0 && (
            <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={3}>
              <Typography variant="body2" color="text.secondary">
                Hiển thị {courses.length} / {totalElements} khóa học
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa khóa học</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể
            hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Course Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingCourse(null);
          setFormData({
            title: "",
            categoryId: "",
            instructorId: "",
            shortDescription: "",
            price: "",
            discountPrice: "",
            level: "",
            language: "",
          });
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <School />
            <Typography variant="h6">
              {editingCourse ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Tiêu đề khóa học"
              placeholder="VD: Java Spring Boot - Xây dựng RESTful API"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <FormControl fullWidth required>
              <InputLabel>Chọn danh mục</InputLabel>
              <Select
                label="Chọn danh mục"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                renderValue={(value) => {
                  const cat = flatCategories.find((c) => c.id === Number(value));
                  if (!cat) return "";
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FolderOpen
                        sx={{
                          fontSize: 16,
                          color:
                            cat.level === 1
                              ? "primary.main"
                              : cat.level === 2
                                ? "secondary.main"
                                : "text.secondary",
                        }}
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {cat.path}
                      </Typography>
                      <Chip
                        label={`Level ${cat.level}`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    </Box>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {flatCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "100%",
                        pl: (cat.level - 1) * 2,
                      }}
                    >
                      <FolderOpen
                        sx={{
                          fontSize: 16,
                          color:
                            cat.level === 1
                              ? "primary.main"
                              : cat.level === 2
                                ? "secondary.main"
                                : "text.secondary",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: cat.level === 1 ? 600 : 400,
                          flex: 1,
                        }}
                      >
                        {cat.name}
                      </Typography>
                      <Chip
                        label={`L${cat.level}`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 10, minWidth: 35 }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {!editingCourse && (
              <FormControl fullWidth required>
                <InputLabel>Chọn giảng viên</InputLabel>
                <Select
                  label="Chọn giảng viên"
                  value={formData.instructorId}
                  onChange={(e) =>
                    setFormData({ ...formData, instructorId: e.target.value })
                  }
                >
                  <MenuItem value="1">Nguyễn Văn A</MenuItem>
                  <MenuItem value="2">Trần Thị B</MenuItem>
                  <MenuItem value="3">Lê Minh C</MenuItem>
                  <MenuItem value="4">Phạm Thu D</MenuItem>
                  <MenuItem value="5">Hoàng Văn E</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Mô tả ngắn"
              placeholder="Mô tả ngắn gọn về khóa học"
              multiline
              rows={2}
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData({ ...formData, shortDescription: e.target.value })
              }
            />

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Giá (VND)"
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Giá khuyến mãi (VND)"
                type="number"
                placeholder="0"
                value={formData.discountPrice}
                onChange={(e) =>
                  setFormData({ ...formData, discountPrice: e.target.value })
                }
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Cấp độ</InputLabel>
                <Select
                  label="Cấp độ"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Ngôn ngữ"
                placeholder="VD: Tiếng Việt"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setEditingCourse(null);
              setFormData({
                title: "",
                categoryId: "",
                instructorId: "",
                shortDescription: "",
                price: "",
                discountPrice: "",
                level: "",
                language: "",
              });
            }}
          >
            Hủy
          </Button>
          <Button variant="contained" onClick={handleSaveCourse}>
            {editingCourse ? "Cập nhật" : "Tạo khóa học"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseManagement;

