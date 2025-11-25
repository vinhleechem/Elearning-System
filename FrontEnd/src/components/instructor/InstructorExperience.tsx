import { Box, Typography, Paper, Stack, Avatar } from "@mui/material";
import { WorkOutline, SchoolOutlined, EmojiEventsOutlined } from "@mui/icons-material";

interface ExperienceItem {
  type: 'work' | 'education' | 'achievement';
  title: string;
  organization: string;
  period: string;
  description?: string;
}

interface Props {
  experience: string;
  experienceItems?: ExperienceItem[];
}

const InstructorExperience: React.FC<Props> = ({ experience, experienceItems = [] }) => {
  const getIcon = (type: ExperienceItem['type']) => {
    switch (type) {
      case 'work':
        return <WorkOutline />;
      case 'education':
        return <SchoolOutlined />;
      case 'achievement':
        return <EmojiEventsOutlined />;
      default:
        return <WorkOutline />;
    }
  };

  const getColor = (type: ExperienceItem['type']) => {
    switch (type) {
      case 'work':
        return 'primary.main';
      case 'education':
        return 'secondary.main';
      case 'achievement':
        return 'warning.main';
      default:
        return 'primary.main';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Kinh nghiệm
      </Typography>

      {/* General Experience Description */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
          {experience}
        </Typography>
      </Paper>

      {/* Experience Items */}
      {experienceItems.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Chi tiết kinh nghiệm
          </Typography>
          <Stack spacing={3}>
            {experienceItems.map((item, index) => (
              <Paper key={index} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      bgcolor: getColor(item.type),
                      width: 48,
                      height: 48
                    }}
                  >
                    {getIcon(item.type)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {item.title}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" mb={1}>
                      {item.organization}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {item.period}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default InstructorExperience;
