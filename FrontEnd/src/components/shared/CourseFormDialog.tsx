import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Tabs,
    Tab,
    Divider,
    Switch,
    FormControlLabel,
} from "@mui/material";
import { School, FolderOpen, CloudUpload, Edit, Add } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useState, useEffect } from "react";
import { fileUploadService } from "../../service/fileUploadService";

// Define a flexible type that covers both Admin and Instructor course responses
export interface CourseData {
    courseId?: number;
    title: string;
    categoryId: number;
    instructorId: number;
    instructorName?: string;
    categoryName?: string;
    shortDescription?: string;
    description?: string;
    whatYouLearn?: string;
    requirements?: string;
    targetAudience?: string;
    thumbnailUrl?: string;
    previewVideoUrl?: string;
    price?: number;
    level?: string;
    language?: string;
    status?: string;
    hasCertificate?: boolean;
    slug?: string;
    averageRating?: number;
    publishedAt?: string;
    isPurchased?: boolean; // For display only
    purchasedAt?: string;
    promotionName?: string;
    promotionType?: string;
    discountPercentage?: number;
    promotionEndDate?: string;
    [key: string]: any;
}

export interface FormData {
    title: string;
    categoryId: string | number;
    instructorId: string | number;
    shortDescription: string;
    description: string;
    whatYouLearn: string;
    requirements: string;
    targetAudience: string;
    thumbnailUrl: string;
    previewVideoUrl: string;
    price: string;
    level: string;
    language: string;
    status: string;
    hasCertificate: boolean;
}

interface CourseFormDialogProps {
    open: boolean;
    onClose: () => void;
    editingCourse: CourseData | null;
    mode: "ADMIN" | "INSTRUCTOR";
    flatCategories: { id: number; name: string; level: number; path: string }[];
    onSubmit: (data: FormData) => Promise<void>;
}

