import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Container } from "@mui/material";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Container
        maxWidth="xl"
        className="flex flex-grow items-center justify-center pb-12 pt-16"
      >
        <div className="grid w-full grid-cols-2">
          <div className="flex items-center">
            <img
              src="https://frontends.udemycdn.com/components/auth/desktop-illustration-step-2-x2.webp"
              alt="Auth Illustration"
              className="h-auto max-w-full"
            />
          </div>
          <div className="flex justify-evenly">
            <div className="w-full max-w-md">
              <Outlet />
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default AuthLayout;
