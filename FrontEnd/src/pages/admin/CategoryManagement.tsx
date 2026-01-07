import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
  MenuItem,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Select,
  FormControl,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Category as CategoryIcon,
  FiberManualRecord,
  Search,
  FilterList,
  ExpandMore,
  UnfoldMore,
  CheckCircle,
  Block,
  CloudUpload,
  Download,
} from "@mui/icons-material";
import { useToast } from "../../hooks/useToast";
import { adminCategoryService } from "../../service/adminCategoryService";
import type {
  CategoryRequest,
  CategoryResponse,
} from "../../service/adminCategoryService";
import { useAuthStore } from "../../store/authStore";

// Flatten tree thành list để render trong 1 table duy nhất
interface FlatCategory extends CategoryResponse {
  depth: number; // Độ sâu trong cây (0 = root, 1 = con, 2 = cháu...)
  isExpanded?: boolean; // Trạng thái mở/đóng
  hasChildren: boolean;
}

const CategoryManagement = () => {
  const theme = useTheme();
  const { tokens } = useAuthStore();
  const { enqueueSnackbar } = useToast();
  const [rawCategories, setRawCategories] = useState<CategoryResponse[]>([]);
  const [flatList, setFlatList] = useState<FlatCategory[]>([]);
  const [filteredList, setFilteredList] = useState<FlatCategory[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<number | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // State for Form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoryRequest>({
    name: "",
    slug: "",
    parentId: null,
  });
  const [isActive, setIsActive] = useState(true);

  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Flatten tree thành list phẳng (chỉ hiển thị nodes được expand)
  const flattenTree = (
    nodes: CategoryResponse[],
    depth = 0,
    result: FlatCategory[] = [],
    forceExpand = false // Nếu true, sẽ flatten toàn bộ tree
  ): FlatCategory[] => {
    nodes.forEach((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = forceExpand || expandedIds.has(node.id);

      result.push({
        ...node,
        depth,
        hasChildren,
        isExpanded,
      });

      // Nếu forceExpand = true hoặc node đang được expand → thêm children
      if ((forceExpand || isExpanded) && hasChildren) {
        flattenTree(node.children, depth + 1, result, forceExpand);
      }
    });
    return result;
  };

  // Flatten toàn bộ tree (dùng cho dropdown chọn parent)
  const flattenAllForDropdown = (
    cats: CategoryResponse[],
    result: { id: number; name: string; depth: number }[] = [],
    depth = 0
  ) => {
    cats.forEach((cat) => {
      result.push({ id: cat.id, name: cat.name, depth });
      if (cat.children) {
        flattenAllForDropdown(cat.children, result, depth + 1);
      }
    });
    return result;
  };

  const allCategoriesForDropdown = flattenAllForDropdown(rawCategories);

  const fetchCategories = async () => {
    if (!tokens?.accessToken) return;
    setLoading(true);
    try {
      const data = await adminCategoryService.getCategoryTree(
        tokens.accessToken
      );
      setRawCategories(data);
      // Mặc định expand tất cả level 0
      const rootIds = data.map((c) => c.id);
      setExpandedIds(new Set(rootIds));
    } catch (error) {
      enqueueSnackbar("Không thể tải danh sách danh mục", {
        variant: "error",
      });
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, [tokens?.accessToken]);

  useEffect(() => {
    // Kiểm tra xem có filter active không
    const hasActiveFilter =
      searchTerm.trim() !== "" ||
      filterLevel !== "ALL" ||
      filterStatus !== "ALL";

    // Nếu có filter → flatten toàn bộ tree (forceExpand = true)
    // Nếu không có filter → chỉ flatten nodes được expand
    const flat = flattenTree(rawCategories, 0, [], hasActiveFilter);
    setFlatList(flat);
  }, [rawCategories, expandedIds, searchTerm, filterLevel, filterStatus]);

  // Filter & Search effect
  useEffect(() => {
    let filtered = flatList;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchLower) ||
          cat.slug.toLowerCase().includes(searchLower)
      );
    }

    // Filter by level - hiển thị từ level 1 đến level được chọn
    if (filterLevel !== "ALL") {
      // Level 2 → hiển thị Level 1 + 2
      // Level 3 → hiển thị Level 1 + 2 + 3
      filtered = filtered.filter((cat) => cat.level <= filterLevel);
    }

    // Filter by status
    if (filterStatus === "ACTIVE") {
      filtered = filtered.filter((cat) => cat.isActive);
    } else if (filterStatus === "INACTIVE") {
      filtered = filtered.filter((cat) => !cat.isActive);
    }

    setFilteredList(filtered);
  }, [flatList, searchTerm, filterLevel, filterStatus]);

  // Tự động expand parent nodes khi filter level
  useEffect(() => {
    if (filterLevel !== "ALL" && filterLevel > 1) {
      // Cần expand các nodes từ level 1 đến (filterLevel - 1)
      const nodesToExpand = new Set<number>();

      const collectParentIds = (nodes: CategoryResponse[], targetLevel: number) => {
        nodes.forEach((node) => {
          if (node.level < targetLevel && node.children && node.children.length > 0) {
            nodesToExpand.add(node.id);
            collectParentIds(node.children, targetLevel);
          }
        });
      };

      collectParentIds(rawCategories, filterLevel);
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        nodesToExpand.forEach((id) => newSet.add(id));
        return newSet;
      });
    }
  }, [filterLevel, rawCategories]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (cats: CategoryResponse[]) => {
      cats.forEach((cat) => {
        if (cat.children && cat.children.length > 0) {
          allIds.add(cat.id);
          collectIds(cat.children);
        }
      });
    };
    collectIds(rawCategories);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleOpenAdd = (parentId: number | null = null) => {
    setEditingId(null);
    setFormData({ name: "", slug: "", parentId });
    setIsActive(true);
    setOpenDialog(true);
  };

  const handleOpenEdit = (category: FlatCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
    });
    setIsActive(category.isActive);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!tokens?.accessToken) return;
    if (!formData.name.trim()) {
      enqueueSnackbar("Tên danh mục không được để trống", {
        variant: "warning",
      });
      return;
    }

    try {
      // Auto generate slug if empty
      const submitData = {
        ...formData,
        slug:
          formData.slug ||
          formData.name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, ""),
      };

      if (editingId) {
        await adminCategoryService.updateCategory(
          tokens.accessToken,
          editingId,
          submitData
        );
        enqueueSnackbar("Cập nhật danh mục thành công", {
          variant: "success",
        });
      } else {
        await adminCategoryService.createCategory(
          tokens.accessToken,
          submitData
        );
        enqueueSnackbar("Thêm danh mục thành công", {
          variant: "success",
        });
      }
      setOpenDialog(false);
      fetchCategories();
    } catch (error) {
      enqueueSnackbar(
        editingId
          ? "Không thể cập nhật danh mục"
          : "Không thể thêm danh mục",
        {
          variant: "error",
        }
      );
      console.error("Save failed", error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tokens?.accessToken || !itemToDelete) return;
    try {
      await adminCategoryService.deleteCategory(
        tokens.accessToken,
        itemToDelete
      );
      enqueueSnackbar("Xóa danh mục thành công", {
        variant: "success",
      });
      setDeleteDialogOpen(false);
      fetchCategories();
    } catch (error) {
      enqueueSnackbar(
        "Không thể xóa danh mục (có thể còn danh mục con hoặc khóa học)",
        {
          variant: "error",
        }
      );
      console.error("Delete failed", error);
    }
  };

  const handleImportExcel = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !tokens?.accessToken) return;

    event.target.value = "";
    setIsImporting(true);
    try {
      await adminCategoryService.importCategories(tokens.accessToken, file);
      enqueueSnackbar("Import dữ liệu thành công!", { variant: "success" });
      fetchCategories();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Import thất bại", { variant: "error" });
      console.error("Import failed", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!tokens?.accessToken) return;
    try {
      await adminCategoryService.downloadTemplate(tokens.accessToken);
      enqueueSnackbar("Đã tải xuống template", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Không thể tải template", { variant: "error" });
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
            Quản lý Danh mục
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý cấu trúc danh mục khóa học theo dạng cây phân cấp
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <input
            type="file"
            accept=".xlsx, .xls"
            id="import-excel-input"
            style={{ display: "none" }}
            onChange={handleImportExcel}
            disabled={isImporting}
          />
          <Button
            variant="text"
            startIcon={<Download />}
            onClick={handleDownloadTemplate}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
              py: 1.5,
              color: "text.secondary",
              mr: 1,
              "&:hover": {
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Template
          </Button>
          <Button
            variant="outlined"
            startIcon={
              isImporting ? <CircularProgress size={20} /> : <CloudUpload />
            }
            component="label"
            htmlFor="import-excel-input"
            disabled={isImporting}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderColor: "grey.300",
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            Import Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenAdd(null)}
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
            Thêm danh mục gốc
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            label: "Tổng danh mục",
            value: flatList.length,
            color: "#2563eb",
            icon: <CategoryIcon />,
          },
          {
            label: "Đang hoạt động",
            value: flatList.filter((c) => c.isActive).length,
            color: "#10b981",
            icon: <CheckCircle />,
          },
          {
            label: "Vô hiệu hóa",
            value: flatList.filter((c) => !c.isActive).length,
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

      {/* Main Content Card */}
      <Card
        sx={{
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid",
          borderColor: "grey.100",
          overflow: "visible",
        }}
      >
        {/* Filter Toolbar */}
        <Box p={3} borderBottom="1px solid" borderColor="grey.100">
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm danh mục..."
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
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <Select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as number | "ALL")}
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
                  <MenuItem value="ALL">Tất cả cấp độ</MenuItem>
                  <MenuItem value={1}>Level 1</MenuItem>
                  <MenuItem value={2}>Level 2</MenuItem>
                  <MenuItem value={3}>Level 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
                  displayEmpty
                  sx={{
                    borderRadius: "12px",
                    bgcolor: "grey.50",
                    "& fieldset": { border: "none" },
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <CheckCircle fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
                  <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Vô hiệu hóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Mở tất cả">
                  <Button
                    variant="outlined"
                    onClick={expandAll}
                    sx={{ borderRadius: "10px", minWidth: 48, p: 1, borderColor: "grey.300", color: "text.secondary" }}
                  >
                    <UnfoldMore />
                  </Button>
                </Tooltip>
                <Tooltip title="Đóng tất cả">
                  <Button
                    variant="outlined"
                    onClick={collapseAll}
                    sx={{ borderRadius: "10px", minWidth: 48, p: 1, borderColor: "grey.300", color: "text.secondary" }}
                  >
                    <ExpandMore />
                  </Button>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell
                  width="45%"
                  sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                >
                  Tên danh mục
                </TableCell>
                <TableCell
                  width="25%"
                  sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                >
                  Slug
                </TableCell>
                <TableCell
                  width="10%"
                  align="center"
                  sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                >
                  Cấp độ
                </TableCell>
                <TableCell
                  width="10%"
                  align="center"
                  sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  width="10%"
                  align="right"
                  sx={{ py: 2, fontWeight: 600, color: "text.secondary" }}
                >
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Stack alignItems="center" spacing={2}>
                      <Box sx={{ p: 2, borderRadius: "50%", bgcolor: "grey.100" }}>
                        <CategoryIcon sx={{ fontSize: 40, color: "text.disabled" }} />
                      </Box>
                      <Typography color="text.secondary">
                        {flatList.length === 0
                          ? "Chưa có danh mục nào"
                          : "Không tìm thấy danh mục phù hợp"}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((category) => (
                  <TableRow
                    key={category.id}
                    hover
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "primary.50",
                      },
                      // Minimal indent styling
                      bgcolor: "inherit",
                    }}
                  >
                    {/* Tên danh mục với indent */}
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          pl: category.depth * 3,
                        }}
                      >
                        {/* Connecting Lines for Tree Structure (Optional polish) */}
                        {category.depth > 0 && (
                          <Box sx={{ width: 12, height: 1, bgcolor: "grey.300", mr: 1, display: "none" }} /> // Hidden for cleaner look, relying on indent
                        )}

                        {/* Icon expand/collapse */}
                        {category.hasChildren ? (
                          <IconButton
                            size="small"
                            onClick={() => toggleExpand(category.id)}
                            sx={{ mr: 1, width: 24, height: 24 }}
                          >
                            {category.isExpanded ? (
                              <KeyboardArrowDown fontSize="small" />
                            ) : (
                              <KeyboardArrowRight fontSize="small" />
                            )}
                          </IconButton>
                        ) : (
                          <Box sx={{ width: 32, mr: 1 }} />
                        )}

                        {/* Folder/Item Icon based on depth */}
                        {category.depth === 0 ? (
                          <CategoryIcon sx={{ fontSize: 20, color: "primary.main", mr: 1.5 }} />
                        ) : (
                          <FiberManualRecord sx={{ fontSize: 8, color: "text.disabled", mr: 1.5 }} />
                        )}

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: category.depth === 0 ? 600 : 500,
                            color: "text.primary"
                          }}
                        >
                          {category.name}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Slug */}
                    <TableCell>
                      <Chip label={category.slug} size="small" sx={{ borderRadius: "6px", bgcolor: "grey.100", height: 24, fontSize: 12, fontFamily: "monospace" }} />
                    </TableCell>

                    {/* Level */}
                    <TableCell align="center">
                      <Box sx={{ display: "inline-block", px: 1, py: 0.5, borderRadius: "6px", bgcolor: "action.hover", fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
                        LVL {category.level}
                      </Box>
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "20px",
                          bgcolor:
                            category.isActive
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.error.main, 0.1),
                          color:
                            category.isActive
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
                          {category.isActive ? "Hoạt động" : "Vô hiệu"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Thêm danh mục con">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenAdd(category.id)}
                            sx={{
                              color: "success.main",
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(theme.palette.success.main, 0.2),
                              },
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(category)}
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
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(category.id)}
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
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog Add/Edit */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
            {editingId ? <Edit /> : <Add />}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="700">
              {editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editingId ? "Cập nhật thông tin chi tiết danh mục" : "Tạo danh mục mới cho hệ thống"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Stack spacing={3} pt={1}>
            <TextField
              label="Tên danh mục"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              InputProps={{
                sx: { borderRadius: "12px" },
              }}
            />
            <TextField
              label="Slug (URL)"
              fullWidth
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              helperText="Để trống sẽ tự động tạo từ tên"
              InputProps={{
                sx: { borderRadius: "12px" },
              }}
            />

            <TextField
              select
              label="Danh mục cha"
              fullWidth
              value={formData.parentId === null ? "" : formData.parentId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parentId: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              helperText="Chọn 'None' để làm danh mục gốc"
              InputProps={{
                sx: { borderRadius: "12px" },
              }}
            >
              <MenuItem value="">
                <em>None (Danh mục gốc)</em>
              </MenuItem>
              {allCategoriesForDropdown
                .filter((c) => c.id !== editingId)
                .map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    <Box sx={{ pl: option.depth * 2, display: "flex", alignItems: "center", gap: 1 }}>
                      {option.depth > 0 && <Box sx={{ width: 8, height: 1, bgcolor: "grey.400" }} />}
                      {option.name}
                    </Box>
                  </MenuItem>
                ))}
            </TextField>

            <Box sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px"
            }}>
              <Box>
                <Typography variant="subtitle2">Trạng thái hoạt động</Typography>
                <Typography variant="body2" color="text.secondary">Kích hoạt để danh mục hiển thị trên hệ thống</Typography>
              </Box>
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="text"
            color="inherit"
            sx={{ borderRadius: "10px", px: 3, textTransform: "none", fontWeight: 600 }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: "10px",
              px: 4,
              py: 1,
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
              textTransform: "none",
              fontWeight: 600
            }}
          >
            {editingId ? "Lưu thay đổi" : "Tạo danh mục"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirm Delete */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ pt: 3, px: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} color="error.main">
            <Block />
            <Typography variant="h6" fontWeight={700}>Xác nhận xóa</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác.
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: "error.50", borderRadius: "12px", border: "1px dashed", borderColor: "error.main" }}>
            <Typography variant="caption" color="error.main" fontWeight={600}>
              Lưu ý: Không thể xóa danh mục đang chứa danh mục con hoặc khóa học. Hãy đảm bảo danh mục rỗng trước khi xóa.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="text"
            color="inherit"
            sx={{ borderRadius: "10px", px: 3, textTransform: "none", fontWeight: 600 }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: "10px",
              px: 3,
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
              textTransform: "none",
              fontWeight: 600
            }}
          >
            Xóa danh mục
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement;
