import { useState, useRef } from "react";
import { Box, Typography, Divider } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link } from "react-router-dom";
import type { CategoryTreeResponse } from "../../service/categoryService";

interface MegaMenuProps {
  categories: CategoryTreeResponse[]; // Level 1 roots
  onHover: () => void;
  onLeave: () => void;
}

const MegaMenu = ({ categories, onHover, onLeave }: MegaMenuProps) => {
  const [activeLevel1Id, setActiveLevel1Id] = useState<number | null>(
    categories[0]?.id ?? null
  );
  const [activeLevel2Id, setActiveLevel2Id] = useState<number | null>(null);

  // Timeout refs for smooth hover transitions
  const level2TimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const level3TimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeLevel1 = categories.find((c) => c.id === activeLevel1Id);
  const level2List = activeLevel1?.children?.filter((c) => c.isActive) ?? [];

  // Auto-select first level2 when level1 changes
  const handleLevel1Hover = (cat: CategoryTreeResponse) => {
    if (level2TimeoutRef.current) clearTimeout(level2TimeoutRef.current);
    setActiveLevel1Id(cat.id);
    setActiveLevel2Id(null); // Reset: panel 3 chỉ hiện khi hover cấp 2
  };

  const handleLevel2Hover = (cat: CategoryTreeResponse) => {
    if (level3TimeoutRef.current) clearTimeout(level3TimeoutRef.current);
    setActiveLevel2Id(cat.id);
  };

  const activeLevel2 = level2List.find((c) => c.id === activeLevel2Id);
  const level3List = activeLevel2?.children?.filter((c) => c.isActive) ?? [];

  return (
    <Box
      sx={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        bgcolor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        zIndex: 1300,
        overflow: "hidden",
        animation: "megaMenuFadeIn 0.18s ease",
        "@keyframes megaMenuFadeIn": {
          from: { opacity: 0, transform: "translateY(-6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* ── PANEL 1: Level 1 (root categories) ── */}
      <Box
        sx={{
          width: 220,
          borderRight: "1px solid #f0f0f0",
          maxHeight: "72vh",
          overflowY: "auto",
          py: 1.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "#e0e0e0",
            borderRadius: 2,
          },
        }}
      >
        <Typography
          sx={{
            px: 2.5,
            py: 1,
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          Danh mục
        </Typography>

        {categories
          .filter((c) => c.isActive)
          .map((cat) => {
            const isActive = cat.id === activeLevel1Id;
            return (
              <Box
                key={cat.id}
                component={Link}
                to={`/courses?categoryId=${cat.id}`}
                onMouseEnter={() => handleLevel1Hover(cat)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2.5,
                  py: 1.1,
                  cursor: "pointer",
                  textDecoration: "none",
                  borderRadius: "0 8px 8px 0",
                  mx: 1,
                  bgcolor: isActive ? "#eff6ff" : "transparent",
                  color: isActive ? "#2563eb" : "#1e293b",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "13.5px",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "#eff6ff",
                    color: "#2563eb",
                  },
                  position: "relative",
                  ...(isActive && {
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: -8,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: 4,
                      bgcolor: "#2563eb",
                    },
                  }),
                }}
              >
                <span>{cat.name}</span>
                {cat.children && cat.children.length > 0 && (
                  <ChevronRightIcon
                    sx={{
                      fontSize: 16,
                      color: isActive ? "#2563eb" : "#cbd5e1",
                      transition: "color 0.15s",
                    }}
                  />
                )}
              </Box>
            );
          })}
      </Box>

      {/* ── PANEL 2: Level 2 ── */}
      {level2List.length > 0 && (
        <Box
          sx={{
            width: 230,
            borderRight: "1px solid #f0f0f0",
            maxHeight: "72vh",
            overflowY: "auto",
            py: 1.5,
            bgcolor: "#fafbfc",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "#e0e0e0",
              borderRadius: 2,
            },
          }}
        >
          <Typography
            sx={{
              px: 2.5,
              py: 1,
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            {activeLevel1?.name}
          </Typography>

          {level2List.map((cat) => {
            const isActive = cat.id === activeLevel2Id;
            return (
              <Box
                key={cat.id}
                component={Link}
                to={`/courses?categoryId=${cat.id}`}
                onMouseEnter={() => handleLevel2Hover(cat)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2.5,
                  py: 1.1,
                  cursor: "pointer",
                  textDecoration: "none",
                  borderRadius: "0 8px 8px 0",
                  mx: 1,
                  bgcolor: isActive ? "#eff6ff" : "transparent",
                  color: isActive ? "#2563eb" : "#1e293b",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "13.5px",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "#eff6ff",
                    color: "#2563eb",
                  },
                  position: "relative",
                  ...(isActive && {
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: -8,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: 4,
                      bgcolor: "#2563eb",
                    },
                  }),
                }}
              >
                <span>{cat.name}</span>
                {cat.children && cat.children.length > 0 && (
                  <ChevronRightIcon
                    sx={{
                      fontSize: 16,
                      color: isActive ? "#2563eb" : "#cbd5e1",
                      transition: "color 0.15s",
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── PANEL 3: Level 3 ── */}
      {level3List.length > 0 && (
        <Box
          sx={{
            width: 260,
            maxHeight: "72vh",
            overflowY: "auto",
            py: 1.5,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "#e0e0e0",
              borderRadius: 2,
            },
          }}
        >
          <Box sx={{ px: 2.5, py: 1 }}>
            <Typography
              sx={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#94a3b8",
                mb: 0.5,
              }}
            >
              Chủ đề phổ biến
            </Typography>
            <Typography
              component={Link}
              to={`/courses?categoryId=${activeLevel2Id}`}
              sx={{
                fontSize: "12px",
                color: "#2563eb",
                fontWeight: 500,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Xem tất cả →
            </Typography>
          </Box>

          <Divider sx={{ mx: 2, borderColor: "#f0f0f0", mb: 1 }} />

          {level3List.map((cat) => (
            <Box
              key={cat.id}
              component={Link}
              to={`/courses?categoryId=${cat.id}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2.5,
                py: 0.9,
                textDecoration: "none",
                color: "#374151",
                fontSize: "13.5px",
                borderRadius: "0 8px 8px 0",
                mx: 1,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#eff6ff",
                  color: "#2563eb",
                  "& .dot": { bgcolor: "#2563eb" },
                },
              }}
            >
              <Box
                className="dot"
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: "#cbd5e1",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              />
              {cat.name}
            </Box>
          ))}
        </Box>
      )}

      {/* Empty state nếu chưa có dữ liệu */}
      {level2List.length === 0 && (
        <Box sx={{ px: 3, py: 4, color: "#94a3b8", fontSize: 13 }}>
          Đang cập nhật...
        </Box>
      )}
    </Box>
  );
};

export default MegaMenu;
