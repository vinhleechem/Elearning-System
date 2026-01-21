import {
    Box,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { useState } from "react";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";

const InstructorQnAPage = () => {
    const [sortOrder, setSortOrder] = useState("newest");
    const [selectedCourse, setSelectedCourse] = useState("all");

    return (
        <Box sx={{ p: 4 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ fontFamily: "serif", fontSize: "1.75rem" }}>
                    Hỏi đáp
                </Typography>
                <Select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    variant="standard"
                    disableUnderline
                    sx={{
                        fontSize: "1.35rem", // Adjusted size
                        fontWeight: 400,
                        color: "#5624d0",
                        "& .MuiSelect-select": {
                            py: 0,
                        },
                    }}
                >
                    <MenuItem value="all">dsaaaaaaaa</MenuItem>
                    <MenuItem value="course1">Khóa học 1</MenuItem>
                </Select>
            </Stack>

            {/* Empty State */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 8,
                    mb: 4,
                }}
            >
                <Box
                    sx={{
                        width: 200,
                        height: 150,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ForumOutlinedIcon sx={{ fontSize: 100, color: "#d1d7dc" }} />
                </Box>

                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    Chưa có câu hỏi
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ maxWidth: 500 }}
                >
                    Hỏi đáp là diễn đàn nơi học viên có thể đặt câu hỏi, nghe bạn trả lời và
                    phản hồi lẫn nhau. Đây là nơi bạn sẽ thấy chuỗi Hỏi đáp của các khóa học
                </Typography>
            </Box>

            {/* Filters Toolbar */}
            <Stack direction="row" gap={3} alignItems="center">
                <Typography fontWeight={700} sx={{ mr: 1 }}>Q&A</Typography>
                <Box
                    sx={{
                        bgcolor: "#d1fae5",
                        color: "#065f46",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        px: 1,
                        borderRadius: 0.5,
                    }}
                >
                    Thông tin chi tiết Mới
                </Box>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={3} alignItems="center" sx={{ mt: 2 }}>
                <FormControlLabel control={<Checkbox size="small" />} label="Chưa đọc (0)" componentsProps={{ typography: { fontSize: "0.9rem" } }} />
                <FormControlLabel control={<Checkbox size="small" />} label="Không có đáp án hàng đầu (0)" componentsProps={{ typography: { fontSize: "0.9rem" } }} />
                <FormControlLabel control={<Checkbox size="small" />} label="Không có đáp án nào (0)" componentsProps={{ typography: { fontSize: "0.9rem" } }} />
                <FormControlLabel control={<Checkbox size="small" />} label="Không có đáp án của giảng viên (0)" componentsProps={{ typography: { fontSize: "0.9rem" } }} />

                <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" fontWeight={700} fontSize="0.85rem">Sắp xếp theo:</Typography>
                    <Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        variant="standard"
                        disableUnderline
                        sx={{
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            "& .MuiSelect-select": {
                                py: 0
                            }
                        }}
                    >
                        <MenuItem value="newest">Mới nhất trước tiên</MenuItem>
                        <MenuItem value="oldest">Cũ nhất trước tiên</MenuItem>
                    </Select>
                </Box>
            </Stack>
        </Box>
    );
};

export default InstructorQnAPage;
