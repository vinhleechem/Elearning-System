import { useAuthStore } from "../store/authStore";

/**
 * Custom hook for checking user roles
 */
export function useUserRole() {
  const { user, hasRole } = useAuthStore();

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: hasRole("ADMIN"),
    isInstructor: hasRole("INSTRUCTOR"),
    isStudent: hasRole("STUDENT"),
    hasRole,
  };
}

export default useUserRole;
