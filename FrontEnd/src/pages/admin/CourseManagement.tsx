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
  CloudUpload,
  Download,
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useToast } from "../../hooks/useToast";
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
import { CourseFormDialog } from "../../components/shared/CourseFormDialog";

const CourseManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { tokens } = useAuthStore();
  const { enqueueSnackbar } = useToast();
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
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(
    null,
  );
  const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [courseToUpdateStatus, setCourseToUpdateStatus] =
    useState<CourseResponse | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false); // Imported
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 10;

  // Flatten categories for dropdown
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
        course.courseId,
      );
      setEditingCourse(fullCourse);
      setEditingCourse(fullCourse);
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
    setEditingCourse(null);
    setCreateDialogOpen(true);
  };

  const handleSaveCourse = async (data: any) => {
    if (!tokens?.accessToken) return;

    try {
      const courseData = {
        title: data.title.trim(),
        categoryId: Number(data.categoryId),
        shortDescription: data.shortDescription || undefined,
        description: data.description || undefined,
        whatYouLearn: data.whatYouLearn || undefined,
        requirements: data.requirements || undefined,
        targetAudience: data.targetAudience || undefined,
        thumbnailUrl: data.thumbnailUrl || undefined,
        previewVideoUrl: data.previewVideoUrl || undefined,
        price: data.price ? Number(data.price) : undefined,
        level: data.level || undefined,
        language: data.language || undefined,
        hasCertificate: data.hasCertificate,
      };

      if (editingCourse) {
        // Update course
        await adminCourseService.updateCourse(
          tokens.accessToken,
          editingCourse.courseId,
          courseData,
        );

        // Update status if changed (only if status exists in form data)
        if (data.status && data.status !== editingCourse.status) {
          await adminCourseService.updateCourseStatus(
            tokens.accessToken,
            editingCourse.courseId,
            data.status,
          );
        }

        enqueueSnackbar("Cập nhật khóa học thành công", { variant: "success" });
      } else {
        // Create
        await adminCourseService.createCourse(tokens.accessToken, {
          ...courseData,
          instructorId: Number(data.instructorId),
        });
        enqueueSnackbar("Tạo khóa học thành công", { variant: "success" });
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
        },
      );
      setCourses(pageResult.data || []);
    } catch (error: any) {
      console.error("Save course failed", error);
      throw error; // Re-throw to let CourseFormDialog handle the UI feedback
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

  const handleStatusClick = (course: CourseResponse) => {
    setCourseToUpdateStatus(course);
    setNewStatus(course.status);
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!courseToUpdateStatus || !tokens?.accessToken) return;

    try {
      await adminCourseService.updateCourseStatus(
        tokens.accessToken,
        courseToUpdateStatus.courseId,
        newStatus as any,
      );

      enqueueSnackbar("Cập nhật trạng thái thành công", { variant: "success" });
      setStatusDialogOpen(false);

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
        },
      );
      setCourses(pageResult.data || []);
    } catch (error) {
      enqueueSnackbar("Cập nhật trạng thái thất bại", { variant: "error" });
      console.error("Update status failed", error);
    }
  };

  const handleImportExcel = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !tokens?.accessToken) return;

    event.target.value = "";
    setIsImporting(true);
    try {
      await adminCourseService.importCourses(tokens.accessToken, file);
      enqueueSnackbar("Import dữ liệu thành công!", { variant: "success" });
      if (page === 1) {
        const pageResult = await adminCourseService.getCourses(
          tokens.accessToken,
          {
            page: 0,
            size: itemsPerPage,
            search: searchTerm || undefined,
            status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
          },
        );
        setCourses(pageResult.data || []);
        setTotalPages(pageResult.pagination?.totalPages ?? 1);
        setTotalElements(pageResult.pagination?.totalElements ?? 0);
      } else {
        setPage(1);
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || "Import thất bại", { variant: "error" });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!tokens?.accessToken) return;
    setIsExporting(true);
    try {
      const blob = await adminCourseService.exportCourses(tokens.accessToken);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `courses_admin_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      enqueueSnackbar("Export danh sách khóa học thành công", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Không thể export khóa học", { variant: "error" });
    } finally {
      setIsExporting(false);
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
            Quản lý khóa học
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và theo dõi tất cả khóa học trong hệ thống
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <input
            type="file"
            accept=".xlsx, .xls"
            id="import-excel-input"
            style={{ display: "none" }}
            onChange={handleImportExcel}
            disabled={isImporting}
          />
          <Button
            variant="outlined"
            startIcon={
              isImporting ? <CircularProgress size={20} /> : <CloudUpload />
            }
            component="label"
            htmlFor="import-excel-input"
            disabled={isImporting}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 2,
              bgcolor: "white",
              borderColor: "grey.300",
              color: "text.primary",
              "&:hover": {
                bgcolor: "grey.50",
                borderColor: "grey.400",
              },
            }}
          >
            {isImporting ? "Đang tải..." : "Import Excel"}
          </Button>
          <Button
            variant="outlined"
            startIcon={
              isExporting ? <CircularProgress size={20} /> : <Download />
            }
            onClick={handleExportExcel}
            disabled={isExporting}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 2,
              bgcolor: "white",
              borderColor: "grey.300",
              color: "text.primary",
              "&:hover": {
                bgcolor: "grey.50",
                borderColor: "grey.400",
              },
            }}
          >
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
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
          {/* Search and Filter Bar */}
          <Box mb={3} borderBottom="1px solid" borderColor="grey.100" pb={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm khóa học..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
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
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
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
                    <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                    <MenuItem value="PUBLISHED">Đã xuất bản</MenuItem>
                    <MenuItem value="DRAFT">Bản nháp</MenuItem>
                    <MenuItem value="ACHIEVED">Đã lưu trữ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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
                            onClick={() => navigate(`/course/${course.slug}`)}
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
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
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
                          {course.instructorName ||
                            `ID: ${course.instructorId}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(course.status)}
                          color={getStatusColor(course.status) as any}
                          size="small"
                          sx={{ fontWeight: 600, cursor: "pointer" }}
                          onClick={() => handleStatusClick(course)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatPrice(course.price)}
                        </Typography>
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
                              : "0"}
                          </Typography>

                          {course.totalReviews !== undefined &&
                            course.totalReviews > 0 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
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
                              navigate(
                                `/admin/courses/${course.courseId}/content`,
                              )
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
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={2}
              mt={3}
            >
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
            Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cập nhật trạng thái khóa học</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Khóa học: <strong>{courseToUpdateStatus?.title}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={newStatus}
              label="Trạng thái"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="DRAFT">Bản nháp</MenuItem>
              <MenuItem value="PENDING">Chờ duyệt</MenuItem>
              <MenuItem value="PUBLISHED">Đã xuất bản</MenuItem>
              <MenuItem value="REJECTED">Bị từ chối</MenuItem>
              <MenuItem value="ARCHIVED">Lưu trữ</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            color="primary"
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Course Dialog */}
      <CourseFormDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingCourse(null);
        }}
        editingCourse={editingCourse}
        mode="ADMIN"
        flatCategories={flatCategories}
        onSubmit={handleSaveCourse}
      />
    </Box>
  );
};

export default CourseManagement;
