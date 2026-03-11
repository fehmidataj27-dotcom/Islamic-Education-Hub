import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { user, isLoading, logout } = useAuthContext();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: () => Promise.resolve(logout()), // Wrap in promise to match interface roughly
    isLoggingOut: false
  };
}
