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
  onToggleComplete?: (lectureId: number) => void;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  sections,
  currentLectureId,
  onLectureClick,
  onToggleComplete,
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
        width: 380,
        height: "100%",
        bgcolor: "#fff",
        borderLeft: "1px solid #d1d7dc",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 24px rgba(15,23,42,0.06)",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #d1d7dc",
          bgcolor: "#f9fafb",
        }}
      >
        <Typography variant="h6" fontWeight={800} fontSize={15}>
          Nội dung khóa học
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {sections.map((section) => (
          <Box key={section.id}>
            <ListItemButton
              onClick={() => toggleSection(section.id)}
              sx={{
                bgcolor: "#f9fafb",
                borderBottom: "1px solid #d1d7dc",
                py: 1.5,
                "&:hover": {
                  bgcolor: "#eef2ff",
                },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={700} fontSize={14}>
                  {section.title}
                </Typography>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    mt: 0.5,
                    px: 1,
                    py: 0.25,
                    borderRadius: 999,
                    bgcolor: "#e5e7eb",
                    fontSize: 11,
                    color: "#4b5563",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: 11 }}>
                    {section.completedLectures}/{section.lectures.length} bài
                  </Typography>
                  <Box
                    sx={{
                      width: 3,
                      height: 3,
                      borderRadius: "999px",
                      bgcolor: "#9ca3af",
                    }}
                  />
                  <Typography variant="caption" sx={{ fontSize: 11 }}>
                    {Math.floor(section.totalDuration / 60)} phút
                  </Typography>
                </Box>
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
                          ? "#eef2ff"
                          : "transparent",
                      borderLeft:
                        currentLectureId === lecture.id
                          ? "4px solid #3b82f6"
                          : "4px solid transparent",
                      "&:hover": {
                        bgcolor: "#f3f4ff",
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        ml: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontSize={12}
                      >
                        {formatDuration(lecture.duration)}
                      </Typography>
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete?.(lecture.id);
                        }}
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: "999px",
                          border: "1px solid",
                          borderColor: lecture.isCompleted
                            ? "rgba(34,197,94,0.4)"
                            : "rgba(148,163,184,0.6)",
                          bgcolor: lecture.isCompleted
                            ? "rgba(34,197,94,0.12)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: lecture.isCompleted
                              ? "rgba(34,197,94,0.18)"
                              : "rgba(226,232,240,0.7)",
                          },
                        }}
                      >
                        {lecture.isCompleted && (
                          <Check sx={{ fontSize: 16, color: "#16a34a" }} />
                        )}
                      </Box>
                    </Box>
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