export const CourseFormDialog = ({
    open,
    onClose,
    editingCourse,
    mode,
    flatCategories,
    onSubmit,
}: CourseFormDialogProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const [dialogTab, setDialogTab] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        title: "",
        categoryId: "",
        instructorId: "",
        shortDescription: "",
        description: "",
        whatYouLearn: "",
        requirements: "",
        targetAudience: "",
        thumbnailUrl: "",
        previewVideoUrl: "",
        price: "",
        level: "Beginner",
        language: "Tiếng Việt",
        status: "DRAFT",
        hasCertificate: false,
    });

    useEffect(() => {
        if (open) {
            setDialogTab(0);
            if (editingCourse) {
                setFormData({
                    title: editingCourse.title || "",
                    categoryId: editingCourse.categoryId || "",
                    instructorId: editingCourse.instructorId || "",
                    shortDescription: editingCourse.shortDescription || "",
                    description: editingCourse.description || "",
                    whatYouLearn: editingCourse.whatYouLearn || "",
                    requirements: editingCourse.requirements || "",
                    targetAudience: editingCourse.targetAudience || "",
                    thumbnailUrl: editingCourse.thumbnailUrl || "",
                    previewVideoUrl: editingCourse.previewVideoUrl || "",
                    price: editingCourse.price ? editingCourse.price.toString() : "",
                    level: editingCourse.level || "",
                    language: editingCourse.language || "",
                    status: editingCourse.status || "DRAFT",
                    hasCertificate: editingCourse.hasCertificate || false,
                });
            } else {
                setFormData({
                    title: "",
                    categoryId: "",
                    instructorId: "",
                    shortDescription: "",
                    description: "",
                    whatYouLearn: "",
                    requirements: "",
                    targetAudience: "",
                    thumbnailUrl: "",
                    previewVideoUrl: "",
                    price: "",
                    level: "Beginner",
                    language: "Tiếng Việt",
                    status: "DRAFT",
                    hasCertificate: false,
                });
            }
        }
    }, [open, editingCourse]);

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        try {
            const url = await fileUploadService.uploadFile(file);
            setFormData(prev => ({ ...prev, thumbnailUrl: url }));
            enqueueSnackbar("Upload ảnh thành công", { variant: "success" });
        } catch (error: any) {
            console.error("Upload error details:", error);
            const errorMessage = error?.message || "Upload ảnh thất bại";
            enqueueSnackbar(errorMessage, { variant: "error" });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        // Basic validation
        if (!formData.title.trim()) {
            enqueueSnackbar("Tiêu đề không được để trống", { variant: "warning" });
            return;
        }
        if (!formData.categoryId) {
            enqueueSnackbar("Vui lòng chọn danh mục", { variant: "warning" });
            return;
        }
        // If admin, instructor is required
        if (mode === "ADMIN" && !formData.instructorId && !editingCourse) {
            // For Admin creating course, instructor is needed. 
            // But existing admin dialog hardcoded instructor dropdown.
            // We will check logic below
        }

        try {
            setSubmitting(true);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
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
                    {editingCourse ? <Edit /> : <Add />}
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="700">
                        {editingCourse ? "Cập nhật khóa học" : "Tạo khóa học mới"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {editingCourse ? "Chỉnh sửa thông tin chi tiết của khóa học" : "Điền thông tin để tạo khóa học mới"}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                    <Tabs
                        value={dialogTab}
                        onChange={(_, v) => setDialogTab(v)}
                        sx={{
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                minHeight: 48,
                            },
                        }}
                    >
                        <Tab label="Thông tin cơ bản" />
                        <Tab label="Nội dung" />
                        <Tab label="Media & Cài đặt" />
                        {editingCourse && <Tab label="Thông tin chi tiết" />}
                    </Tabs>
                </Box>

                {/* Tab 0: Basic Info */}
                {dialogTab === 0 && (
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
                            InputProps={{
                                sx: { borderRadius: "12px" },
                            }}
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Chọn danh mục</InputLabel>
                            <Select
                                label="Chọn danh mục"
                                value={formData.categoryId}
                                onChange={(e) =>
                                    setFormData({ ...formData, categoryId: e.target.value })
                                }
                                sx={{ borderRadius: "12px" }}
                                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                                renderValue={(value) => {
                                    const cat = flatCategories.find((c) => c.id === Number(value));
                                    if (!cat) return "";
                                    return (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography variant="body2">{cat.path}</Typography>
                                        </Box>
                                    )
                                }}
                            >
                                {flatCategories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: (cat.level - 1) * 2 }}>
                                            <FolderOpen sx={{ fontSize: 16, color: "text.secondary" }} />
                                            <Typography variant="body2" fontWeight={cat.level === 1 ? 600 : 400}>
                                                {cat.name}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Only Admin can select Instructor */}
                        {mode === "ADMIN" && !editingCourse && (
                            <FormControl fullWidth required>
                                <InputLabel>Chọn giảng viên</InputLabel>
                                <Select
                                    label="Chọn giảng viên"
                                    value={formData.instructorId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, instructorId: e.target.value })
                                    }
                                    sx={{ borderRadius: "12px" }}
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
                            InputProps={{
                                sx: { borderRadius: "12px" },
                            }}
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
                                InputProps={{
                                    sx: { borderRadius: "12px" },
                                }}
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
                                    sx={{ borderRadius: "12px" }}
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
                                InputProps={{
                                    sx: { borderRadius: "12px" },
                                }}
                            />
                        </Stack>

                        {/* Only Admin can force change status here (Create or Edit) */}
                        {mode === "ADMIN" && (
                            <FormControl fullWidth>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    label="Trạng thái"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                    sx={{ borderRadius: "12px" }}
                                >
                                    <MenuItem value="DRAFT">Bản nháp</MenuItem>
                                    <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                                    <MenuItem value="PUBLISHED">Đã xuất bản</MenuItem>
                                    <MenuItem value="REJECTED">Bị từ chối</MenuItem>
                                    <MenuItem value="ARCHIVED">Lưu trữ</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                )}

                {/* Tab 1: Content */}
                {dialogTab === 1 && (
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Mô tả chi tiết"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            InputProps={{
                                sx: { borderRadius: "12px" },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Bạn sẽ học được gì"
                            multiline
                            rows={4}
                            value={formData.whatYouLearn}
                            onChange={(e) => setFormData({ ...formData, whatYouLearn: e.target.value })}
                            InputProps={{
                                sx: { borderRadius: "12px" },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Yêu cầu"
                            multiline
                            rows={3}
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            InputProps={{
                                sx: { borderRadius: "12px" },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Đối tượng mục tiêu"
                            multiline
                            rows={3}
                            value={formData.targetAudience}
                            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                            InputProps={{
                                sx: { borderRadius: "12px" },
                            }}
                        />
                    </Stack>
                )}

                {/* Tab 2: Media & Settings */}
                {dialogTab === 2 && (
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="URL Thumbnail"
                            placeholder="https://example.com/thumbnail.jpg"
                            value={formData.thumbnailUrl}
                            InputProps={{
                                readOnly: true,
                                sx: { borderRadius: "12px", bgcolor: "action.hover" }
                            }}
                        />

                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUpload />}
                            disabled={uploading}
                            sx={{
                                borderRadius: "12px",
                                textTransform: "none",
                                borderStyle: "dashed",
                                borderWidth: 2,
                                py: 2,
                                "&:hover": { borderWidth: 2 }
                            }}
                        >
                            {uploading
                                ? "Đang upload..."
                                : formData.thumbnailUrl
                                    ? "Thay đổi ảnh khác"
                                    : "Tải ảnh lên từ máy"}
                            <input type="file" hidden accept="image/*" onChange={handleThumbnailUpload} />
                        </Button>

                        {formData.thumbnailUrl && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>Preview Thumbnail:</Typography>
                                <Box component="img" src={formData.thumbnailUrl} alt="Thumbnail Preview" sx={{ display: "block", width: "100%", maxHeight: 250, objectFit: "cover", borderRadius: 4, border: "1px solid", borderColor: "divider", mt: 1, bgcolor: "background.neutral" }} onError={(e: any) => { e.target.style.display = "none"; }} />
                            </Box>
                        )}

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
                                <Typography variant="subtitle2">Chứng chỉ</Typography>
                                <Typography variant="body2" color="text.secondary">Cấp chứng chỉ sau khi hoàn thành khóa học</Typography>
                            </Box>
                            <Switch checked={formData.hasCertificate} onChange={(e) => setFormData({ ...formData, hasCertificate: e.target.checked })} />
                        </Box>
                    </Stack>
                )}

                {/* Tab 3: Detailed Info (Read-only) */}
                {dialogTab === 3 && editingCourse && (
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Thông tin giảng viên</Typography>
                            <Typography variant="body1" fontWeight={500}>{editingCourse.instructorName || "N/A"}</Typography>
                        </Box>
                        <Divider />
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Danh mục</Typography>
                            <Typography variant="body1" fontWeight={500}>{editingCourse.categoryName || "N/A"}</Typography>
                        </Box>
                        <Divider />
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Slug</Typography>
                            <Typography variant="body1" sx={{ fontFamily: "monospace", bgcolor: "action.hover", p: 1, borderRadius: 1 }}>{editingCourse.slug}</Typography>
                        </Box>
                        <Divider />
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Ngày xuất bản</Typography>
                            <Typography variant="body1" fontWeight={500}>{editingCourse.publishedAt ? new Date(editingCourse.publishedAt).toLocaleString("vi-VN") : "Chưa xuất bản"}</Typography>
                        </Box>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    onClick={onClose}
                    disabled={submitting}
                    variant="text"
                    color="inherit"
                    sx={{ borderRadius: "10px", px: 3, textTransform: "none", fontWeight: 600 }}
                >
                    Hủy bỏ
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={submitting}
                    sx={{
                        borderRadius: "10px",
                        px: 4,
                        py: 1,
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                        textTransform: "none",
                        fontWeight: 600
                    }}
                >
                    {submitting ? "Đang xử lý..." : (editingCourse ? "Lưu thay đổi" : "Tạo khóa học")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
