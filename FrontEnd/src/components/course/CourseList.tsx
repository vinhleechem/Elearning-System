import Course from "./Course";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

const CourseList = () => {
  const courses = [
    {
      id: 1,
      title: "Java Spring RESTful APIs - Xây Dựng Backend với Spring Boot",
      teacher: "Hỏi Dân IT với Eric",
      rating: 4.8,
      reviews: 143,
      price: 1799000,
      oldPrice: null,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Bán chạy nhất",
      description:
        "Khóa học Java Spring Boot từ cơ bản đến nâng cao, xây dựng RESTful APIs chuyên nghiệp.",
      totalHours: "25,5 giờ",
      level: "Tất cả các cấp độ",
      updatedAt: "tháng 10 năm 2025",
      learningPoints: [
        "Hiểu rõ khái niệm Docker và sự khác biệt giữa Container và Virtual Machine",
        "Cài đặt Docker trên Windows (WSL, Docker Desktop) và Ubuntu",
        "Nắm vững kiến trúc Docker: Docker CLI, Docker Host, Docker Registry",
        "Thực hành với Docker images, containers, volumes và networks",
      ],
    },
    {
      id: 2,
      title: "Thành Thạo ChatGPT trong Công Việc Mua Hàng",
      teacher: "Zenson Tran",
      rating: 5.0,
      reviews: 13,
      price: 279000,
      oldPrice: 659000,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Hot",
      description:
        "Ứng dụng ChatGPT vào công việc mua hàng, tối ưu hóa quy trình và nâng cao hiệu quả.",
      totalHours: "8 giờ",
      level: "Cấp độ cơ bản",
      updatedAt: "tháng 9 năm 2025",
      learningPoints: [
        "Sử dụng ChatGPT để tìm kiếm nhà cung cấp",
        "Đàm phán giá cả với AI",
        "Tạo báo cáo mua hàng tự động",
        "Phân tích dữ liệu nhà cung cấp",
      ],
    },
    {
      id: 3,
      title: "Thành Thạo Docker Từ Cơ Bản Đến Nâng Cao",
      teacher: "AI Coding",
      rating: 5.0,
      reviews: 103,
      price: 779000,
      oldPrice: null,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Thịnh hành & mới",
      description:
        "Thành thạo Docker trong thực tế: Xây dựng, quản lý và triển khai ứng dụng nhanh chóng và hiệu quả.",
      totalHours: "9,5 giờ",
      level: "Tất cả các cấp độ",
      updatedAt: "tháng 10 năm 2025",
      learningPoints: [
        "Hiểu rõ khái niệm Docker và sự khác biệt giữa Container và Virtual Machine",
        "Cài đặt Docker trên Windows (WSL, Docker Desktop) và Ubuntu, cấu hình môi trường làm việc",
        "Nắm vững kiến trúc Docker: Docker CLI, Docker Host, Docker Registry và các khái niệm cốt lõi",
        "Thực hành với Docker images, containers, volumes và networks",
      ],
    },
    {
      id: 4,
      title: "React + TypeScript - Dự Án Thực Tế",
      teacher: "Hỏi Dân IT",
      rating: 4.8,
      reviews: 256,
      price: 1499000,
      oldPrice: 2499000,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Mới nhất",
      description:
        "Xây dựng ứng dụng web hiện đại với React và TypeScript, từ cơ bản đến nâng cao.",
      totalHours: "30 giờ",
      level: "Trung cấp đến nâng cao",
      updatedAt: "tháng 10 năm 2025",
      learningPoints: [
        "Setup dự án React với TypeScript và Vite",
        "State management với Redux Toolkit",
        "Tích hợp API và xử lý authentication",
        "Testing với Jest và React Testing Library",
      ],
    },
    {
      id: 5,
      title: "AWS Solutions Architect - Lộ Trình Chứng Chỉ",
      teacher: "Cloud Expert Team",
      rating: 4.9,
      reviews: 512,
      price: 2299000,
      oldPrice: 3999000,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Bán chạy nhất",
      description:
        "Chuẩn bị cho kỳ thi AWS Solutions Architect Associate với kiến thức thực chiến.",
      totalHours: "45 giờ",
      level: "Trung cấp",
      updatedAt: "tháng 10 năm 2025",
      learningPoints: [
        "Thiết kế kiến trúc AWS scalable và cost-effective",
        "Bảo mật ứng dụng trên AWS",
        "Networking và content delivery",
        "Database và storage solutions",
      ],
    },
    {
      id: 6,
      title: "Python Machine Learning - Từ Zero Đến Hero",
      teacher: "Data Science Academy",
      rating: 4.7,
      reviews: 892,
      price: 1899000,
      oldPrice: null,
      image: "https://i.ytimg.com/vi/CRGKTef6w2g/mqdefault.jpg",
      tag: "Hot",
      description:
        "Làm chủ Machine Learning với Python, học qua các dự án thực tế và case studies.",
      totalHours: "50 giờ",
      level: "Tất cả các cấp độ",
      updatedAt: "tháng 9 năm 2025",
      learningPoints: [
        "Nền tảng Python cho Data Science",
        "Algorithms: Linear Regression, Random Forest, Neural Networks",
        "Xây dựng và deploy ML models",
        "Real-world projects và portfolio building",
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold">Các khóa học thịnh hành</h1>
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
        {courses.map((course) => (
          <SwiperSlide key={course.id} style={{ overflow: "visible" }}>
            <div style={{ height: "100%" }}>
              <Course
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
                learningPoints={course.learningPoints}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CourseList;
