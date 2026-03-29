import { useAuthStore } from "../store/authStore";

/**
 * Thin wrapper around authStore for easy consumption.
 * Components that just need to read auth state use this.
 */
export default function useAuth() {
  const { user, token, isLoading, error, login, logout, register, loginWithGoogle, fetchUser } =
    useAuthStore();

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    register,
    loginWithGoogle,
    fetchUser,
  };
}
