import { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Rating,
    Skeleton,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Slider,
    TextField,
    Button,
    Chip,
    IconButton,
    Divider,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { courseService } from "../service/courseService";
import type { PublicCourseResponse } from "../service/courseService";

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchQuery = searchParams.get("search") || "";

    const [courses, setCourses] = useState<PublicCourseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalResults, setTotalResults] = useState(0);
    const [sortBy, setSortBy] = useState("relevance");

    // Filters
    const [priceRange, setPriceRange] = useState<number[]>([0, 5000000]);
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

    useEffect(() => {
        fetchSearchResults();
    }, [searchQuery, sortBy, selectedRatings, selectedLevels]);

    const fetchSearchResults = async () => {
        setLoading(true);
        try {
            // In real app, pass sort/filter params here
            const result = await courseService.getPublicCourses({
                page: 0,
                size: 20,
                search: searchQuery,
            });
            setCourses(result.data || []);
            setTotalResults(result.pagination?.totalElements || 0);
        } catch (error) {
            console.error("Failed to fetch search results:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = (courseId: number) => {
        navigate(`/course/${courseId}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Sort options
    const SortOption = ({
        label,
        value,
    }: {
        label: string;
        value: string;
    }) => (
        <Typography
            variant="body2"
            onClick={() => setSortBy(value)}
            sx={{
                cursor: "pointer",
                fontWeight: sortBy === value ? 700 : 400,
                color: sortBy === value ? "#1976d2" : "text.primary",
                mx: 1.5,
                "&:hover": { color: "#1976d2" },
            }}
        >
            {label}
        </Typography>
    );

    return (
        <Box sx={{ bgcolor: "#f3f4f6", minHeight: "100vh", py: 2 }}>
            <Container maxWidth="xl">
                {/* Main Layout: Flexbox */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    {/* LEFT SIDEBAR */}
                    <Box
                        sx={{
                            width: "260px",
                            flexShrink: 0,
                            bgcolor: "white",
                            borderRadius: "8px",
                            p: 2,
                            height: "fit-content",
                            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <FilterListIcon sx={{ mr: 1, color: "#1976d2" }} />
                            <Typography variant="h6" fontWeight="700" fontSize="1rem">
                                Bộ lọc tìm kiếm
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Price Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography fontWeight="600" mb={1} fontSize="0.9rem">
                                Mức giá
                            </Typography>
                            <FormGroup>
                                {["Dưới 500k", "Từ 500k - 1 triệu", "Trên 1 triệu"].map(
                                    (label, idx) => (
                                        <FormControlLabel
                                            key={idx}
                                            control={<Checkbox size="small" />}
                                            label={
                                                <Typography variant="body2" fontSize="0.875rem">
                                                    {label}
                                                </Typography>
                                            }
                                            sx={{ mb: 0.5 }}
                                        />
                                    )
                                )}
                            </FormGroup>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Hoặc nhập khoảng giá:
                                </Typography>
                                <Slider
                                    value={priceRange}
                                    onChange={(_, val) => setPriceRange(val as number[])}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={5000000}
                                    sx={{ color: "#1976d2", mt: 1 }}
                                />
                                <Box display="flex" justifyContent="space-between" mt={1}>
                                    <TextField
                                        size="small"
                                        value={priceRange[0]}
                                        inputProps={{ style: { fontSize: 12, padding: 4 } }}
                                        sx={{ width: 80 }}
                                    />
                                    <Typography>-</Typography>
                                    <TextField
                                        size="small"
                                        value={priceRange[1]}
                                        inputProps={{ style: { fontSize: 12, padding: 4 } }}
                                        sx={{ width: 80 }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Level Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography fontWeight="600" mb={1} fontSize="0.9rem">
                                Cấp độ
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {["Sơ cấp", "Trung cấp", "Chuyên gia", "Tất cả"].map((level) => (
                                    <Chip
                                        key={level}
                                        label={level}
                                        variant={selectedLevels.includes(level) ? "filled" : "outlined"}
                                        onClick={() => {
                                            if (selectedLevels.includes(level)) {
                                                setSelectedLevels(selectedLevels.filter(l => l !== level));
                                            } else {
                                                setSelectedLevels([...selectedLevels, level]);
                                            }
                                        }}
                                        sx={{
                                            borderRadius: "4px",
                                            height: "28px",
                                            bgcolor: selectedLevels.includes(level) ? "#1976d2" : "transparent",
                                            color: selectedLevels.includes(level) ? "white" : "text.primary",
                                            borderColor: selectedLevels.includes(level) ? "#1976d2" : "#e0e0e0",
                                            '&:hover': {
                                                bgcolor: selectedLevels.includes(level) ? "#1565c0" : "#f5f5f5"
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Rating Filter */}
                        <Box sx={{ mb: 1 }}>
                            <Typography fontWeight="600" mb={1} fontSize="0.9rem">
                                Đánh giá
                            </Typography>
                            {[5, 4, 3].map((star) => (
                                <FormControlLabel
                                    key={star}
                                    control={<Checkbox size="small" />}
                                    label={
                                        <Box display="flex" alignItems="center">
                                            <Rating value={star} readOnly size="small" />
                                            <Typography variant="body2" ml={1} fontSize="0.8rem">
                                                từ {star} sao
                                            </Typography>
                                        </Box>
                                    }
                                />
                            ))}
                        </Box>

                    </Box>

                    {/* RIGHT CONTENT */}
                    <Box sx={{ flexGrow: 1, width: "100%" }}>
                        {/* Sort Bar */}
                        <Box
                            sx={{
                                bgcolor: "white",
                                p: 2,
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                                mb: 2,
                            }}
                        >
                            <Typography variant="body2" sx={{ mr: "auto", fontWeight: 600 }}>
                                Tìm thấy <span style={{ color: "#1976d2" }}>{totalResults}</span>{" "}
                                kết quả cho từ khóa "{searchQuery}"
                            </Typography>

                            <Box display="flex" alignItems="center">
                                <Typography variant="body2" color="text.secondary" mr={1}>
                                    Sắp xếp theo:
                                </Typography>
                                <SortOption label="Nổi bật" value="relevance" />
                                <Typography variant="caption" color="text.disabled">|</Typography>
                                <SortOption label="Bán chạy" value="bestseller" />
                                <Typography variant="caption" color="text.disabled">|</Typography>
                                <SortOption label="Giá thấp - cao" value="price_asc" />
                                <Typography variant="caption" color="text.disabled">|</Typography>
                                <SortOption label="Giá cao - thấp" value="price_desc" />
                            </Box>
                        </Box>

                        {/* Course Grid - CSS Grid Layout */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",              // 1 column on mobile
                                    sm: "repeat(2, 1fr)",   // 2 columns on tablet
                                    md: "repeat(3, 1fr)",   // 3 columns on small desktop
                                    lg: "repeat(4, 1fr)",   // 4 columns on large desktop
                                },
                                gap: 2
                            }}
                        >
                            {loading
                                ? Array.from({ length: 8 }).map((_, idx) => (
                                    <Box key={idx}>
                                        <Card sx={{ borderRadius: "8px", height: "100%" }}>
                                            <Skeleton variant="rectangular" height={160} />
                                            <CardContent>
                                                <Skeleton width="80%" />
                                                <Skeleton width="60%" />
                                            </CardContent>
                                        </Card>
                                    </Box>
                                ))
                                : courses.map((course) => (
                                    <Card
                                        key={course.courseId}
                                        sx={{
                                            height: "100%",
                                            borderRadius: "8px",
                                            display: "flex",
                                            flexDirection: "column",
                                            position: "relative",
                                            transition: "all 0.2s",
                                            border: "1px solid #e5e7eb",
                                            boxShadow: "none",
                                            cursor: "pointer",
                                            minWidth: 0,
                                            "&:hover": {
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                transform: "translateY(-2px)",
                                                borderColor: "transparent",
                                            },
                                        }}
                                        onClick={() => handleCourseClick(course.courseId)}
                                    >
                                        {/* Badge */}
                                        {course.discountPrice && course.discountPrice < course.price && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    left: -4,
                                                    bgcolor: '#d32f2f', // Standard discount red
                                                    color: 'white',
                                                    px: 1,
                                                    py: 0.2,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    borderRadius: '0 4px 4px 0',
                                                    boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                                                    zIndex: 1
                                                }}
                                            >
                                                Giảm {Math.round(((course.price - course.discountPrice) / course.price) * 100)}%
                                            </Box>
                                        )}

                                        {/* Wishlist Icon */}
                                        <IconButton
                                            size="small"
                                            sx={{ position: 'absolute', top: 5, right: 5, zIndex: 1, bgcolor: 'rgba(255,255,255,0.8)' }}
                                        >
                                            <FavoriteBorderIcon fontSize="small" />
                                        </IconButton>

                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={course.thumbnailUrl || "/images/course-placeholder.jpg"}
                                            alt={course.title}
                                            sx={{ p: 2, objectFit: "contain", bgcolor: "#f9f9f9" }}
                                        />

                                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                            {/* Name */}
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={600}
                                                title={course.title}
                                                sx={{
                                                    fontSize: "0.95rem",
                                                    lineHeight: 1.4,
                                                    height: "2.8em",
                                                    overflow: "hidden",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    mb: 1,
                                                    color: "#333"
                                                }}
                                            >
                                                {course.title}
                                            </Typography>

                                            {/* Price */}
                                            <Box sx={{ mb: 1 }}>
                                                {course.discountPrice ? (
                                                    <>
                                                        <Typography variant="h6" fontWeight={700} color="#1976d2" lineHeight={1.2}>
                                                            {formatPrice(course.discountPrice)}
                                                        </Typography>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#999' }}>
                                                                {formatPrice(course.price)}
                                                            </Typography>
                                                        </Box>
                                                    </>
                                                ) : (
                                                    <Typography variant="h6" fontWeight={700} color="#1976d2" lineHeight={1.2}>
                                                        {formatPrice(course.price)}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Specs/Info */}
                                            <Box
                                                sx={{
                                                    bgcolor: '#f3f4f6',
                                                    borderRadius: '4px',
                                                    p: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    mb: 1.5
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                                                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="caption">20h</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                                                    <PlayCircleOutlineIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="caption">120 bài</Typography>
                                                </Box>
                                            </Box>

                                            {/* Rating & Action */}
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Box display="flex" alignItems="center">
                                                    <Rating value={course.averageRating || 4.5} readOnly size="small" sx={{ fontSize: "0.9rem" }} />
                                                    <Typography variant="caption" color="text.secondary" ml={0.5}>
                                                        ({course.totalReviews || 10})
                                                    </Typography>
                                                </Box>
                                            </Box>

                                        </CardContent>
                                    </Card>
                                ))}
                        </Box>

                        {/* Pagination or Show More (Mock) */}
                        {courses.length > 0 && (
                            <Box textAlign="center" mt={4}>
                                <Button variant="outlined" sx={{ borderRadius: "20px", textTransform: 'none', px: 4 }}>
                                    Xem thêm {totalResults > courses.length ? totalResults - courses.length : 0} kết quả
                                </Button>
                            </Box>
                        )}

                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default SearchResultsPage;
