import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    Box,
} from "@mui/material";
import { useState, useEffect } from "react";
import { categoryService, type CategoryTreeResponse } from "../../service/categoryService";
import type { CreateCourseRequest } from "../../service/courseService";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCourseRequest) => Promise<void>;
    instructorId: number;
}

const CreateCourseDialog: React.FC<Props> = ({ open, onClose, onSubmit, instructorId }) => {
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const tree = await categoryService.getCategoryTree();
                // Flatten tree to get all categories
                const flatCategories: Array<{ id: number; name: string }> = [];
                const flatten = (nodes: CategoryTreeResponse[], prefix = "") => {
                    nodes.forEach((node) => {
                        flatCategories.push({
                            id: node.id,
                            name: prefix + node.name,
                        });
                        if (node.children && node.children.length > 0) {
                            flatten(node.children, prefix + node.name + " > ");
                        }
                    });
                };
                flatten(tree);
                setCategories(flatCategories);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setCategoriesLoading(false);
            }
        };

        if (open) {
            fetchCategories();
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!title.trim() || !categoryId) return;

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        const request: CreateCourseRequest = {
            instructorId,
            categoryId: categoryId as number,
            title: title.trim(),
            slug,
            language: "Tiếng Việt",
            level: "Beginner",
        };

        try {
            setLoading(true);
            await onSubmit(request);
            // Reset form
            setTitle("");
            setCategoryId("");
            onClose();
        } catch (error) {
            console.error("Failed to create course:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setTitle("");
            setCategoryId("");
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Tạo khóa học mới</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField
                        label="Tiêu đề khóa học"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Lập trình React từ cơ bản đến nâng cao"
                        disabled={loading}
                        autoFocus
                    />
                    <TextField
                        select
                        label="Danh mục"
                        fullWidth
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        disabled={loading || categoriesLoading}
                        helperText={categoriesLoading ? "Đang tải danh mục..." : ""}
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!title.trim() || !categoryId || loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? "Đang tạo..." : "Tạo khóa học"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateCourseDialog;
