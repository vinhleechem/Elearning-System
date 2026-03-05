import { Container, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { sectionService } from "../../service/sectionService";
import CourseHero from "../../components/courseDetail/CourseHero";
import WhatYouWillLearn from "../../components/courseDetail/WhatYouWillLearn";
import Curriculum from "../../components/courseDetail/Curriculum";
import Description from "../../components/courseDetail/Description";
import Instructor from "../../components/courseDetail/Instructor";
import StudentFeedback from "../../components/courseDetail/StudentFeedback";
import Reviews from "../../components/courseDetail/Reviews";
import RelatedCourses from "../../components/courseDetail/RelatedCourses";
import PurchaseSidebar from "../../components/courseDetail/PurchaseSidebar";
import CourseRequirements from "../../components/courseDetail/CourseRequirements";
import type { CourseDetail } from "../../types/courseDetail";
import { formatDate } from "../../libs/dateUtils";

const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) {
        setError("No slug provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const course = await courseService.getCourseBySlug(slug);

        // Fetch sections with lessons
        let sections: CourseDetail["sections"] = [];
        try {
          const sectionsData = await sectionService.getSectionsByCourse(
            course.courseId,
          );

          // Map sections to CourseDetail format
          sections = sectionsData.map((section) => ({
            id: section.sectionId,
            title: section.title,
            lectures: [], // TODO: Fetch lessons for each section when API is available
          }));
        } catch (sectionError) {
          console.warn("Failed to fetch sections", sectionError);
        }

        // Fetch related courses (backend algorithm: same category/level)
        let related: CourseDetail["related"] = [];
        try {
          const relatedApi = await courseService.getRelatedCourses(
            course.courseId,
          );
          related = relatedApi.map((c) => ({
            id: String(c.courseId),
            slug: c.slug,
            title: c.title,
            image: c.thumbnailUrl || "/images/courses/default-course.jpg",
            price: c.price ?? 0,
            rating: c.averageRating ?? 0,
          }));
        } catch (relatedError) {
          console.warn("Failed to fetch related courses", relatedError);
        }

        // Map API response to CourseDetail
        const hasDiscount =
          course.discountPrice !== undefined && course.discountPrice !== null;

        const mappedData: CourseDetail = {
          id: course.courseId,
          slug: course.slug,
          title: course.title,
          subtitle: course.shortDescription,
          badges: [],
          categoryPath: course.categoryName ? [course.categoryName] : [],
          rating: course.averageRating || 0,
          students: course.totalStudents || 0,
          lastUpdated: course.publishedAt ? formatDate(course.publishedAt) : "",
          language: course.language || "Tiếng Việt",
          captions: [],
          whatYouWillLearn: course.whatYouLearn
            ? course.whatYouLearn.split("\n")
            : [],
          sections: sections,
          requirements: course.requirements
            ? course.requirements.split("\n")
            : [],
          descriptionHtml: course.description,
          instructor: {
            name: course.instructorName || "Unknown Instructor",
            title: "Instructor",
            avatarUrl: undefined,
          },
          previewUrl: course.previewVideoUrl,
          thumbnailUrl: course.thumbnailUrl,
          price: hasDiscount ? course.discountPrice! : course.price || 0,
          oldPrice: hasDiscount ? course.price : null,
          isPurchasable: course.status === "PUBLISHED",
          isPurchased: course.isPurchased,
          purchasedAt: course.purchasedAt,
          // Promotion info
          promotionName: course.promotionName,
          promotionType: course.promotionType,
          discountPercentage: course.discountPercentage,
          promotionEndDate: course.promotionEndDate,
          reviewsSummary: {
            average: course.averageRating || 0,
            count: course.totalReviews || 0,
            distribution: [0, 0, 0, 0, 0],
          },
          // TODO: map real reviews khi backend hỗ trợ
          reviews: [],
          related,
        };
        setData(mappedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch course", error);
        setError(
          error instanceof Error ? error.message : "Failed to load course",
        );
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  if (loading)
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        Đang tải khóa học...
      </Container>
    );
  if (error)
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        Lỗi: {error}
      </Container>
    );
  if (!data)
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        Không tìm thấy khóa học
      </Container>
    );

  return (
    <>
      {/* Hero Section với gradient background */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "#fff",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          {/* Course Info - chiếm 60% chiều rộng */}
          <Box sx={{ maxWidth: { xs: "100%", md: "60%" }, pr: { md: 4 } }}>
            <CourseHero
              data={{
                title: data.title || "",
                description: data.subtitle || "",
                rating: data.rating || 0,
                reviewCount: data.reviewsSummary?.count || 0,
                studentCount: data.students || 0,
                lastUpdated: data.lastUpdated || new Date().toISOString(),
                language: data.language || "English",
                instructor: {
                  name: data.instructor?.name || "Unknown Instructor",
                  avatar: data.instructor?.avatarUrl || "/default-avatar.png",
                },
                categories: data.categoryPath || [],
                badges: data.badges || [],
                price: data.price || 0,
                originalPrice: data.oldPrice || 0,
              }}
            />
          </Box>

          {/* PurchaseSidebar - absolute positioned ở góc phải */}
          <Box
            sx={{
              position: "absolute",
              top: 32,
              right: { xs: 16, md: 32 },
              width: { xs: 340, md: 340 },
              display: { xs: "none", md: "block" },
              zIndex: 10,
            }}
          >
            <PurchaseSidebar
              courseId={data.id}
              price={data.price}
              oldPrice={data.oldPrice}
              ctaDisabled={!data.isPurchasable}
              isPurchased={data.isPurchased}
              purchasedAt={data.purchasedAt}
              thumbnailUrl={data.thumbnailUrl}
              promotionEndDate={data.promotionEndDate}
              discountPercentage={data.discountPercentage}
            />
          </Box>
        </Container>
      </Box>

      {/* Main Content với gradient background */}
      <Box
        sx={{
          background: "linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Box sx={{ maxWidth: { xs: "100%", md: "60%" } }}>
            <WhatYouWillLearn items={data.whatYouWillLearn} />
            <Curriculum sections={data.sections} />
            <CourseRequirements requirements={data.requirements || []} />
            <Description html={data.descriptionHtml} />
            <Instructor instructor={data.instructor} />
            <StudentFeedback summary={data.reviewsSummary} />
            <Reviews items={data.reviews} />
            <RelatedCourses courses={data.related} />
          </Box>
        </Container>
      </Box>

      {/* Mobile PurchaseSidebar */}
      <Box sx={{ display: { xs: "block", md: "none" }, p: 2 }}>
        <PurchaseSidebar
          courseId={data.id}
          price={data.price}
          oldPrice={data.oldPrice}
          ctaDisabled={!data.isPurchasable}
          isPurchased={data.isPurchased}
          purchasedAt={data.purchasedAt}
          thumbnailUrl={data.thumbnailUrl}
          promotionEndDate={data.promotionEndDate}
          discountPercentage={data.discountPercentage}
        />
      </Box>
    </>
  );
};

export default CourseDetailPage;
