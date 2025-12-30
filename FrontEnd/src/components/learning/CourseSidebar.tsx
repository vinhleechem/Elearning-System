import {
  Box,
  Collapse,
  List,
  ListItemButton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Check, PlayArrow, ExpandMore, ExpandLess } from "@mui/icons-material";
import type { Section } from "../../types/lecture";

interface CourseSidebarProps {
  sections: Section[];
  currentLectureId?: number;
  onLectureClick: (lectureId: number) => void;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  sections,
  currentLectureId,
  onLectureClick,
}) => {
  const [expandedSections, setExpandedSections] = useState<number[]>(
    sections.map((s) => s.id)
  );

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        width: 400,
        height: "100%",
        bgcolor: "#fff",
        borderLeft: "1px solid #d1d7dc",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #d1d7dc" }}>
        <Typography variant="h6" fontWeight={700}>
          Nội dung khóa học
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {sections.map((section) => (
          <Box key={section.id}>
            <ListItemButton
              onClick={() => toggleSection(section.id)}
              sx={{
                bgcolor: "#f7f9fa",
                borderBottom: "1px solid #d1d7dc",
                py: 1.5,
                "&:hover": {
                  bgcolor: "#e8e9eb",
                },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={700} fontSize={14}>
                  {section.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {section.completedLectures} / {section.lectures.length} |{" "}
                  {Math.floor(section.totalDuration / 60)} phút
                </Typography>
              </Box>
              {expandedSections.includes(section.id) ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )}
            </ListItemButton>

            <Collapse
              in={expandedSections.includes(section.id)}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                {section.lectures.map((lecture) => (
                  <ListItemButton
                    key={lecture.id}
                    onClick={() => onLectureClick(lecture.id)}
                    sx={{
                      pl: 3,
                      py: 1.5,
                      bgcolor:
                        currentLectureId === lecture.id
                          ? "#f7f9fa"
                          : "transparent",
                      borderLeft:
                        currentLectureId === lecture.id
                          ? "4px solid #3b82f6"
                          : "4px solid transparent",
                      "&:hover": {
                        bgcolor: "#f7f9fa",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        mr: 2,
                        display: "flex",
                        alignItems: "center",
                        color: lecture.isCompleted ? "#5cb85c" : "#6a6f73",
                      }}
                    >
                      {lecture.isCompleted ? (
                        <Check fontSize="small" />
                      ) : (
                        <PlayArrow fontSize="small" />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        fontSize={14}
                        sx={{
                          color:
                            currentLectureId === lecture.id
                              ? "#3b82f6"
                              : "inherit",
                          fontWeight:
                            currentLectureId === lecture.id ? 700 : 400,
                        }}
                      >
                        {lecture.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize={12}
                    >
                      {formatDuration(lecture.duration)}
                    </Typography>
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default CourseSidebar;

