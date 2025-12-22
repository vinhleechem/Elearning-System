import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./pages/RootLayout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutLayout from "./pages/CheckoutLayout";
import AuthLayout from "./pages/auth/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginWithQrPage from "./pages/auth/LoginWithQrPage";
import FacebookCallbackPage from "./pages/auth/FacebookCallbackPage";
import CourseDetailPage from "./pages/course/CourseDetailPage";
// import InstructorDetailPage from './pages/instructor/InstructorDetailPage';
// import InstructorListPage from './pages/instructor/InstructorListPage';
import DashboardHome from "./pages/dashboard/Home";
import UserProfiles from "./pages/dashboard/UserProfiles";
import AdminProtectedLayout from "./pages/admin/AdminProtectedLayout";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import MyLearningPage from "./pages/learning/MyLearningPage";
import CourseLearningPage from "./pages/learning/CourseLearningPage";
import InstructorDashboardPage from "./pages/instructor/InstructorDashboardPage";
import WishlistPage from "./pages/WishlistPage";
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentFailedPage from "./pages/payment/PaymentFailedPage";

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
        path: "course/:slug",
        element: <CourseDetailPage />,
      },
      {
        path: "my-courses",
        children: [
          {
            path: "learning",
            element: <MyLearningPage />,
          },
          {
            path: "wishlist",
            element: <WishlistPage />,
          },
        ],
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
      {
        path: "profile",
        element: <UserProfiles />,
      },
    ],
  },
  {
    path: "/payment",
    element: <CheckoutLayout />,
    children: [
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "success",
        element: <PaymentSuccessPage />,
      },
      {
        path: "failed",
        element: <PaymentFailedPage />,
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
        path: "auth/facebook/callback",
        element: <FacebookCallbackPage />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminProtectedLayout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardHome />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "courses",
        element: <CourseManagement />,
      },
      {
        path: "categories",
        element: <CategoryManagement />,
      },
    ],
  },
]);

export default router;
