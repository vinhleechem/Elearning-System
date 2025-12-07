import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

interface Props {
  items?: string[];
}

const Requirements: React.FC<Props> = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Yêu cầu
      </Typography>

      <List disablePadding>
        {items.map((item, index) => (
          <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 24 }}>
              <FiberManualRecordIcon sx={{ fontSize: 8, color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText
              primary={item}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Requirements;
