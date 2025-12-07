import { useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { MegaMenuTopic } from "../../data/megaMenu";

interface MegaMenuProps {
  title: string;
  topics: MegaMenuTopic[];
  onHover: () => void;
  onLeave: () => void;
}

const MegaMenu = ({ title, topics, onHover, onLeave }: MegaMenuProps) => {
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const activeTopic = topics[activeTopicIndex];

  return (
    <Box
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        mt: 1,
        bgcolor: "#fff",
        borderRadius: 2,
        boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
        border: "1px solid #edeff1",
        display: "flex",
        zIndex: 1300,
        minWidth: 720,
        overflow: "hidden",
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Box
        sx={{
          minWidth: 260,
          borderRight: "1px solid #edeff1",
          backgroundColor: "#fff",
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ px: 2.5, py: 2, color: "text.primary" }}
        >
          {title}
        </Typography>
        <Divider />
        <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
          {topics.map((topic, idx) => {
            const active = idx === activeTopicIndex;
            return (
              <Box
                key={topic.label}
                component="li"
                onMouseEnter={() => setActiveTopicIndex(idx)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2.5,
                  py: 1.2,
                  cursor: "pointer",
                  bgcolor: active ? "#f3f3f3" : "transparent",
                  color: active ? "#3b82f6" : "#1c1d1f",
                  fontWeight: active ? 700 : 500,
                  "&:hover": {
                    bgcolor: "#f3f3f3",
                    color: "#3b82f6",
                  },
                }}
              >
                {topic.label}
                <ChevronRightIcon fontSize="small" />
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          backgroundColor: "#f7f9fa",
        }}
      >
        {activeTopic.columns.map((column) => (
          <Box
            key={column.title}
            sx={{
              minWidth: 240,
              p: 2.5,
              borderLeft: "1px solid #edeff1",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="text.primary"
              sx={{ mb: 1 }}
            >
              {column.title}
            </Typography>
            <Divider sx={{ mb: 1.5, opacity: 0.2 }} />
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {column.items.map((item) => (
                <Typography
                  component="li"
                  key={item}
                  sx={{
                    fontSize: 14,
                    color: "#1c1d1f",
                    py: 0.75,
                    cursor: "pointer",
                    "&:hover": {
                      color: "#3b82f6",
                    },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MegaMenu;

