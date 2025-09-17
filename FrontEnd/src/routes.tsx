import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./pages/RootLayout";
import HomePage from "./pages/HomePage";
import AuthLayout from "./pages/auth/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOTPPage from "./pages/auth/VerifyOtpPage";
import LoginWithQrPage from "./pages/auth/LoginWithQrPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/layout/admin/Layout";
import Home from "./pages/dashboard/Home";
import UserProfiles from "./pages/dashboard/UserProfiles";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: "/", element: <HomePage /> },

      {
        path: "/admin/dashboard",
        element: <Layout />,
        children: [
          { index: true, element: <Home /> },
          { path: "profile", element: <UserProfiles /> },
        ],
      },

      { path: "/cart", element: <CartPage /> },
      { path: "/payment/checkout", element: <CheckoutPage /> },

      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/login/qr", element: <LoginWithQrPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/verifyOTP", element: <VerifyOTPPage /> },
        ],
      },
    ],
  },
]);
