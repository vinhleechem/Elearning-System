import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./pages/RootLayout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthLayout from "./pages/auth/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginWithQrPage from "./pages/auth/LoginWithQrPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";

import CourseDetailPage from "./pages/course/CourseDetailPage";
// import InstructorDetailPage from './pages/instructor/InstructorDetailPage';
// import InstructorListPage from './pages/instructor/InstructorListPage';
import ProtectedLayout from "./pages/ProtectedLayout";
import DashboardHome from "./pages/dashboard/Home";
import UserProfiles from "./pages/dashboard/UserProfiles";
import MyLearningPage from "./pages/learning/MyLearningPage";
import CourseLearningPage from "./pages/learning/CourseLearningPage";
import InstructorDashboardPage from "./pages/instructor/InstructorDashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "course/:slug",
        element: <CourseDetailPage />,
      },
      {
        path: "my-learning",
        element: <MyLearningPage />,
      },
      {
        path: "course/:courseId/learn",
        element: <CourseLearningPage />,
      },
      {
        path: "instructor",
        children: [
          // {
          //   index: true,
          //   element: <InstructorListPage />
          // },
          // {
          //   path: ':instructorId',
          //   // element: <InstructorDetailPage />
          // }
          {
            path: "dashboard",
            element: <InstructorDashboardPage />,
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "login-qr",
        element: <LoginWithQrPage />,
      },
      {
        path: "verify-otp",
        element: <VerifyOtpPage />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: "profile",
        element: <UserProfiles />,
      },
    ],
  },
]);

export default router;
