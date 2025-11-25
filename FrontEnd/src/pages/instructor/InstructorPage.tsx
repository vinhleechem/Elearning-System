// import { Container, Box, Breadcrumbs, Link, Typography } from "@mui/material";
// import { useParams } from "react-router-dom";
// import { useState, useEffect } from "react";
// import InstructorProfile from "../../components/instructor/InstructorProfile";
// import InstructorStatsCard from "../../components/instructor/InstructorStatsCard";
// import InstructorCourses from "../../components/instructor/InstructorCourses";
// import InstructorExperience from "../../components/instructor/InstructorExperience";
// import type { Instructor, InstructorStats } from "../../types/instructor";
//
// const InstructorPage: React.FC = () => {
//   const { instructorId, username } = useParams<{ instructorId: string; username: string }>();
//   const [instructor, setInstructor] = useState<Instructor | null>(null);
//   const [stats, setStats] = useState<InstructorStats | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     // Get identifier from either instructorId or username
//     const identifier = instructorId || username;
//
//     // Mock data - replace with actual API call
//     const mockInstructor: Instructor = {
//       id: identifier || "1",
//       name: username ? username.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "AI Coding",
//       title: "Senior AI Engineer",
//       avatar: "/images/user/user-01.png",
//       bio: "Mình từng học Kỹ sư tài năng tại Đại Học Bách khoa Hà Nội trong 2 năm. Sau đó mình đi du học và tốt nghiệp thạc sĩ vật lý hạt nhân tại trường đại học MEPhI - một trong những ngôi trường tốt nhất tại liên bang Nga. Sau đó, mình có cơ hội làm việc trong lĩnh vực công nghệ thông tin, bên cạnh với lĩnh vực này và hiện tại mình đang là Senior AI Engineer.",
//       experience: "Mình đã có nhiều năm kinh nghiệm làm việc với Python và trí tuệ nhân tạo (AI). Các lĩnh vực chuyên môn chính của mình bao gồm: thị giác máy tính (Computer Vision), xử lý ngôn ngữ tự nhiên (NLP), truy xuất thông tin RAG, AI Agents, triển khai mô hình AI lên các nền tảng đám mây hoặc thiết bị biên, tối ưu hóa hiệu suất của các mô hình AI, workflow automation với AI.",
//       totalStudents: 12436,
//       totalReviews: 1249,
//       rating: 4.8,
//       specialization: ["Python", "AI/ML", "Computer Vision", "NLP", "Deep Learning"],
//       courses: [
//         {
//           id: "1",
//           title: "Python cho Machine Learning và AI",
//           thumbnail: "/images/course/course-01.jpg",
//           students: 5420,
//           rating: 4.9,
//           price: 899000,
//           originalPrice: 1299000,
//           category: "AI/ML",
//           level: "Trung cấp",
//           duration: "15 giờ",
//           lessons: 120,
//           bestseller: true
//         },
//         {
//           id: "2",
//           title: "Computer Vision với OpenCV và TensorFlow",
//           thumbnail: "/images/course/course-02.jpg",
//           students: 3200,
//           rating: 4.7,
//           price: 1299000,
//           category: "Computer Vision",
//           level: "Nâng cao",
//           duration: "20 giờ",
//           lessons: 85,
//           new: true
//         },
//         {
//           id: "3",
//           title: "NLP và Chatbot với Python",
//           thumbnail: "/images/course/course-03.jpg",
//           students: 3816,
//           rating: 4.8,
//           price: 999000,
//           originalPrice: 1499000,
//           category: "NLP",
//           level: "Trung cấp",
//           duration: "18 giờ",
//           lessons: 95
//         }
//       ],
//       socialLinks: {
//         youtube: "https://youtube.com/@aicoding",
//         linkedin: "https://linkedin.com/in/aicoding",
//         website: "https://aicoding.vn"
//       }
//     };
//
//     const mockStats: InstructorStats = {
//       totalStudents: 12436,
//       totalCourses: 3,
//       totalReviews: 1249,
//       averageRating: 4.8
//     };
//
//     // Simulate API loading
//     setTimeout(() => {
//       setInstructor(mockInstructor);
//       setStats(mockStats);
//       setLoading(false);
//     }, 1000);
//   }, [instructorId, username]);
//
//   if (loading) {
//     return (
//       <Container maxWidth="lg" sx={{ py: 4 }}>
//         <Typography>Đang tải...</Typography>
//       </Container>
//     );
//   }
//
//   if (!instructor || !stats) {
//     return (
//       <Container maxWidth="lg" sx={{ py: 4 }}>
//         <Typography>Không tìm thấy thông tin giảng viên</Typography>
//       </Container>
//     );
//   }
//
//   const experienceItems = [
//     {
//       type: 'work' as const,
//       title: 'Senior AI Engineer',
//       organization: 'Tech Company',
//       period: '2020 - Hiện tại',
//       description: 'Phát triển và triển khai các mô hình AI cho sản phẩm thương mại'
//     },
//     {
//       type: 'education' as const,
//       title: 'Thạc sĩ Vật lý Hạt nhân',
//       organization: 'MEPhI University, Nga',
//       period: '2016 - 2018',
//       description: 'Chuyên sâu về vật lý hạt nhân và ứng dụng công nghệ'
//     },
//     {
//       type: 'education' as const,
//       title: 'Kỹ sư Tài năng',
//       organization: 'Đại học Bách khoa Hà Nội',
//       period: '2014 - 2016',
//       description: 'Chương trình đào tạo kỹ sư tài năng'
//     }
//   ];
//
//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       {/* Breadcrumbs */}
//       <Breadcrumbs sx={{ mb: 3 }}>
//         <Link underline="hover" color="inherit" href="/">
//           Trang chủ
//         </Link>
//         <Link underline="hover" color="inherit" href="/instructors">
//           Giảng viên
//         </Link>
//         <Typography color="text.primary">{instructor.name}</Typography>
//       </Breadcrumbs>
//
//       {/* Main Content */}
//       <Box>
//         {/* Instructor Profile */}
//         <InstructorProfile instructor={instructor} />
//
//         {/* Stats */}
//         <InstructorStatsCard stats={stats} />
//
//         {/* Experience */}
//         <InstructorExperience
//           experience={instructor.experience}
//           experienceItems={experienceItems}
//         />
//
//         {/* Courses */}
//         <InstructorCourses courses={instructor.courses} />
//       </Box>
//     </Container>
//   );
// };
//
// export default InstructorPage;
