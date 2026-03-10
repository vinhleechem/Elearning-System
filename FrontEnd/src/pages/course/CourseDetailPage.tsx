import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { courseService } from "../../service/courseService";
import { sectionService } from "../../service/sectionService";
import { reviewService } from "../../service/reviewService";
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
        // If the param is a pure number, treat it as a courseId (legacy link fallback)
        const isNumericId = /^\d+$/.test(slug);
        const course = isNumericId
          ? await courseService.getCourseById(Number(slug))
          : await courseService.getCourseBySlug(slug);

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
            image: c.thumbnailUrl || "",
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
            ? course.whatYouLearn.split("\n").map(s => s.trim()).filter(Boolean)
            : [],
          sections: sections,
          requirements: course.requirements
            ? course.requirements.split("\n").map(s => s.trim()).filter(Boolean)
            : [],
          descriptionHtml: course.description,
          instructor: {
            name: course.instructorName || "Unknown Instructor",
            title: "Instructor",
            avatarUrl: undefined,
            stats: {
              rating: course.averageRating || 0,
              reviews: course.totalReviews || 0,
              students: course.totalStudents || 0,
              courses: 1
            }
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
          reviews: [],  // will be filled below
          related,
        };

        // Fetch real reviews for this course
        try {
          const reviewsData = await reviewService.getReviewsByCourse(course.courseId, 0, 100);
          const fetchedReviews = reviewsData.data || [];

          mappedData.reviews = fetchedReviews.map((r) => ({
            id: r.reviewId,
            user: r.userName,
            rating: r.rating,
            comment: r.comment || "",
            date: formatDate(r.createdAt),
          }));

          // Compute distribution: index 0 = 5 stars, index 4 = 1 star
          const dist = [0, 0, 0, 0, 0];
          fetchedReviews.forEach((r) => {
            const star = Math.round(r.rating);
            if (star >= 1 && star <= 5) {
              dist[5 - star] += 1;
            }
          });
          mappedData.reviewsSummary.distribution = dist;
        } catch (reviewErr) {
          console.warn("Failed to fetch reviews", reviewErr);
        }
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
      <div className="max-w-7xl mx-auto px-4 py-12 text-slate-500">
        Đang tải khóa học...
      </div>
    );
  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-slate-500">
        Lỗi: {error}
      </div>
    );
  if (!data)
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-slate-500">
        Không tìm thấy khóa học
      </div>
    );

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content: Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
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
                  avatar: data.instructor?.avatarUrl || "",
                },
                categories: data.categoryPath || [],
                badges: data.badges || [],
                price: data.price || 0,
                originalPrice: data.oldPrice || 0,
              }}
            />

            {/* What you'll learn */}
            <WhatYouWillLearn items={data.whatYouWillLearn} />

            {/* Course Content / Curriculum */}
            <Curriculum sections={data.sections} />

            {/* Requirements */}
            <CourseRequirements requirements={data.requirements || []} />

            {/* Description */}
            <Description html={data.descriptionHtml} />

            {/* Instructor Profile */}
            <Instructor instructor={data.instructor} />

            {/* Reviews Section */}
            <section className="mt-16 pt-16 border-t border-slate-200 dark:border-slate-800">
              <StudentFeedback
                summary={data.reviewsSummary}
                isPurchased={data.isPurchased}
                courseId={data.id}
                onReviewSuccess={() => window.location.reload()}
              />
              <Reviews items={data.reviews} />
              {data.reviews && data.reviews.length > 0 && (
                <div className="mt-8 text-center">
                  <button className="px-6 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-white">
                    Xem thêm đánh giá
                  </button>
                </div>
              )}
            </section>

            {/* Related Courses */}
            <RelatedCourses courses={data.related} />
          </div>

          {/* Right Content: Sticky Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
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
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CourseDetailPage;
