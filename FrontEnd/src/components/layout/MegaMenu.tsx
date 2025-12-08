import { useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link } from "react-router-dom";
import type { MegaMenuTopic } from "../../data/megaMenu";

interface MegaMenuProps {
  title: string;
  topics: MegaMenuTopic[];
  onHover: () => void;
  onLeave: () => void;
}

const MegaMenu = ({ title, topics, onHover, onLeave }: MegaMenuProps) => {
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const activeTopic = topics[activeTopicIndex];
  const activeColumn =
    activeTopic?.columns && activeTopic.columns.length > 0
      ? activeTopic.columns[activeColumnIndex] || activeTopic.columns[0]
      : null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        mt: 0.5,
        bgcolor: "#fff",
        borderRadius: 1,
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.16)",
        border: "1px solid #d1d7dc",
        display: "flex",
        zIndex: 1300,
        minWidth: 820,
        maxWidth: 1024,
        overflow: "hidden",
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Box
        sx={{
          minWidth: 240,
          maxWidth: 240,
          borderRight: "1px solid #d1d7dc",
          backgroundColor: "#fff",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            px: 2,
            py: 2,
            color: "#1c1d1f",
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
        >
          {title}
        </Typography>
        <Divider sx={{ borderColor: "#d1d7dc" }} />
        <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
          {topics.map((topic, idx) => {
            const active = idx === activeTopicIndex;
            return (
              <Box
                key={topic.label}
                component="li"
                onMouseEnter={() => setActiveTopicIndex(idx)}
              >
                <Box
                  component={Link}
                  to={`/courses?category=${encodeURIComponent(topic.label)}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                    cursor: "pointer",
                    bgcolor: active ? "#f7f9fa" : "transparent",
                    color: active ? "#3b82f6" : "#1c1d1f",
                    fontWeight: active ? 700 : 400,
                    fontSize: "14px",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#f7f9fa",
                      color: "#3b82f6",
                    },
                  }}
                >
                  {topic.label}
                  <ChevronRightIcon
                    fontSize="small"
                    sx={{
                      fontSize: "18px",
                      color: active ? "#3b82f6" : "#6a6f73"
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flex: 1,
          backgroundColor: "#fff",
          maxHeight: "70vh",
          overflow: "hidden",
        }}
      >
        {/* Middle column: level 2 list */}
        <Box
          sx={{
            width: 260,
            borderRight: "1px solid #e8e9eb",
            backgroundColor: "#fff",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {activeTopic?.columns?.map((column, idx) => {
              const active = idx === activeColumnIndex;
              return (
                <Box
                  key={`${column.title}-${idx}`}
                  component="li"
                  onMouseEnter={() => setActiveColumnIndex(idx)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1,
                      cursor: "pointer",
                      bgcolor: active ? "#f7f9fa" : "transparent",
                      color: active ? "#3b82f6" : "#1c1d1f",
                      fontWeight: active ? 700 : 400,
                      fontSize: "14px",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#f7f9fa",
                        color: "#3b82f6",
                      },
                    }}
                  >
                    {column.title}
                    <ChevronRightIcon
                      fontSize="small"
                      sx={{
                        fontSize: "18px",
                        color: active ? "#3b82f6" : "#6a6f73",
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Right column: level 3 items */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#fff",
            maxHeight: "70vh",
            overflowY: "auto",
            p: 2.5,
            minWidth: 260,
          }}
        >
          {activeColumn ? (
            <>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{
                  mb: 1.5,
                  color: "#1c1d1f",
                  fontSize: "14px",
                }}
              >
                {activeColumn.title}
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                {activeColumn.items.map((item) => (
                  <Typography
                    component={Link}
                    to={`/courses?subcategory=${encodeURIComponent(item)}`}
                    key={item}
                    sx={{
                      fontSize: "13px",
                      color: "#6a6f73",
                      py: 0.5,
                      cursor: "pointer",
                      textDecoration: "none",
                      display: "block",
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: "#3b82f6",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Đang cập nhật...
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MegaMenu;

