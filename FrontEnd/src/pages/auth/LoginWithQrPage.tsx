import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

const LoginWithQrPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center pt-7">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        maxWidth={400}
        mb={4}
      >
        <Typography
          variant="h5"
          className="font-bold text-gray-900"
          sx={{ textTransform: "none" }}
        >
          Đăng nhập với mã QR
        </Typography>

        <Button
          component={Link}
          to="/login"
          variant="outlined"
          startIcon={<LockOutlined />}
          sx={{
            fontSize: 11,
            textTransform: "none",
            borderColor: "#3b82f6",
            color: "#3b82f6",
            bgcolor: "#eff6ff",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "#dbeafe",
              borderColor: "#3b82f6",
            },
          }}
        >
          Đăng nhập với mật khẩu
        </Button>
      </Box>

      {/* Ảnh QR code */}
      <Box
        sx={{
          border: "1px solid #e5e7eb",
          padding: 2,
          borderRadius: 2,
          mb: 3,
        }}
      >
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa0nfDiqJ3CkPo-bfjbDAgMouTb4lz-HJvjw&s" // đặt file QR thật hoặc API QR tại đây
          alt="QR Code"
          width={200}
          height={200}
        />
      </Box>

      <Typography variant="body1" className="mb-2 text-center">
        Quét mã QR bằng ứng dụng của bạn
      </Typography>

      <Link to="#" className="mb-4 text-sm text-primary-main hover:underline">
        Làm Thế Nào Để Quét Mã?
      </Link>

      <Typography variant="body2" color="text.secondary">
        Bạn mới biết đến chúng tôi?{" "}
        <Link to="/register" className="text-primary-main">
          Đăng ký
        </Link>
      </Typography>
    </div>
  );
};

export default LoginWithQrPage;
