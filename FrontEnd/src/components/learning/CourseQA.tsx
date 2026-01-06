import { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Select,
    Button,
    Avatar,
    IconButton,
    InputAdornment,
    type SelectChangeEvent
} from "@mui/material";
import { Search, ThumbUp, ChatBubbleOutline } from "@mui/icons-material";

interface Question {
    id: number;
    user: {
        name: string;
        avatar: string;
    };
    title: string;
    content: string;
    lectureName: string;
    lectureId: number;
    timeAgo: string;
    upvotes: number;
    replies: number;
}

const MOCK_QUESTIONS: Question[] = [
    {
        id: 1,
        user: { name: "Lihou", avatar: "" },
        title: "Model và Data Transform Object",
        content: "Tại sao phải tạo Model làm gì nữa anh, lấy các data trong Data Transform Object luôn có đc không ạ",
        lectureName: "Bài giảng số 16",
        lectureId: 101,
        timeAgo: "2 năm trước",
        upvotes: 32,
        replies: 1,
    },
    {
        id: 2,
        user: { name: "Nguyễn Xuân", avatar: "" },
        title: "tại sao khi upload file ở bài 18 a thay @RequestBody bằng @ModelAttribute",
        content: "đoạn này a không giải thích trên video mong a rep ạ",
        lectureName: "Bài giảng số 9",
        lectureId: 102,
        timeAgo: "2 năm trước",
        upvotes: 11,
        replies: 3,
    },
    {
        id: 3,
        user: { name: "Kiet", avatar: "" },
        title: "Dạ cho em hỏi, chỗ tài nguyên chưa link vô drive để download",
        content: "mà truy cập ... [hình ảnh]",
        lectureName: "Bài giảng số 47",
        lectureId: 103,
        timeAgo: "2 năm trước",
        upvotes: 6,
        replies: 5,
    },
];

const CourseQA = () => {
    const [filterScope, setFilterScope] = useState("all");
    const [sortOrder, setSortOrder] = useState("recommend");
    const [searchQuery, setSearchQuery] = useState("");

    const handleScopeChange = (event: SelectChangeEvent) => {
        setFilterScope(event.target.value);
    };

    const handleSortChange = (event: SelectChangeEvent) => {
        setSortOrder(event.target.value);
    };

    return (
        <Box>
            {/* Search and Filters */}
            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder="Tìm kiếm tất cả các câu hỏi trong khóa học"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 2, bgcolor: "white" }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton sx={{ bgcolor: "#6200ea", color: "white", borderRadius: 1, "&:hover": { bgcolor: "#4a00b0" } }}>
                                    <Search />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
                            Bộ lọc:
                        </Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={filterScope}
                            onChange={handleScopeChange}
                            sx={{ bgcolor: "white" }}
                        >
                            <MenuItem value="all">Tất cả các bài giảng</MenuItem>
                            <MenuItem value="current">Bài giảng hiện tại</MenuItem>
                        </Select>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
                            Sắp xếp theo:
                        </Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={sortOrder}
                            onChange={handleSortChange}
                            sx={{ bgcolor: "white" }}
                        >
                            <MenuItem value="recommend">Sắp xếp theo thứ tự đề xuất</MenuItem>
                            <MenuItem value="newest">Mới nhất</MenuItem>
                            <MenuItem value="upvotes">Nhiều lượt thích nhất</MenuItem>
                        </Select>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button variant="outlined" color="primary" sx={{ height: 40, textTransform: 'none' }}>
                            Lọc câu hỏi
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Questions List */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Tất cả các câu hỏi trong khóa học này ({MOCK_QUESTIONS.length})
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {MOCK_QUESTIONS.map((q) => (
                    <Box key={q.id} sx={{ display: "flex", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "black", width: 40, height: 40 }}>
                            {q.user.name.substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                {q.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {q.content}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, fontSize: "0.875rem" }}>
                                <Typography
                                    component="span"
                                    variant="caption"
                                    color="primary"
                                    sx={{ cursor: "pointer", textDecoration: "underline" }}
                                >
                                    {q.user.name}
                                </Typography>
                                <Typography component="span" variant="caption" color="text.secondary">
                                    •
                                </Typography>
                                <Typography
                                    component="span"
                                    variant="caption"
                                    color="primary"
                                    sx={{ cursor: "pointer" }}
                                >
                                    {q.lectureName}
                                </Typography>
                                <Typography component="span" variant="caption" color="text.secondary">
                                    •
                                </Typography>
                                <Typography component="span" variant="caption" color="text.secondary">
                                    {q.timeAgo}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" fontWeight={700}>{q.upvotes}</Typography>
                                <ThumbUp fontSize="small" color="action" sx={{ fontSize: 16 }} />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" fontWeight={700}>{q.replies}</Typography>
                                <ChatBubbleOutline fontSize="small" color="action" sx={{ fontSize: 16 }} />
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default CourseQA;
