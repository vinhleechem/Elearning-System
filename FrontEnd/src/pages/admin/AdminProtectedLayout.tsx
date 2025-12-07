import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "../../components/layout/admin/Layout";
import { useAuthStore } from "../../store/authStore";

const AdminProtectedLayout = () => {
  const tokens = useAuthStore((state) => state.tokens);
  const user = useAuthStore((state) => state.user);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const hasRole = useAuthStore((state) => state.hasRole);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (tokens && !user && !isFetchingUser) {
      setIsFetchingUser(true);
      fetchProfile()
        .finally(() => {
          if (isMounted) {
            setIsFetchingUser(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [tokens, user, fetchProfile, isFetchingUser]);

  if (!tokens) {
    return <Navigate to="/login" replace />;
  }

  if (isFetchingUser) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole("ROLE_ADMIN")) {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout />;
};

export default AdminProtectedLayout;

