import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
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
  FormControlLabel,
  MenuItem,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress,
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
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
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
  const { enqueueSnackbar } = useSnackbar();
  const [rawCategories, setRawCategories] = useState<CategoryResponse[]>([]);
  const [flatList, setFlatList] = useState<FlatCategory[]>([]);
  const [filteredList, setFilteredList] = useState<FlatCategory[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={4}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <CategoryIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Quản lý Danh mục
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý cấu trúc danh mục khóa học theo dạng cây phân cấp
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenAdd(null)}
          size="large"
        >
          Thêm danh mục gốc
        </Button>
      </Stack>

      {/* Search & Filters */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider" }}
      >
        <Stack spacing={2}>
          {/* Search Bar */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
            <Tooltip title="Mở tất cả">
              <Button
                variant="outlined"
                size="small"
                onClick={expandAll}
                startIcon={<UnfoldMore />}
                sx={{ whiteSpace: "nowrap", minWidth: "auto" }}
              >
                Mở tất cả
              </Button>
            </Tooltip>
            <Tooltip title="Đóng tất cả">
              <Button
                variant="outlined"
                size="small"
                onClick={collapseAll}
                startIcon={<ExpandMore />}
                sx={{ whiteSpace: "nowrap", minWidth: "auto" }}
              >
                Đóng tất cả
              </Button>
            </Tooltip>
          </Stack>

          {/* Filter Chips */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <FilterList sx={{ color: "text.secondary", fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Cấp độ:
            </Typography>
            <Chip
              label="Tất cả"
              size="small"
              onClick={() => setFilterLevel("ALL")}
              color={filterLevel === "ALL" ? "primary" : "default"}
              variant={filterLevel === "ALL" ? "filled" : "outlined"}
            />
            <Chip
              label="Level 1"
              size="small"
              onClick={() => setFilterLevel(1)}
              color={filterLevel === 1 ? "primary" : "default"}
              variant={filterLevel === 1 ? "filled" : "outlined"}
            />
            <Chip
              label="Level 2"
              size="small"
              onClick={() => setFilterLevel(2)}
              color={filterLevel === 2 ? "primary" : "default"}
              variant={filterLevel === 2 ? "filled" : "outlined"}
            />
            <Chip
              label="Level 3"
              size="small"
              onClick={() => setFilterLevel(3)}
              color={filterLevel === 3 ? "primary" : "default"}
              variant={filterLevel === 3 ? "filled" : "outlined"}
            />
            <Box sx={{ width: 20 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Trạng thái:
            </Typography>
            <Chip
              label="Tất cả"
              size="small"
              onClick={() => setFilterStatus("ALL")}
              color={filterStatus === "ALL" ? "primary" : "default"}
              variant={filterStatus === "ALL" ? "filled" : "outlined"}
            />
            <Chip
              label="Kích hoạt"
              size="small"
              onClick={() => setFilterStatus("ACTIVE")}
              color={filterStatus === "ACTIVE" ? "success" : "default"}
              variant={filterStatus === "ACTIVE" ? "filled" : "outlined"}
            />
            <Chip
              label="Vô hiệu"
              size="small"
              onClick={() => setFilterStatus("INACTIVE")}
              color={filterStatus === "INACTIVE" ? "warning" : "default"}
              variant={filterStatus === "INACTIVE" ? "filled" : "outlined"}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Statistics */}
      <Stack direction="row" spacing={2} mb={3}>
        <Chip
          label={`Tổng: ${flatList.length} danh mục`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`Hiển thị: ${filteredList.length} danh mục`}
          color="info"
          variant="outlined"
        />
        <Chip
          label={`Kích hoạt: ${flatList.filter((c) => c.isActive).length}`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`Vô hiệu: ${flatList.filter((c) => !c.isActive).length}`}
          color="warning"
          variant="outlined"
        />
      </Stack>

      {/* Table */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell width="50%">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Tên danh mục
                  </Typography>
                </TableCell>
                <TableCell width="20%">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Slug
                  </Typography>
                </TableCell>
                <TableCell width="10%" align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Cấp độ
                  </Typography>
                </TableCell>
                <TableCell width="10%" align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Trạng thái
                  </Typography>
                </TableCell>
                <TableCell width="10%" align="right">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Hành động
                  </Typography>
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
                    <CategoryIcon
                      sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                    />
                    <Typography color="text.secondary">
                      {flatList.length === 0
                        ? "Chưa có danh mục nào"
                        : "Không tìm thấy danh mục phù hợp"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((category) => (
                  <TableRow
                    key={category.id}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                      bgcolor:
                        category.depth > 0
                          ? alpha(theme.palette.grey[500], 0.02 * category.depth)
                          : "inherit",
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
                        {/* Icon expand/collapse */}
                        {category.hasChildren ? (
                          <IconButton
                            size="small"
                            onClick={() => toggleExpand(category.id)}
                            sx={{ mr: 1 }}
                          >
                            {category.isExpanded ? (
                              <KeyboardArrowDown fontSize="small" />
                            ) : (
                              <KeyboardArrowRight fontSize="small" />
                            )}
                          </IconButton>
                        ) : (
                          <Box sx={{ width: 32, mr: 1 }} /> // Placeholder
                        )}

                        {/* Dấu chấm cho các level con */}
                        {category.depth > 0 && (
                          <FiberManualRecord
                            sx={{
                              fontSize: 6,
                              color: theme.palette.primary.main,
                              mr: 1,
                              opacity: 0.6,
                            }}
                          />
                        )}

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: category.depth === 0 ? 600 : 400,
                          }}
                        >
                          {category.name}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Slug */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: "monospace", fontSize: 12 }}
                      >
                        {category.slug}
                      </Typography>
                    </TableCell>

                    {/* Level */}
                    <TableCell align="center">
                      <Chip
                        label={`Level ${category.level}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell align="center">
                      <Switch checked={category.isActive} size="small" disabled />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Thêm danh mục con">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenAdd(category.id)}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenEdit(category)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(category.id)}
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
      </Paper>

      {/* Dialog Add/Edit */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} pt={1}>
            <TextField
              label="Tên danh mục"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              autoFocus
            />
            <TextField
              label="Slug (URL)"
              fullWidth
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              helperText="Để trống sẽ tự động tạo từ tên"
            />

            <TextField
              select
              label="Danh mục cha"
              fullWidth
              value={formData.parentId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parentId: e.target.value ? Number(e.target.value) : null,
                })
              }
              helperText="Chọn 'None' để làm danh mục gốc"
            >
              <MenuItem value="">
                <em>None (Danh mục gốc)</em>
              </MenuItem>
              {allCategoriesForDropdown
                .filter((c) => c.id !== editingId)
                .map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    <Box sx={{ pl: option.depth * 2 }}>
                      {option.depth > 0 && "└─ "}
                      {option.name}
                    </Box>
                  </MenuItem>
                ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="Kích hoạt"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirm Delete */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa danh mục này không?
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
            Lưu ý: Không thể xóa danh mục đang chứa danh mục con hoặc khóa học.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement;
