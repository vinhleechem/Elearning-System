import { Typography, List, ListItem, ListItemIcon, ListItemText, Button, Paper, Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";

interface Props {
  items: string[];
}

const WhatYouWillLearn: React.FC<Props> = ({ items }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 6);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, mb: 3, borderColor: 'divider', borderWidth: 1 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Nội dung bài học
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {visible.map((item, index) => (
          <Box key={index}>
            <List disablePadding>
              <ListItem sx={{ pl: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            </List>
          </Box>
        ))}
      </Box>

      {items.length > 6 && (
        <Button size="small" onClick={() => setExpanded((s) => !s)} sx={{ mt: 2, color: 'primary.main' }}>
          {expanded ? 'Thu gọn' : 'Hiện thêm'}
        </Button>
      )}
    </Paper>
  );
};

export default WhatYouWillLearn;
