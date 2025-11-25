import { Box, Typography } from "@mui/material";

interface Props {
  html?: string;
}

const Description: React.FC<Props> = ({ html }) => {
  if (!html) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Mô tả
      </Typography>

      <Box
        sx={{
          '& p': {
            margin: 0,
            mb: 2,
            color: 'text.primary',
            lineHeight: 1.6
          },
          '& ul, & ol': {
            pl: 2,
            mb: 2
          },
          '& li': {
            mb: 0.5,
            color: 'text.primary'
          }
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Box>
  );
};

export default Description;
