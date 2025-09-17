import React from "react";
import { footerColumns } from "../../libs/constants";
import { Link } from "react-router-dom";
import { Box, Container } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box bgcolor={"#2A2B3F"}>
      <Container maxWidth="xl">
        <footer className="text-sm text-gray-200">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 py-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-base font-semibold text-white">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="hover:text-gray-100 hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-700">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <img
                  src="/logo-udemy.svg"
                  alt="Udemy logo"
                  className="h-6 w-auto"
                />
                <span className="text-xs text-gray-400">
                  © {new Date().getFullYear()} Udemy, Inc.
                </span>
              </div>
              <Link
                to="#"
                className="text-xs text-gray-400 underline hover:text-gray-200"
              >
                Cài đặt cookie
              </Link>
            </div>
          </div>
        </footer>
      </Container>
    </Box>
  );
};

export default Footer;
