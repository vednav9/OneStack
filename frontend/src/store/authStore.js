import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

function persistTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

function clearPersistedAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("auth-storage");
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem(ACCESS_TOKEN_KEY) || null,
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || null,
      isLoading: false,
      error: null,

      register: async (name, email, password) => {
        set({ user: null, isLoading: true, error: null });
        try {
          const { accessToken, refreshToken } = await api.post("/auth/register", { email, password, name });
          persistTokens(accessToken, refreshToken);
          set({ token: accessToken, refreshToken: refreshToken || null });
          const profile = await get().fetchUser();
          if (!profile) {
            throw new Error("Unable to complete sign up. Please try again.");
          }
        } catch (error) {
          clearPersistedAuth();
          set({ user: null, token: null, refreshToken: null, error: error.message, isLoading: false });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ user: null, isLoading: true, error: null });
        try {
          const { accessToken, refreshToken } = await api.post("/auth/login", { email, password });
          persistTokens(accessToken, refreshToken);
          set({ token: accessToken, refreshToken: refreshToken || null });
          const profile = await get().fetchUser();
          if (!profile) {
            throw new Error("Unable to complete sign in. Please try again.");
          }
        } catch (error) {
          clearPersistedAuth();
          set({ user: null, token: null, refreshToken: null, error: error.message, isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async (token, refreshToken) => {
        set({ user: null, isLoading: true, error: null });
        try {
          persistTokens(token, refreshToken);
          set({ token, refreshToken: refreshToken || null });
          const profile = await get().fetchUser();
          if (!profile) {
            throw new Error("Unable to complete Google sign in. Please try again.");
          }
          return profile;
        } catch (error) {
          clearPersistedAuth();
          set({ user: null, token: null, refreshToken: null, error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const refreshToken = get().refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);
        try {
          if (refreshToken) {
            await api.post("/auth/logout", { refreshToken });
          }
        } catch (error) {
          console.error("Logout error", error);
        } finally {
          clearPersistedAuth();
          set({ user: null, token: null, refreshToken: null, error: null });
          // Clear blog state on logout
          try {
            const { useBlogStore } = await import("./blogStore");
            useBlogStore.getState().clearState();
          } catch (syncError) {
            console.warn("Failed to clear blog store on logout:", syncError);
          }
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const userData = await api.get("/user/profile");
          set({ user: userData, isLoading: false });
          // Sync saved/liked state from backend
          try {
            const { useBlogStore } = await import("./blogStore");
            useBlogStore.getState().syncFromServer();
          } catch (syncError) {
            console.warn("Failed to sync blog store from server:", syncError);
          }
          return userData;
        } catch (error) {
          console.error("Failed to fetch user:", error);
          if (error.message === "Unauthorized") {
            clearPersistedAuth();
            set({ user: null, token: null, refreshToken: null, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          return null;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, user: state.user }),
    }
  )
);

export { useAuthStore };
