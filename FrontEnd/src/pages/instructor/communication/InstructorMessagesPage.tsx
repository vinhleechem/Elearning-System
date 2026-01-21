import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

const InstructorMessagesPage = () => {
    const [sortOrder, setSortOrder] = useState("newest");
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <Box sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={700} sx={{ fontFamily: "serif", fontSize: "1.75rem" }}>
                    Tin nhắn
                </Typography>
                <Button
                    variant="outlined"
                    sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        color: "#5624d0",
                        borderColor: "#5624d0",
                        "&:hover": { borderColor: "#401b9c", bgcolor: "rgba(86, 36, 208, 0.04)" }
                    }}
                >
                    Soạn tin nhắn
                </Button>
            </Stack>

            {/* Filters */}
            <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center" sx={{ mb: 2 }}>
                <FormControlLabel control={<Checkbox size="small" defaultChecked />} label="Chưa đọc" componentsProps={{ typography: { fontSize: "0.9rem" } }} />
                <FormControlLabel control={<Checkbox size="small" />} label="Quan trọng" componentsProps={{ typography: { fontSize: "0.9rem" } }} />
                <FormControlLabel control={<Checkbox size="small" />} label="Chưa trả lời" componentsProps={{ typography: { fontSize: "0.9rem" } }} />
                <FormControlLabel control={<Checkbox size="small" />} label="Hiện tin nhắn tự động" componentsProps={{ typography: { fontSize: "0.9rem" } }} />

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

            <Box sx={{ display: "flex", flex: 1, border: "1px solid #d1d7dc" }}>
                {/* Left / List Pane */}
                <Box sx={{ width: 350, borderRight: "1px solid #d1d7dc", display: "flex", flexDirection: "column" }}>
                    <Box sx={{ p: 1, borderBottom: "1px solid #d1d7dc" }}>
                        <TextField
                            placeholder="Tìm kiếm theo từ khóa, tên người gửi"
                            fullWidth
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon sx={{ color: "#6a6f73" }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 0,
                                    "& fieldset": { border: "1px solid #6a6f73" }
                                }
                            }}
                        />
                    </Box>

                    {/* Empty List State */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 3 }}>
                        <MailOutlineIcon sx={{ fontSize: 80, color: "#2d2f31", mb: 2 }} />
                        <Typography variant="subtitle1" fontWeight={700} textAlign="center">
                            Không có mục nào chưa đọc
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            Bạn đã xem hết các mục
                        </Typography>
                    </Box>
                </Box>

                {/* Right / Detail Pane */}
                <Box sx={{ flex: 1, bgcolor: "#fff" }}>
                    {/* Blank empty state */}
                </Box>
            </Box>
        </Box>
    );
};

export default InstructorMessagesPage;
