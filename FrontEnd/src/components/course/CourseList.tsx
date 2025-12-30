import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import Course from "./Course";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import {
  courseService,
  type PublicCourseResponse,
} from "../../service/courseService";
import { useAuthStore } from "../../store/authStore";
import { httpClient } from "../../service/httpClient";

const CourseList = () => {
  const [courses, setCourses] = useState<PublicCourseResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const [purchasedIds, setPurchasedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;
      try {
        const res = await httpClient<{ courseId: number }[]>("/enrollments");
        if (res.data) {
          setPurchasedIds(new Set(res.data.map((item) => item.courseId)));
        }
      } catch (error) {
        console.error("Failed to fetch enrollments for status check", error);
      }
    };
    void fetchEnrollments();
  }, [user]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await courseService.getPublicCourses({ page: 0, size: 8 });
        setCourses(res.data || []);
      } catch (err) {
        setError("Không thể tải danh sách khóa học");
        console.error("Fetch public courses failed:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchCourses();
  }, []);

  const mappedCourses = useMemo(() => {
    return courses.map((c) => {
      const hasDiscount =
        c.discountPrice !== undefined && c.discountPrice !== null;
      const price = hasDiscount ? c.discountPrice! : (c.price ?? 0);
      const oldPrice = hasDiscount ? (c.price ?? undefined) : undefined;

      // Calculate discount percentage if not provided by backend
      const discountPercentage =
        c.discountPercentage ??
        (hasDiscount && c.price && c.price > 0
          ? Math.round(((c.price - c.discountPrice!) / c.price) * 100)
          : undefined);

      // Convert minutes to hours if available
      const totalHours =
        c.totalDurationMinutes && c.totalDurationMinutes > 0
          ? `${(c.totalDurationMinutes / 60).toFixed(1)} giờ`
          : undefined;

      return {
        id: c.courseId,
        title: c.title,
        teacher: c.instructorName || "Giảng viên",
        rating: c.averageRating ?? 0,
        reviews: c.totalReviews ?? 0,
        price,
        oldPrice,
        image: c.thumbnailUrl,
        tag: c.status === "PUBLISHED" ? "Mới nhất" : undefined,
        description: c.shortDescription,
        totalHours,
        level: c.level,
        updatedAt: c.publishedAt ?? undefined,
        slug: c.slug,
        learningPoints: c.whatYouLearn ? c.whatYouLearn.split("\n") : undefined,
        isPurchased: purchasedIds.has(c.courseId),
        // Promotion info from backend
        promotionName: c.promotionName,
        promotionType: c.promotionType,
        discountPercentage,
        promotionEndDate: c.promotionEndDate,
      };
    });
  }, [courses, purchasedIds]);

  return (
    <div>
      <h1 className="text-3xl font-semibold">Các khóa học thịnh hành</h1>

      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 3 }}>
          <CircularProgress size={24} />
          <Typography color="text.secondary">Đang tải khóa học...</Typography>
        </Box>
      )}

      {error && !loading && (
        <Typography color="error" sx={{ py: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && mappedCourses.length > 0 && (
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={4}
          style={{
            padding: "20px 0",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {mappedCourses.map((course) => (
            <SwiperSlide key={course.id} style={{ overflow: "visible" }}>
              <div style={{ height: "100%" }}>
                <Course
                  id={course.id}
                  title={course.title}
                  teacher={course.teacher}
                  rating={course.rating}
                  reviews={course.reviews}
                  price={course.price}
                  oldPrice={course.oldPrice}
                  image={course.image}
                  tag={course.tag}
                  description={course.description}
                  totalHours={course.totalHours}
                  level={course.level}
                  updatedAt={course.updatedAt}
                  slug={course.slug}
                  learningPoints={course.learningPoints}
                  isPurchased={course.isPurchased}
                  promotionName={course.promotionName}
                  promotionType={course.promotionType}
                  discountPercentage={course.discountPercentage}
                  promotionEndDate={course.promotionEndDate}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {!loading && !error && mappedCourses.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          Chưa có khóa học nào.
        </Typography>
      )}
    </div>
  );
};

export default CourseList;
