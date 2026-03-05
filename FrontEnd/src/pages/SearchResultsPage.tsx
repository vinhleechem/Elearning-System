import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
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
  CircularProgress,
} from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useCart, useWishlist } from "../hooks";
import { formatCurrency } from "../libs/utils";
import { courseService } from "../service/courseService";
import { categoryService } from "../service/categoryService";
import type { CategoryTreeResponse } from "../service/categoryService";
import { COLORS, PRICE_RANGE, LEVEL_MAP, GRID_CONFIGS } from "../constants";
import type { PublicCourseResponse } from "../service/courseService";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search") || "";
  const subcategoryName = searchParams.get("subcategory") || "";

  const [courses, setCourses] = useState<PublicCourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const hasLoadedRef = useRef(false);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [resolvedCategoryId, setResolvedCategoryId] = useState<number | null>(
    null,
  );

  // Resolve subcategory name -> categoryId
  useEffect(() => {
    if (!subcategoryName) {
      setResolvedCategoryId(null);
      return;
    }
    const flattenTree = (
      nodes: CategoryTreeResponse[],
    ): CategoryTreeResponse[] => {
      const result: CategoryTreeResponse[] = [];
      const walk = (list: CategoryTreeResponse[]) => {
        list.forEach((n) => {
          result.push(n);
          if (n.children?.length) walk(n.children);
        });
      };
      walk(nodes);
      return result;
    };
    categoryService
      .getCategoryTree()
      .then((tree) => {
        const all = flattenTree(tree);
        const found = all.find(
          (c) => c.name.toLowerCase() === subcategoryName.toLowerCase(),
        );
        setResolvedCategoryId(found?.id ?? null);
      })
      .catch(() => setResolvedCategoryId(null));
  }, [subcategoryName]);

  // Filters
  const [priceRange, setPriceRange] = useState<number[]>(PRICE_RANGE.DEFAULT);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  const fetchSearchResults = useCallback(async () => {
    // When a subcategory is needed but not yet resolved, wait
    if (subcategoryName && resolvedCategoryId === null) return;
    if (!hasLoadedRef.current) {
      setLoading(true);
    } else {
      setFetching(true);
    }
    try {
      // Build filter params
      const params: any = {
        page: 0,
        size: 20,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (resolvedCategoryId) {
        params.categoryId = resolvedCategoryId;
      }

      // Price range filter
      if (priceRange[0] > PRICE_RANGE.MIN) {
        params.minPrice = priceRange[0];
      }
      if (priceRange[1] < PRICE_RANGE.MAX) {
        params.maxPrice = priceRange[1];
      }

      // Level filter
      if (selectedLevels.length > 0 && !selectedLevels.includes("Tất cả")) {
        const mappedLevel = LEVEL_MAP[selectedLevels[0]];
        if (mappedLevel) {
          params.level = mappedLevel;
        }
      }

      // Rating filter (get minimum rating from selected ratings)
      if (selectedRatings.length > 0) {
        params.minRating = Math.min(...selectedRatings);
      }

      const result = await courseService.getPublicCourses(params);
      setCourses(result.data || []);
      setTotalResults(result.pagination?.totalElements || 0);
      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [
    searchQuery,
    subcategoryName,
    resolvedCategoryId,
    sortBy,
    priceRange,
    selectedLevels,
    selectedRatings,
  ]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  const SortOption = ({ label, value }: { label: string; value: string }) => (
    <Typography
      variant="body2"
      onClick={() => setSortBy(value)}
      sx={{
        cursor: "pointer",
        fontWeight: sortBy === value ? 700 : 400,
        color: sortBy === value ? COLORS.primary.main : "text.primary",
        mx: 1.5,
        "&:hover": { color: COLORS.primary.main },
      }}
    >
      {label}
    </Typography>
  );

  return (
    <Box sx={{ bgcolor: COLORS.background.gray, minHeight: "100vh", py: 2 }}>
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
              boxShadow: COLORS.shadow.light,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <FilterListIcon sx={{ mr: 1, color: COLORS.primary.main }} />
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
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={priceRange[0] === 0 && priceRange[1] === 500000}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPriceRange([PRICE_RANGE.MIN, 500000]);
                        } else {
                          setPriceRange(PRICE_RANGE.DEFAULT);
                        }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontSize="0.875rem">
                      Dưới 500k
                    </Typography>
                  }
                  sx={{ mb: 0.5 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={
                        priceRange[0] === 500000 && priceRange[1] === 1000000
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPriceRange([500000, 1000000]);
                        } else {
                          setPriceRange([0, 5000000]);
                        }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontSize="0.875rem">
                      Từ 500k - 1 triệu
                    </Typography>
                  }
                  sx={{ mb: 0.5 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={
                        priceRange[0] === 1000000 && priceRange[1] === 5000000
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPriceRange([1000000, 5000000]);
                        } else {
                          setPriceRange([0, 5000000]);
                        }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontSize="0.875rem">
                      Trên 1 triệu
                    </Typography>
                  }
                  sx={{ mb: 0.5 }}
                />
              </FormGroup>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Hoặc nhập khoảng giá:
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, val) => setPriceRange(val as number[])}
                  valueLabelDisplay="auto"
                  min={PRICE_RANGE.MIN}
                  max={PRICE_RANGE.MAX}
                  sx={{ color: COLORS.primary.main, mt: 1 }}
                />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <TextField
                    size="small"
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || PRICE_RANGE.MIN;
                      setPriceRange([
                        Math.max(PRICE_RANGE.MIN, val),
                        priceRange[1],
                      ]);
                    }}
                    inputProps={{
                      style: { fontSize: 12, padding: 4 },
                      min: PRICE_RANGE.MIN,
                      max: priceRange[1],
                    }}
                    sx={{ width: 80 }}
                  />
                  <Typography>-</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 5000000;
                      setPriceRange([priceRange[0], Math.min(5000000, val)]);
                    }}
                    inputProps={{
                      style: { fontSize: 12, padding: 4 },
                      min: priceRange[0],
                      max: 5000000,
                    }}
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
                {["Sơ cấp", "Trung cấp", "Chuyên gia", "Tất cả"].map(
                  (level) => (
                    <Chip
                      key={level}
                      label={level}
                      variant={
                        selectedLevels.includes(level) ? "filled" : "outlined"
                      }
                      onClick={() => {
                        if (selectedLevels.includes(level)) {
                          setSelectedLevels(
                            selectedLevels.filter((l) => l !== level),
                          );
                        } else {
                          setSelectedLevels([...selectedLevels, level]);
                        }
                      }}
                      sx={{
                        borderRadius: "4px",
                        height: "28px",
                        bgcolor: selectedLevels.includes(level)
                          ? COLORS.primary.main
                          : "transparent",
                        color: selectedLevels.includes(level)
                          ? "white"
                          : "text.primary",
                        borderColor: selectedLevels.includes(level)
                          ? COLORS.primary.main
                          : COLORS.border.default,
                        "&:hover": {
                          bgcolor: selectedLevels.includes(level)
                            ? COLORS.primary.dark
                            : COLORS.background.gray,
                        },
                      }}
                    />
                  ),
                )}
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
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedRatings.includes(star)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRatings([...selectedRatings, star]);
                        } else {
                          setSelectedRatings(
                            selectedRatings.filter((r) => r !== star),
                          );
                        }
                      }}
                    />
                  }
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
                Tìm thấy{" "}
                <span style={{ color: "#1976d2" }}>{totalResults}</span> khóa
                học
                {subcategoryName ? (
                  <>
                    {" "}
                    trong danh mục "<strong>{subcategoryName}</strong>"
                    {!resolvedCategoryId && " (không tìm thấy danh mục)"}
                  </>
                ) : searchQuery ? (
                  <>
                    {" "}
                    cho từ khóa "<strong>{searchQuery}</strong>"
                  </>
                ) : (
                  ""
                )}
              </Typography>

              {fetching && (
                <CircularProgress
                  size={16}
                  thickness={5}
                  sx={{ mx: 1.5, color: "#1976d2" }}
                />
              )}

              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="text.secondary" mr={1}>
                  Sắp xếp theo:
                </Typography>
                <SortOption label="Nổi bật" value="relevance" />
                <Typography variant="caption" color="text.disabled">
                  |
                </Typography>
                <SortOption label="Bán chạy" value="bestseller" />
                <Typography variant="caption" color="text.disabled">
                  |
                </Typography>
                <SortOption label="Giá thấp - cao" value="price_asc" />
                <Typography variant="caption" color="text.disabled">
                  |
                </Typography>
                <SortOption label="Giá cao - thấp" value="price_desc" />
              </Box>
            </Box>

            {/* Course Grid - CSS Grid Layout */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: GRID_CONFIGS.courseGrid,
                gap: 2,
                opacity: fetching ? 0.6 : 1,
                transition: "opacity 0.2s ease",
                pointerEvents: fetching ? "none" : "auto",
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
                      onClick={() => navigate(`/course/${course.slug}`)}
                    >
                      {/* Badge */}
                      {course.discountPrice &&
                        course.price &&
                        course.discountPrice < course.price && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 10,
                              left: -4,
                              bgcolor: "#d32f2f", // Standard discount red
                              color: "white",
                              px: 1,
                              py: 0.2,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              borderRadius: "0 4px 4px 0",
                              boxShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                              zIndex: 1,
                            }}
                          >
                            Giảm{" "}
                            {Math.round(
                              ((course.price - course.discountPrice) /
                                course.price) *
                                100,
                            )}
                            %
                          </Box>
                        )}

                      {/* Wishlist Icon */}
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          zIndex: 2,
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(course.courseId);
                        }}
                      >
                        {isInWishlist(course.courseId) ? (
                          <FavoriteIcon
                            fontSize="small"
                            sx={{ color: "#e91e63" }}
                          />
                        ) : (
                          <FavoriteBorderIcon fontSize="small" />
                        )}
                      </IconButton>

                      <Box
                        sx={{
                          position: "relative",
                          paddingTop: "56.25%",
                          bgcolor: "#f0f0f0",
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={
                            course.thumbnailUrl ||
                            "/images/course-placeholder.jpg"
                          }
                          alt={course.title}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>

                      <CardContent
                        sx={{
                          flexGrow: 1,
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {/* Title */}
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          title={course.title}
                          sx={{
                            fontSize: "1rem",
                            lineHeight: 1.4,
                            height: "2.8em",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            color: "#2d2f31",
                          }}
                        >
                          {course.title}
                        </Typography>

                        {/* Short Description */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: "0.85rem",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2, // Allow 2 lines for better info
                            WebkitBoxOrient: "vertical",
                            minHeight: "2.5em",
                          }}
                        >
                          {course.shortDescription ||
                            (course.description
                              ? course.description.substring(0, 100) + "..."
                              : "Mô tả khóa học đang cập nhật")}
                        </Typography>

                        {/* Author */}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.8rem", fontWeight: 500 }}
                        >
                          {course.instructorName || "Giảng viên Vidi"}
                        </Typography>

                        {/* Info Tags */}
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            alignItems: "center",
                          }}
                        >
                          {/* Rating */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Typography
                              fontWeight={700}
                              color="#b4690e"
                              fontSize="0.85rem"
                            >
                              {course.averageRating?.toFixed(1) || 4.5}
                            </Typography>
                            <Rating
                              value={course.averageRating || 4.5}
                              readOnly
                              size="small"
                              sx={{ fontSize: "0.9rem" }}
                            />
                          </Box>

                          {/* Reviews Count */}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.8rem" }}
                          >
                            ({course.totalReviews?.toLocaleString() || 10})
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Tổng số{" "}
                            {course.duration
                              ? Math.round(course.duration / 3600)
                              : 20}{" "}
                            giờ
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            •
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {course.totalLectures || 50} bài giảng
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            •
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {course.level || "Tất cả trình độ"}
                          </Typography>
                        </Box>

                        {/* Footer: Price & Add Cart */}
                        <Box
                          sx={{
                            mt: "auto",
                            pt: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              color="#2d2f31"
                              sx={{ fontSize: "1rem", whiteSpace: "nowrap" }}
                            >
                              {formatCurrency(
                                course.discountPrice || course.price || 0,
                              )}
                            </Typography>
                            {course.discountPrice &&
                              course.discountPrice < (course.price || 0) && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    textDecoration: "line-through",
                                    color: "#6a6f73",
                                  }}
                                >
                                  {formatCurrency(course.price || 0)}
                                </Typography>
                              )}
                          </Box>

                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              borderColor: "#a435f0",
                              color: "#2d2f31",
                              "&:hover": {
                                borderColor: "#3e4143",
                                bgcolor: "#e5e7eb",
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(course.courseId);
                            }}
                          >
                            Thêm giỏ hàng
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
            </Box>

            {/* Pagination or Show More (Mock) */}
            {courses.length > 0 && (
              <Box textAlign="center" mt={4}>
                <Button
                  variant="outlined"
                  sx={{ borderRadius: "20px", textTransform: "none", px: 4 }}
                >
                  Xem thêm{" "}
                  {totalResults > courses.length
                    ? totalResults - courses.length
                    : 0}{" "}
                  kết quả
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
