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

const mockData: CourseDetail = {
  id: 0,
  slug: "sample-course",
  title: "Thành Thạo Docker Từ Cơ Bản Đến Nâng Cao",
  subtitle:
    "Thành thạo Docker trong thực tế: Xây dựng, quản lý và triển khai ứng dụng nhanh chóng và hiệu quả.",
  badges: ["Xếp hạng cao nhất", "Thịnh hành & mới"],
  categoryPath: ["CNTT & Phần mềm", "CNTT & Phần mềm khác", "Docker"],
  rating: 5.0,
  students: 1655,
  lastUpdated: "10/2025",
  language: "Tiếng Việt",
  captions: ["Tiếng Việt"],
  whatYouWillLearn: [
    "Hiểu rõ khái niệm Docker và sự khác biệt giữa Container và Virtual Machine",
    "Nắm vững kiến thức Docker: Docker CLI, Docker Host, Docker Registry và các khái niệm cốt lõi",
    "Quản lý Docker Image: pull từ Docker Hub, inspect, tagging và build image với Dockerfile",
    "Cài đặt Docker trên Windows (WSL, Docker Desktop) và Ubuntu, cấu hình môi trường làm việc",
    "Thành thạo thao tác với Container: tạo, chạy, dừng, xoá, logs, port mapping, exec command",
    "Hiểu layered architecture và multi-stage build để tối ưu image trong dự án thực tế",
    "Quản lý dữ liệu với Docker Storage: volumes, bind mount, tmpfs mount",
    "Làm chủ Docker Networking: bridge, host và none network",
  ],
  sections: [
    {
      id: 1,
      title: "Giới thiệu",
      lectures: [
        { id: "11", title: "Chào mừng", duration: "5:12", previewable: true },
        {
          id: "12",
          title: "Tại sao học Docker",
          duration: "8:30",
          previewable: false,
        },
      ],
    },
    {
      id: 2,
      title: "Cài đặt và thiết lập",
      lectures: [
        {
          id: "21",
          title: "Cài Docker trên Windows",
          duration: "12:45",
          previewable: false,
        },
        {
          id: "22",
          title: "Cài Docker trên Ubuntu",
          duration: "10:20",
          previewable: false,
        },
      ],
    },
    {
      id: 3,
      title: "Docker cơ bản",
      lectures: [
        {
          id: "31",
          title: "Làm việc với Container",
          duration: "15:30",
          previewable: false,
        },
        {
          id: "32",
          title: "Quản lý Images",
          duration: "18:45",
          previewable: false,
        },
      ],
    },
  ],
  requirements: ["Kiến thức JS cơ bản", "Đã cài Node.js >= 18"],
  descriptionHtml: "<p>Khoá học tập trung vào thực hành và best practices.</p>",
  instructor: {
    name: "AI Coding",
    title: "Senior Engineer",
    avatarUrl: "/public/user/user-01.jpg",
  },
  previewUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  price: 779000,
  oldPrice: 2499000,
  discountPercentage: 64,
  promotionEndDate: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(), // 9 hours from now
  isPurchasable: true,
  reviewsSummary: {
    average: 5.0,
    count: 121,
    distribution: [100, 15, 4, 1, 1],
  },
  reviews: [
    {
      id: "rv1",
      user: "An Nguyen",
      rating: 5,
      date: "1 ngày trước",
      comment: "Khoá học rất hữu ích!",
    },
    {
      id: "rv2",
      user: "Binh Tran",
      rating: 4,
      date: "3 ngày trước",
      comment: "Giải thích rõ ràng.",
    },
  ],
  related: [
    {
      id: "r1",
      slug: "kubernetes-basics",
      title: "Kubernetes từ cơ bản",
      rating: 4.6,
      price: 799000,
      image: "/public/cards/card-01.jpg",
    },
    {
      id: "r2",
      slug: "devops-complete",
      title: "DevOps hoàn chỉnh",
      rating: 4.8,
      price: 1299000,
      image: "/public/cards/card-02.jpg",
    },
  ],
};

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

      console.log("Fetching course with slug:", slug);
      setLoading(true);
      setError(null);

      try {
        const course = await courseService.getCourseBySlug(slug);
        console.log("Course data received:", course);

        // Fetch sections with lessons
        let sections = mockData.sections; // Default to mock
        try {
          const sectionsData = await sectionService.getSectionsByCourse(course.courseId);
          console.log("Sections data received:", sectionsData);

          // Map sections to CourseDetail format
          sections = sectionsData.map(section => ({
            id: section.sectionId,
            title: section.title,
            lectures: [], // TODO: Fetch lessons for each section when API is available
          }));
        } catch (sectionError) {
          console.warn("Failed to fetch sections, using mock data:", sectionError);
        }

        // Map API response to CourseDetail
        const hasDiscount =
          course.discountPrice !== undefined && course.discountPrice !== null;

        const mappedData: CourseDetail = {
          id: course.courseId,
          slug: course.slug,
          title: course.title,
          subtitle: course.shortDescription,
          badges: course.tags || [],
          categoryPath: [], // API doesn't return this yet
          rating: course.averageRating || 0,
          students: course.totalStudents || 0,
          lastUpdated: course.publishedAt
            ? new Date(course.publishedAt).toLocaleDateString()
            : "",
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
            avatarUrl: "/public/user/user-01.jpg", // Placeholder
          },
          previewUrl: course.previewVideoUrl,
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
          reviews: mockData.reviews, // Use mock reviews for now
          related: mockData.related, // Use mock related for now
        };
        console.log("Mapped data:", mappedData);
        setData(mappedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch course", error);
        setError(error instanceof Error ? error.message : "Failed to load course");
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  if (loading) return <Container maxWidth="xl" sx={{ py: 4 }}>Đang tải khóa học...</Container>;
  if (error) return <Container maxWidth="xl" sx={{ py: 4 }}>Lỗi: {error}</Container>;
  if (!data) return <Container maxWidth="xl" sx={{ py: 4 }}>Không tìm thấy khóa học</Container>;

  return (
    <>
      {/* Hero Section với background đen */}
      <Box sx={{ bgcolor: "#1c1d1f", color: "#fff", position: "relative" }}>
        <Container maxWidth="xl" sx={{ position: "relative" }}>
          {/* Course Info - chiếm 60% chiều rộng */}
          <Box sx={{ maxWidth: { xs: "100%", md: "60%" }, pr: { md: 4 } }}>
            <CourseHero
              data={{
                title: data.title,
                description: data.subtitle,
                rating: data.rating,
                reviewCount: data.reviewsSummary?.count || 121,
                studentCount: data.students,
                lastUpdated: data.lastUpdated,
                language: data.language,
                instructor: data.instructor,
                categories: data.categoryPath,
                price: data.price,
                originalPrice: data.oldPrice,
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
              promotionEndDate={data.promotionEndDate}
              discountPercentage={data.discountPercentage}
            />
          </Box>
        </Container>
      </Box>

      {/* Main Content - không có margin âm */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
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

      {/* Mobile PurchaseSidebar */}
      <Box sx={{ display: { xs: "block", md: "none" }, p: 2 }}>
        <PurchaseSidebar
          courseId={data.id}
          price={data.price}
          oldPrice={data.oldPrice}
          ctaDisabled={!data.isPurchasable}
          isPurchased={data.isPurchased}
          purchasedAt={data.purchasedAt}
          promotionEndDate={data.promotionEndDate}
          discountPercentage={data.discountPercentage}
        />
      </Box>
    </>
  );
};

export default CourseDetailPage;
