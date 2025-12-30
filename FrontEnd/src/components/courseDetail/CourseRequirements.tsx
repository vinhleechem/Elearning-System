import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface Props {
    requirements: string[];
}

const CourseRequirements: React.FC<Props> = ({ requirements }) => {
    if (!requirements || requirements.length === 0) return null;

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={700} mb={2}>
                Yêu cầu
            </Typography>
            <List disablePadding>
                {requirements.map((req, index) => (
                    <ListItem key={index} sx={{ pl: 0, py: 0.5, alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 24, mt: 1 }}>
                            <FiberManualRecordIcon sx={{ fontSize: 8, color: 'text.primary' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={req.replace(/^[•\-\.\s]+/, "")}
                            primaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontSize: '0.95rem' }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default CourseRequirements;
