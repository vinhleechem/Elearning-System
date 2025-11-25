import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Button,
  Paper
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import type { SectionItem, LectureItem } from "../../types/courseDetail";

interface Props {
  sections: SectionItem[];
  totalDuration?: string;
}

const parseDurationToSeconds = (s?: string) => {
  if (!s) return 0;
  const parts = s.split(":").map((p) => Number(p));
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
};

const formatSeconds = (secs: number) => {
  if (!secs) return "";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h} giờ ${m} phút`;
  return `${m} phút`;
};

const getSectionDuration = (section: SectionItem) => {
  const secs = (section.lectures || []).reduce((sum, l: LectureItem) => sum + parseDurationToSeconds(l.duration), 0);
  return formatSeconds(secs);
};

const Curriculum: React.FC<Props> = ({ sections = [], totalDuration = "" }) => {
  const totalLectures = sections.reduce((sum, s) => sum + (s.lectures?.length || 0), 0);
  const allDuration = sections.reduce((sum, s) => sum + (s.lectures || []).reduce((sSum, l) => sSum + parseDurationToSeconds(l.duration), 0), 0);

  if (!sections.length) return null;

  return (
    <Paper variant="outlined" sx={{ p: 0, mb: 3, borderColor: 'divider' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          Nội dung khóa học
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {sections.length} phần • {totalLectures} bài giảng • {formatSeconds(allDuration)} tổng thời lượng
        </Typography>

        <Button
          variant="text"
          size="small"
          sx={{ p: 0, textTransform: 'none', color: 'primary.main', fontWeight: 600 }}
        >
          Mở rộng tất cả các phần
        </Button>
      </Box>

      {sections.map((section: SectionItem, index: number) => (
        <Accordion
          key={section.id}
          defaultExpanded={index === 0}
          disableGutters
          elevation={0}
          sx={{
            '&:before': { display: 'none' },
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 3,
              py: 2,
              '& .MuiAccordionSummary-content': { margin: 0 }
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={700} variant="subtitle1">
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {section.lectures?.length || 0} bài giảng • {getSectionDuration(section)}
                </Typography>
              </Stack>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ px: 3, py: 0, pb: 2 }}>
            <List dense disablePadding>
              {(section.lectures || []).map((lecture: LectureItem) => (
                <ListItem
                  key={lecture.id}
                  sx={{
                    pl: 0,
                    pr: 0,
                    py: 1,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {lecture.previewable ? (
                      <PlayCircleOutlineIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    ) : (
                      <OndemandVideoIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    )}
                  </ListItemIcon>

                  <ListItemText
                    primary={lecture.title}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: lecture.previewable ? 'primary.main' : 'text.primary',
                      sx: { textDecoration: lecture.previewable ? 'underline' : 'none' }
                    }}
                    sx={{ flex: 1 }}
                  />

                  {lecture.previewable && (
                    <Chip
                      label="Xem trước"
                      size="small"
                      variant="outlined"
                      sx={{
                        mr: 2,
                        fontSize: '0.75rem',
                        height: 24,
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }}
                    />
                  )}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 50, textAlign: 'right' }}
                  >
                    {lecture.duration || ""}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ p: 3, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="outlined"
          sx={{
            borderStyle: 'dashed',
            borderColor: 'primary.main',
            color: 'primary.main',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          4 phần nữa
        </Button>
      </Box>
    </Paper>
  );
};

export default Curriculum;
