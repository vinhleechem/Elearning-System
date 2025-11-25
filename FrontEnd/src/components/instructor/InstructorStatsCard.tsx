import { Card, CardContent, Typography, Box } from '@mui/material';

interface InstructorStatsCardProps {
  title: string;
  value: string;
  icon: string;
}

export function InstructorStatsCard({ title, value, icon }: InstructorStatsCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="span">
            {icon}
          </Typography>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
