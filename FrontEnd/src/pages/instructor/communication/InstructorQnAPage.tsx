import {
    Box,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
    Card,
    InputAdornment,
    TextField,
    Chip,
    Divider,
} from "@mui/material";
import { useState } from "react";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";

const InstructorQnAPage = () => {
    const [sortOrder, setSortOrder] = useState("newest");
    const [selectedCourse, setSelectedCourse] = useState("all");

    return (
        <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: 1200, mx: "auto", width: "100%" }}>
            {/* ─── HEADER ─── */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: "#0f172a", mb: 1 }}>
                    Hỏi & Đáp
                </Typography>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="body2" color="#64748b" fontWeight={500}>
                        Đang hiển thị cho:
                    </Typography>
                    <Select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        variant="standard"
                        disableUnderline
                        sx={{
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: "#2563eb",
                            bgcolor: "#eff6ff",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "8px",
                            "& .MuiSelect-select": { py: 0.5 },
                        }}
                    >
                        <MenuItem value="all">Tất cả khóa học</MenuItem>
                        <MenuItem value="course1">Phát triển Web toàn diện</MenuItem>
                        <MenuItem value="course2">Thiết kế UI/UX nâng cao</MenuItem>
                    </Select>
                </Stack>
            </Box>

            {/* ─── FILTERS BAR ─── */}
            <Card
                elevation={0}
                sx={{
                    p: 2,
                    mb: 4,
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <TextField
                    placeholder="Tìm kiếm câu hỏi..."
                    size="small"
                    sx={{
                        flex: 1,
                        minWidth: 200,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            bgcolor: "#f8fafc",
                            "& fieldset": { borderColor: "transparent" },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

                <Stack direction="row" gap={1.5} alignItems="center" sx={{ flexWrap: "wrap" }}>
                    <Chip
                        label="Chưa đọc (0)"
                        variant="outlined"
                        onClick={() => { }}
                        sx={{ borderRadius: "8px", fontWeight: 600, px: 1 }}
                    />
                    <Chip
                        label="Chưa phản hồi (0)"
                        color="primary"
                        variant="filled"
                        onClick={() => { }}
                        sx={{ borderRadius: "8px", fontWeight: 600, px: 1, bgcolor: "#2563eb" }}
                    />
                    <Chip
                        label="Câu hỏi yêu thích (0)"
                        variant="outlined"
                        onClick={() => { }}
                        sx={{ borderRadius: "8px", fontWeight: 600, px: 1 }}
                    />
                </Stack>

                <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
                    <SortIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    <Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        variant="standard"
                        disableUnderline
                        sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#475569" }}
                    >
                        <MenuItem value="newest">Mới nhất trước</MenuItem>
                        <MenuItem value="oldest">Cũ nhất trước</MenuItem>
                        <MenuItem value="popular">Phổ biến nhất</MenuItem>
                    </Select>
                </Box>
            </Card>

            {/* ─── EMPTY STATE ─── */}
            <Card
                elevation={0}
                sx={{
                    py: 12,
                    px: 4,
                    textAlign: "center",
                    borderRadius: "24px",
                    border: "2px dashed #e2e8f0",
                    bgcolor: "white",
                }}
            >
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "#f1f5f9",
                        borderRadius: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                        color: "#cbd5e1",
                    }}
                >
                    <QuestionAnswerOutlinedIcon sx={{ fontSize: 40 }} />
                </Box>

                <Typography variant="h5" fontWeight={800} sx={{ color: "#1e293b", mb: 1 }}>
                    Hộp thư trống
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ color: "#64748b", maxWidth: 500, mx: "auto", mb: 4, lineHeight: 1.6 }}
                >
                    Chào bạn! Hiện tại chưa có câu hỏi nào từ học viên. Hãy đảm bảo nội dung khóa học
                    của bạn kích thích sự tò mò để học viên tương tác nhiều hơn nhé.
                </Typography>

                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 1, bgcolor: "#f0fdf4", borderRadius: "8px" }}>
                    <Box sx={{ width: 8, height: 8, bgcolor: "#22c55e", borderRadius: "50%" }} />
                    <Typography variant="caption" fontWeight={700} color="#166534">
                        Giảng viên đang hoạt động
                    </Typography>
                </Box>
            </Card>

            {/* ─── FOOTER INFO ─── */}
            <Box sx={{ mt: 5, p: 3, bgcolor: "#eff6ff", borderRadius: "16px", border: "1px solid #dbeafe" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: "#3b82f6", borderRadius: "8px", color: "white" }}>
                        <FilterListIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={800} color="#1e3a8a">
                            Bạn có biết?
                        </Typography>
                        <Typography variant="body2" color="#60a5fa" sx={{ fontSize: "0.85rem" }}>
                            Phản hồi trong vòng 24h giúp tăng tỷ lệ hoàn thành khóa học của học viên lên đến 30%.
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
};

export default InstructorQnAPage;
