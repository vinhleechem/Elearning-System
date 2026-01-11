import React from "react";
import { footerColumns } from "../../libs/constants";
import { Link } from "react-router-dom";
import { Box, Container } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <footer>
          {/* Main Footer Content */}
          <div className="py-12">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-4 text-base font-bold text-white">
                    {col.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.path}
                          className="text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700">
            <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
                  E
                </div>
                <div>
                  <p className="text-sm font-semibold">E-Learning Platform</p>
                  <p className="text-xs text-gray-400">
                    © {new Date().getFullYear()} All rights reserved.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 text-xs text-gray-400">
                <Link
                  to="/privacy"
                  className="hover:text-blue-400 transition-colors"
                >
                  Chính sách bảo mật
                </Link>
                <Link
                  to="/terms"
                  className="hover:text-blue-400 transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
                <Link
                  to="#"
                  className="hover:text-blue-400 transition-colors"
                >
                  Cài đặt cookie
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </Container>
    </Box>
  );
};

export default Footer;
