// import { Container, Box, Typography, Grid, Card, CardContent, Avatar, Rating, Chip, Stack, Button } from "@mui/material";
// import { School } from "@mui/icons-material";
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import type { Instructor } from "../../types/instructor";
//
// const InstructorListPage: React.FC = () => {
//   const [instructors, setInstructors] = useState<Instructor[]>([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//
//   useEffect(() => {
//     // Mock data - replace with actual API call
//     const mockInstructors: Instructor[] = [
//       {
//         id: "1",
//         name: "AI Coding",
//         title: "Senior AI Engineer",
//         avatar: "/images/user/user-01.png",
//         bio: "Chuyên gia về AI và Machine Learning với hơn 5 năm kinh nghiệm",
//         experience: "Senior AI Engineer với chuyên môn về Python, AI/ML",
//         totalStudents: 12436,
//         totalReviews: 1249,
//         rating: 4.8,
//         specialization: ["Python", "AI/ML", "Computer Vision", "NLP"],
//         courses: []
//       },
//       {
//         id: "2",
//         name: "Nguyễn Văn A",
//         title: "Full Stack Developer",
//         avatar: "/images/user/user-02.png",
//         bio: "Chuyên gia phát triển web với React, Node.js và các công nghệ hiện đại",
//         experience: "Full Stack Developer với 7 năm kinh nghiệm",
//         totalStudents: 8520,
//         totalReviews: 892,
//         rating: 4.7,
//         specialization: ["React", "Node.js", "TypeScript", "MongoDB"],
//         courses: []
//       },
//       {
//         id: "3",
//         name: "Trần Thị B",
//         title: "UI/UX Designer",
//         avatar: "/images/user/user-03.png",
//         bio: "Chuyên gia thiết kế UI/UX với kinh nghiệm làm việc tại các công ty lớn",
//         experience: "UI/UX Designer với 6 năm kinh nghiệm",
//         totalStudents: 5643,
//         totalReviews: 723,
//         rating: 4.9,
//         specialization: ["Figma", "Adobe XD", "Design System", "Prototyping"],
//         courses: []
//       },
//       {
//         id: "4",
//         name: "Lê Văn C",
//         title: "DevOps Engineer",
//         avatar: "/images/user/user-04.png",
//         bio: "Chuyên gia DevOps với kinh nghiệm triển khai và quản lý hệ thống lớn",
//         experience: "DevOps Engineer với 8 năm kinh nghiệm",
//         totalStudents: 3241,
//         totalReviews: 456,
//         rating: 4.6,
//         specialization: ["Docker", "Kubernetes", "AWS", "CI/CD"],
//         courses: []
//       }
//     ];
//
//     // Simulate API loading
//     setTimeout(() => {
//       setInstructors(mockInstructors);
//       setLoading(false);
//     }, 800);
//   }, []);
//
//   const handleViewProfile = (instructorId: string) => {
//     navigate(`/instructor/${instructorId}`);
//   };
//
//   if (loading) {
//     return (
//       <Container maxWidth="lg" sx={{ py: 4 }}>
//         <Typography>Đang tải danh sách giảng viên...</Typography>
//       </Container>
//     );
//   }
//
//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       {/* Header */}
//       <Box sx={{ mb: 4, textAlign: 'center' }}>
//         <Typography variant="h3" fontWeight={700} mb={2}>
//           Đội ngũ giảng viên
//         </Typography>
//         <Typography variant="h6" color="text.secondary" maxWidth={600} mx="auto">
//           Học từ những chuyên gia hàng đầu trong ngành với nhiều năm kinh nghiệm thực tế
//         </Typography>
//       </Box>
//
//       {/* Instructors Grid */}
//       <Grid container spacing={4}>
//         {instructors.map((instructor) => (
//           <Grid xs={12} sm={6} md={6} lg={4} key={instructor.id}>
//             <Card
//               sx={{
//                 height: '100%',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 transition: 'transform 0.2s, box-shadow 0.2s',
//                 '&:hover': {
//                   transform: 'translateY(-8px)',
//                   boxShadow: 6
//                 }
//               }}
//             >
//               <CardContent sx={{ flexGrow: 1, p: 3 }}>
//                 {/* Avatar and Basic Info */}
//                 <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
//                   <Avatar
//                     src={instructor.avatar}
//                     alt={instructor.name}
//                     sx={{ width: 80, height: 80, mb: 2 }}
//                   />
//                   <Typography variant="h6" fontWeight={600} textAlign="center" mb={1}>
//                     {instructor.name}
//                   </Typography>
//                   <Typography variant="body2" color="primary" textAlign="center" mb={2}>
//                     {instructor.title}
//                   </Typography>
//                 </Box>
//
//                 {/* Bio */}
//                 <Typography
//                   variant="body2"
//                   color="text.secondary"
//                   textAlign="center"
//                   mb={3}
//                   sx={{
//                     display: '-webkit-box',
//                     WebkitLineClamp: 3,
//                     WebkitBoxOrient: 'vertical',
//                     overflow: 'hidden'
//                   }}
//                 >
//                   {instructor.bio}
//                 </Typography>
//
//                 {/* Specializations */}
//                 <Stack direction="row" spacing={1} flexWrap="wrap" mb={3} justifyContent="center">
//                   {instructor.specialization.slice(0, 3).map((spec, index) => (
//                     <Chip
//                       key={index}
//                       label={spec}
//                       size="small"
//                       variant="outlined"
//                       sx={{ mb: 1 }}
//                     />
//                   ))}
//                   {instructor.specialization.length > 3 && (
//                     <Chip
//                       label={`+${instructor.specialization.length - 3}`}
//                       size="small"
//                       variant="outlined"
//                       sx={{ mb: 1 }}
//                     />
//                   )}
//                 </Stack>
//
//                 {/* Stats */}
//                 <Box sx={{ mb: 3 }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <School sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
//                       <Typography variant="body2" color="text.secondary">
//                         {instructor.totalStudents.toLocaleString()} học viên
//                       </Typography>
//                     </Box>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <Rating value={instructor.rating} readOnly size="small" />
//                       <Typography variant="body2" color="text.secondary" ml={0.5}>
//                         ({instructor.rating})
//                       </Typography>
//                     </Box>
//                   </Box>
//                   <Typography variant="body2" color="text.secondary" textAlign="center">
//                     {instructor.totalReviews.toLocaleString()} đánh giá
//                   </Typography>
//                 </Box>
//
//                 {/* View Profile Button */}
//                 <Button
//                   variant="contained"
//                   fullWidth
//                   onClick={() => handleViewProfile(instructor.id)}
//                   sx={{ mt: 'auto' }}
//                 >
//                   Xem hồ sơ
//                 </Button>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Container>
//   );
// };
//
// export default InstructorListPage;
