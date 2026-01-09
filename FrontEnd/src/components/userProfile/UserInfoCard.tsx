import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAuthStore } from "../../store/authStore";
import { userService } from "../../service/userService";
import { useToast } from "../../hooks/useToast";

export default function UserInfoCard() {
  const { tokens } = useAuthStore();
  const accessToken = tokens?.accessToken;
  const { enqueueSnackbar } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // State for form fields - All UpdateProfileRequest fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken]);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const data = await userService.getMyInfo(accessToken!);
      setFullName(data.fullName || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setDateOfBirth(data.dateOfBirth || "");
      setBio(data.bio || "");
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.updateProfile(accessToken!, {
        fullName,
        phone: phone || undefined,
        address: address || undefined,
        dateOfBirth: dateOfBirth || undefined,
        bio: bio || undefined,
      });

      enqueueSnackbar("Cập nhật thông tin thành công", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Cập nhật thất bại", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "white", p: 2.5, maxWidth: 800, mb: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 1.8 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
          Hồ sơ cá nhân
        </Typography>
        <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
          Thông tin cơ bản của bạn
        </Typography>
      </Box>

      {/* Form Fields */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Full Name */}
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Họ và tên <span style={{ color: "#ef4444" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhập họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            size="small"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.9rem",
                "& fieldset": { borderColor: "#d1d7dc" },
              },
            }}
          />
        </Box>

        {/* Phone */}
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Số điện thoại
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhập số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            size="small"
            inputProps={{ maxLength: 20 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.9rem",
                "& fieldset": { borderColor: "#d1d7dc" },
              },
            }}
          />
        </Box>

        {/* Address */}
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Địa chỉ
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhập địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            size="small"
            inputProps={{ maxLength: 255 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.9rem",
                "& fieldset": { borderColor: "#d1d7dc" },
              },
            }}
          />
        </Box>

        {/* Date of Birth */}
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Ngày sinh
          </Typography>
          <TextField
            fullWidth
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.9rem",
                "& fieldset": { borderColor: "#d1d7dc" },
              },
            }}
          />
        </Box>

        {/* Bio */}
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Giới thiệu bản thân
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Viết vài dòng về bản thân..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            size="small"
            inputProps={{ maxLength: 500 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.9rem",
                "& fieldset": { borderColor: "#d1d7dc" },
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
            {bio.length}/500
          </Typography>
        </Box>
      </Box>

      {/* Save Button */}
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={loading || !fullName.trim()}
        sx={{
          bgcolor: "#3b82f6",
          color: "white",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.9rem",
          px: 2.5,
          py: 1,
          mt: 3,
          "&:hover": { bgcolor: "#2563eb" },
          "&:disabled": { bgcolor: "#cbd5e1" },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Lưu thay đổi"}
      </Button>
    </Box>
  );
}
