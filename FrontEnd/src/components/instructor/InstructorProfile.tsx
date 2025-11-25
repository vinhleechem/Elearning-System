import { Box, Typography, Card, CardContent, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';

interface InstructorProfileProps {
  bio: string;
  experience: string[];
}

export function InstructorProfile({ bio, experience }: InstructorProfileProps) {
  return (
    <Box>
      {/* Bio Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Giới thiệu
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {bio}
          </Typography>
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Kinh nghiệm làm việc
          </Typography>
          <List>
            {experience.map((exp, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon>
                  <WorkIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={exp} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
