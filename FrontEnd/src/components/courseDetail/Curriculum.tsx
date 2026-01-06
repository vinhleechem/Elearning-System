import React from "react";
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
  Stack,
  Button
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
  if (h > 0) return `${h} giờ ${m} phút`;
  return `${m} phút`;
};

const getSectionDuration = (section: SectionItem) => {
  const secs = (section.lectures || []).reduce((sum, l: LectureItem) => sum + parseDurationToSeconds(l.duration), 0);
  return formatSeconds(secs);
};

const Curriculum: React.FC<Props> = ({ sections = [] }) => {
  const [expanded, setExpanded] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (sections.length > 0) {
      setExpanded([Number(sections[0].id)]);
    }
  }, [sections]);

  const totalLectures = sections.reduce((sum, s) => sum + (s.lectures?.length || 0), 0);
  const allDuration = sections.reduce((sum, s) => sum + (s.lectures || []).reduce((sSum, l) => sSum + parseDurationToSeconds(l.duration), 0), 0);

  const handleExpandAll = () => {
    if (expanded.length === sections.length) {
      setExpanded([]);
    } else {
      setExpanded(sections.map(s => Number(s.id)));
    }
  };

  const handleChange = (panelId: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(prev =>
      isExpanded ? [...prev, panelId] : prev.filter(id => id !== panelId)
    );
  };

  if (!sections.length) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Nội dung khóa học
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {sections.length} phần • {totalLectures} bài giảng • {formatSeconds(allDuration)} tổng thời lượng
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={handleExpandAll}
          sx={{ p: 0, textTransform: 'none', color: '#5624d0', fontWeight: 700 }}
        >
          {expanded.length === sections.length ? 'Thu gọn tất cả' : 'Mở rộng tất cả các phần'}
        </Button>
      </Box>

      <Box sx={{ border: '1px solid #d1d7dc' }}>
        {sections.map((section: SectionItem, _index: number) => (
          <Accordion
            key={section.id}
            expanded={expanded.includes(Number(section.id))}
            onChange={handleChange(Number(section.id))}
            disableGutters
            elevation={0}
            sx={{
              '&:before': { display: 'none' },
              borderBottom: '1px solid #d1d7dc',
              '&:last-child': { borderBottom: 'none' },
              bgcolor: '#f7f9fa'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 2,
                py: 0,
                minHeight: 48,
                '& .MuiAccordionSummary-content': { margin: '12px 0' }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={700} variant="subtitle1" fontSize={15}>
                    {section.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {section.lectures?.length || 0} bài giảng • {getSectionDuration(section)}
                  </Typography>
                </Stack>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 2, py: 2, bgcolor: 'white' }}>
              <List dense disablePadding>
                {(section.lectures || []).map((lecture: LectureItem) => (
                  <ListItem
                    key={lecture.id}
                    sx={{ pl: 0, pr: 0, py: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {lecture.previewable ? (
                        <PlayCircleOutlineIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                      ) : (
                        <OndemandVideoIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                      )}
                    </ListItemIcon>

                    <ListItemText
                      primary={lecture.title}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: lecture.previewable ? '#5624d0' : 'text.primary',
                        sx: {
                          textDecoration: lecture.previewable ? 'underline' : 'none',
                          cursor: lecture.previewable ? 'pointer' : 'default',
                          fontSize: 14
                        }
                      }}
                      sx={{ flex: 1 }}
                    />

                    {lecture.previewable && (
                      <Typography
                        variant="caption"
                        sx={{
                          mr: 2,
                          color: '#5624d0',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        Xem trước
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ minWidth: 40, textAlign: 'right' }}
                    >
                      {lecture.duration || ""}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default Curriculum;
