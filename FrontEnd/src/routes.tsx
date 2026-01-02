import { createBrowserRouter, Navigate } from "react-router-dom";
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
import PromotionManagement from "./pages/admin/PromotionManagement";
import VoucherManagement from "./pages/admin/VoucherManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import MyLearningPage from "./pages/learning/MyLearningPage";
import CourseLearningPage from "./pages/learning/CourseLearningPage";
import InstructorDashboardPage from "./pages/instructor/InstructorDashboardPage";
import CourseContentManagementPage from "./pages/instructor/CourseContentManagementPage";
import InstructorLayout from "./pages/instructor/InstructorLayout";
import WishlistPage from "./pages/WishlistPage";
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentFailedPage from "./pages/payment/PaymentFailedPage";
import NotificationManagement from "./pages/admin/NotificationManagement";
import RevenueDashboard from "./pages/admin/RevenueDashboard";

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
        element: <InstructorLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          // {
          //   path: ':instructorId',
          //   // element: <InstructorDetailPage />
          // }
          {
            path: "dashboard",
            element: <InstructorDashboardPage />,
          },
          {
            path: "courses/:courseId/content",
            element: <CourseContentManagementPage />,
          },
          // Placeholder routes for other sidebar items to prevent 404 if clicked
          { path: "communication", element: <InstructorDashboardPage /> },
          { path: "performance", element: <InstructorDashboardPage /> },
          { path: "tools", element: <InstructorDashboardPage /> },
          { path: "resources", element: <InstructorDashboardPage /> },
          { path: "profile", element: <InstructorDashboardPage /> },
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
      {
        path: "promotions",
        element: <PromotionManagement />,
      },
      {
        path: "vouchers",
        element: <VoucherManagement />,
      },
      {
        path: "orders",
        element: <OrderManagement />,
      },
      {
        path: "orders/:orderId",
        element: <AdminOrderDetail />,
      },
      {
        path: "courses/:courseId/content",
        element: <CourseContentManagementPage />,
      },
      {
        path: "notifications",
        element: <NotificationManagement />,
      },
      {
        path: "revenue",
        element: <RevenueDashboard />,
      },
    ],
  },
]);

export default router;
