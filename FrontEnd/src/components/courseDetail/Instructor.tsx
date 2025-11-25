import { Box, Typography, Avatar, Stack, Button } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import type { InstructorInfo } from "../../types/courseDetail";

interface Props {
  instructor: InstructorInfo;
}

const Instructor: React.FC<Props> = ({ instructor }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Giảng viên
      </Typography>

      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Avatar
          src={instructor.avatarUrl}
          alt={instructor.name}
          sx={{
            width: 120,
            height: 120,
            fontSize: '3rem',
            fontWeight: 700,
            bgcolor: 'primary.main',
            color: 'white'
          }}
        >
          {instructor.name.charAt(0)}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="primary.main"
            sx={{ mb: 0.5, textDecoration: 'underline', cursor: 'pointer' }}
          >
            {instructor.name}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {instructor.title}
          </Typography>

          <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="body2" fontWeight={600}>4.9 xếp hạng giảng viên</Typography>
            </Stack>

            <Typography variant="body2">
              <strong>1 249</strong> đánh giá
            </Typography>

            <Typography variant="body2">
              <strong>12 436</strong> học viên
            </Typography>

            <Typography variant="body2">
              <strong>3</strong> khóa học
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, mb: 2 }}>
            Mình từng học KỸ sư tại trường tại Đại Học Bách khoa Hà Nội trong 2 năm. Sau đó mình đi du
            học và tốt nghiệp thạc sĩ vật lý hạt nhân tại trường đại học MEPhI - một trong những ngôi trường
            tốt nhất tại liên bang Nga. Sau đó, mình có cơ hội làm việc trong lĩnh vực công nghệ thông tin,
            bên cạnh đó với lĩnh vực này và hiện tại mình đang là Senior AI Engineer.
          </Typography>

          <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, mb: 2 }}>
            Mình đã có nhiều năm kinh nghiệm làm việc với Python và trí tuệ nhân tạo (AI). Các lĩnh vực
            chuyên môn chính của mình bao gồm: AI tạo ảnh (Computer Vision), xử lý ngôn ngữ tự...
          </Typography>

          <Button
            variant="text"
            size="small"
            sx={{ p: 0, textTransform: 'none', color: 'primary.main', fontWeight: 600 }}
          >
            Hiển thêm
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default Instructor;
