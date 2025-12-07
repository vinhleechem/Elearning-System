import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";

export default function UserInfoCard() {
  return (
    <Box sx={{ bgcolor: "white", p: 2.5, maxWidth: 800, mb: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 1.8 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
          Public profile
        </Typography>
        <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
          Add information about yourself
        </Typography>
      </Box>

      {/* Basics Section */}
      <Box sx={{ mb: 1.8, pb: 1.8, borderBottom: "1px solid #d1d7dc" }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          sx={{ mb: 1 }}
          fontSize="0.9rem"
        >
          Basics:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
          <TextField
            fullWidth
            placeholder="First Name"
            defaultValue="Vinh"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.9rem",
                "& fieldset": {
                  borderColor: "#d1d7dc",
                },
              },
            }}
          />
          <TextField
            fullWidth
            placeholder="Last Name"
            defaultValue="Lê Quang"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.9rem",
                "& fieldset": {
                  borderColor: "#d1d7dc",
                },
              },
            }}
          />
          <Box>
            <TextField
              fullWidth
              placeholder="Headline"
              size="small"
              helperText="Add a professional headline like, 'Instructor at Udemy' or 'Architect'"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.9rem",
                  "& fieldset": {
                    borderColor: "#d1d7dc",
                  },
                },
                "& .MuiFormHelperText-root": {
                  fontSize: "0.75rem",
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                float: "right",
                mt: 0.5,
                color: "text.secondary",
                fontSize: "0.75rem",
              }}
            >
              0
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Biography Section */}
      <Box sx={{ mb: 1.8, pb: 1.8, borderBottom: "1px solid #d1d7dc" }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          sx={{ mb: 1 }}
          fontSize="0.9rem"
        >
          Biography
        </Typography>
        <Box sx={{ border: "1px solid #d1d7dc", borderRadius: 1 }}>
          <Box
            sx={{
              borderBottom: "1px solid #d1d7dc",
              p: 0.5,
              bgcolor: "#f7f9fa",
            }}
          >
            <Button
              sx={{
                minWidth: 35,
                color: "#2d2f31",
                fontWeight: 700,
                fontSize: "0.85rem",
                py: 0.5,
              }}
            >
              B
            </Button>
            <Button
              sx={{
                minWidth: 35,
                color: "#2d2f31",
                fontStyle: "italic",
                fontSize: "0.85rem",
                py: 0.5,
              }}
            >
              I
            </Button>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={2.5}
            placeholder="Biography"
            variant="standard"
            sx={{
              px: 1.5,
              py: 1,
              "& .MuiInput-root": {
                fontSize: "0.9rem",
                "&:before": { borderBottom: "none" },
                "&:after": { borderBottom: "none" },
                "&:hover:not(.Mui-disabled):before": { borderBottom: "none" },
              },
            }}
          />
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block", fontSize: "0.75rem" }}
        >
          Links and coupon codes are not permitted in this section.
        </Typography>
      </Box>

      {/* Language */}
      <Box sx={{ mb: 1.8, pb: 1.8, borderBottom: "1px solid #d1d7dc" }}>
        <FormControl fullWidth size="small">
          <Select
            defaultValue="English (US)"
            sx={{
              fontSize: "0.9rem",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#d1d7dc",
              },
            }}
          >
            <MenuItem value="English (US)">English (US)</MenuItem>
            <MenuItem value="Vietnamese">Tiếng Việt</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Links Section */}
      <Box sx={{ mb: 1.8 }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          sx={{ mb: 1 }}
          fontSize="0.9rem"
        >
          Links:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
          <TextField
            fullWidth
            placeholder="Website (http(s)://..)"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.9rem",
                "& fieldset": {
                  borderColor: "#d1d7dc",
                },
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                bgcolor: "#f7f9fa",
                border: "1px solid #d1d7dc",
                borderRadius: "4px 0 0 4px",
                minWidth: 140,
              }}
            >
              <Typography variant="body2" fontSize="0.85rem">
                facebook.com/
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Username"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.9rem",
                  borderRadius: "0 4px 4px 0",
                  "& fieldset": {
                    borderColor: "#d1d7dc",
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: -0.5, fontSize: "0.75rem" }}
          >
            Input your Facebook username (e.g. johnsmith).
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                bgcolor: "#f7f9fa",
                border: "1px solid #d1d7dc",
                borderRadius: "4px 0 0 4px",
                minWidth: 140,
              }}
            >
              <Typography variant="body2" fontSize="0.85rem">
                instagram.com/
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Username"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.9rem",
                  borderRadius: "0 4px 4px 0",
                  "& fieldset": {
                    borderColor: "#d1d7dc",
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: -0.5, fontSize: "0.75rem" }}
          >
            Input your Instagram username (e.g. johnsmith).
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                bgcolor: "#f7f9fa",
                border: "1px solid #d1d7dc",
                borderRadius: "4px 0 0 4px",
                minWidth: 140,
              }}
            >
              <Typography variant="body2" fontSize="0.85rem">
                linkedin.com/
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Public Profile URL"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.9rem",
                  borderRadius: "0 4px 4px 0",
                  "& fieldset": {
                    borderColor: "#d1d7dc",
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: -0.5, fontSize: "0.75rem" }}
          >
            Input your LinkedIn public profile URL (e.g. in/johnsmith,
            company/udemy).
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                bgcolor: "#f7f9fa",
                border: "1px solid #d1d7dc",
                borderRadius: "4px 0 0 4px",
                minWidth: 140,
              }}
            >
              <Typography variant="body2" fontSize="0.85rem">
                tiktok.com/
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="@Username"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.9rem",
                  borderRadius: "0 4px 4px 0",
                  "& fieldset": {
                    borderColor: "#d1d7dc",
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: -0.5, fontSize: "0.75rem" }}
          >
            Input your TikTok username (e.g. @johnsmith).
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                bgcolor: "#f7f9fa",
                border: "1px solid #d1d7dc",
                borderRadius: "4px 0 0 4px",
                minWidth: 140,
              }}
            >
              <Typography variant="body2" fontSize="0.85rem">
                x.com/
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Username"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.9rem",
                  borderRadius: "0 4px 4px 0",
                  "& fieldset": {
                    borderColor: "#d1d7dc",
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: -0.5, fontSize: "0.75rem" }}
          >
            Add your X username (e.g. johnsmith).
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                bgcolor: "#f7f9fa",
                border: "1px solid #d1d7dc",
                borderRadius: "4px 0 0 4px",
                minWidth: 140,
              }}
            >
              <Typography variant="body2" fontSize="0.85rem">
                youtube.com/
              </Typography>
            </Box>
            <TextField
              fullWidth
              placeholder="Username"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.9rem",
                  borderRadius: "0 4px 4px 0",
                  "& fieldset": {
                    borderColor: "#d1d7dc",
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: -0.5, fontSize: "0.75rem" }}
          >
            Input your Youtube username (e.g. johnsmith).
          </Typography>
        </Box>
      </Box>

      {/* Save Button */}
      <Button
        variant="contained"
        sx={{
          bgcolor: "#5624d0",
          color: "white",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.9rem",
          px: 2.5,
          py: 1,
          "&:hover": {
            bgcolor: "#3d1a99",
          },
        }}
      >
        Save
      </Button>
    </Box>
  );
}
