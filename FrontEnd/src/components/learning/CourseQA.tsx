import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  Button,
  IconButton,
  InputAdornment,
  type SelectChangeEvent,
} from "@mui/material";
import { Search, QuestionAnswer } from "@mui/icons-material";

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
                <IconButton
                  sx={{
                    bgcolor: "#6200ea",
                    color: "white",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "#4a00b0" },
                  }}
                >
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              display="block"
              mb={0.5}
            >
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
            <Typography
              variant="caption"
              fontWeight={700}
              display="block"
              mb={0.5}
            >
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

          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <Button
              variant="outlined"
              color="primary"
              sx={{ height: 40, textTransform: "none" }}
            >
              Lọc câu hỏi
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Empty state - Q&A API not yet available */}
      <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
        <QuestionAnswer sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
        <Typography variant="h6" fontWeight={600} mb={1}>
          Chưa có câu hỏi nào
        </Typography>
        <Typography variant="body2">
          Tính năng hỏi đáp sẽ sớm được cập nhật.
        </Typography>
      </Box>
    </Box>
  );
};

export default CourseQA;
