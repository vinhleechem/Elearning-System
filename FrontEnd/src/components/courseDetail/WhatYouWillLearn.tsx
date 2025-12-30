import { Typography, Button, Paper, Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";

interface Props {
  items: string[];
}

const WhatYouWillLearn: React.FC<Props> = ({ items }) => {
  const [expanded, setExpanded] = useState(false);
  const initialLimit = 10;
  const visible = expanded ? items : items.slice(0, initialLimit);

  if (!items || items.length === 0) return null;

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 4, borderColor: '#d1d7dc', borderRadius: 0 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Nội dung bài học
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, columnGap: 4 }}>
        {visible.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <CheckIcon sx={{ color: '#2d2f31', fontSize: 16, mt: 0.5, mr: 2, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#2d2f31' }}>
              {item.replace(/^[•\-\.\s]+/, "")}
            </Typography>
          </Box>
        ))}
      </Box>

      {items.length > initialLimit && (
        <Button
          size="small"
          onClick={() => setExpanded((s) => !s)}
          sx={{ mt: 2, color: '#5624d0', fontWeight: 700, textTransform: 'none', padding: 0, minWidth: 0 }}
        >
          {expanded ? 'Ẩn bớt' : 'Hiện thêm'}
        </Button>
      )}
    </Paper>
  );
};

export default WhatYouWillLearn;
