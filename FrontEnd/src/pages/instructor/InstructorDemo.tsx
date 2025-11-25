// import { Box, Container, Typography, Grid, Card, CardContent, Avatar, Button, Stack } from "@mui/material";
// import { useNavigate } from "react-router-dom";
//
// const InstructorDemo: React.FC = () => {
//   const navigate = useNavigate();
//
//   const sampleInstructors = [
//     {
//       username: "ai-coding",
//       name: "AI Coding",
//       title: "Senior AI Engineer",
//       avatar: "/images/user/user-01.png",
//       description: "Chuyên gia AI và Machine Learning"
//     },
//     {
//       username: "tran-van-huy-7",
//       name: "Trần Văn Huy",
//       title: "Full Stack Developer",
//       avatar: "/images/user/user-02.png",
//       description: "Chuyên gia phát triển web full-stack"
//     },
//     {
//       username: "nguyen-thi-lan",
//       name: "Nguyễn Thị Lan",
//       title: "UI/UX Designer",
//       avatar: "/images/user/user-03.png",
//       description: "Chuyên gia thiết kế giao diện người dùng"
//     },
//     {
//       username: "le-minh-duc",
//       name: "Lê Minh Đức",
//       title: "DevOps Engineer",
//       avatar: "/images/user/user-04.png",
//       description: "Chuyên gia DevOps và Cloud"
//     }
//   ];
//
//   const handleViewProfile = (username: string) => {
//     navigate(`/user/${username}`);
//   };
//
//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       <Box sx={{ textAlign: 'center', mb: 4 }}>
//         <Typography variant="h3" fontWeight={700} mb={2}>
//           Demo Route User Profile
//         </Typography>
//         <Typography variant="h6" color="text.secondary" mb={3}>
//           Click vào các profile bên dưới để test route /user/:username
//         </Typography>
//
//         {/* URL Examples */}
//         <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
//           <Typography variant="h6" mb={2}>Ví dụ URLs:</Typography>
//           <Stack spacing={1}>
//             <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//               /user/ai-coding → Profile của AI Coding
//             </Typography>
//             <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//               /user/tran-van-huy-7 → Profile của Trần Văn Huy
//             </Typography>
//             <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//               /user/nguyen-thi-lan → Profile của Nguyễn Thị Lan
//             </Typography>
//             <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//               /user/le-minh-duc → Profile của Lê Minh Đức
//             </Typography>
//           </Stack>
//         </Box>
//       </Box>
//
//       <Grid container spacing={3}>
//         {sampleInstructors.map((instructor) => (
//           <Grid xs={12} sm={6} md={3} key={instructor.username}>
//             <Card
//               sx={{
//                 height: '100%',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 transition: 'transform 0.2s',
//                 '&:hover': {
//                   transform: 'translateY(-4px)',
//                   boxShadow: 3
//                 }
//               }}
//             >
//               <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
//                 <Avatar
//                   src={instructor.avatar}
//                   alt={instructor.name}
//                   sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
//                 />
//                 <Typography variant="h6" fontWeight={600} mb={1}>
//                   {instructor.name}
//                 </Typography>
//                 <Typography variant="body2" color="primary" mb={1}>
//                   {instructor.title}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" mb={3}>
//                   {instructor.description}
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     fontFamily: 'monospace',
//                     bgcolor: 'grey.100',
//                     p: 1,
//                     borderRadius: 1,
//                     display: 'block',
//                     mb: 2
//                   }}
//                 >
//                   /user/{instructor.username}
//                 </Typography>
//                 <Button
//                   variant="contained"
//                   fullWidth
//                   onClick={() => handleViewProfile(instructor.username)}
//                 >
//                   Xem Profile
//                 </Button>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//
//       {/* Direct URL Test */}
//       <Box sx={{ mt: 6, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
//         <Typography variant="h6" mb={2}>
//           Hoặc test trực tiếp bằng URL:
//         </Typography>
//         <Typography variant="body2" mb={2}>
//           Bạn có thể nhập trực tiếp vào thanh địa chỉ:
//         </Typography>
//         <Stack spacing={1}>
//           <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//             • http://localhost:5173/user/ai-coding
//           </Typography>
//           <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//             • http://localhost:5173/user/tran-van-huy-7
//           </Typography>
//           <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
//             • http://localhost:5173/user/your-custom-username
//           </Typography>
//         </Stack>
//       </Box>
//     </Container>
//   );
// };
//
// export default InstructorDemo;
