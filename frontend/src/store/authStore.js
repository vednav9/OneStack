import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem("token") || null,
      isLoading: false,
      error: null,

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken } = await api.post("/auth/register", { email, password, name });
          localStorage.setItem("token", accessToken);
          set({ token: accessToken });
          await get().fetchUser();
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken } = await api.post("/auth/login", { email, password });
          localStorage.setItem("token", accessToken);
          set({ token: accessToken });
          await get().fetchUser();
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async (token) => {
        set({ isLoading: true, error: null });
        try {
          localStorage.setItem("token", token);
          set({ token });
          await get().fetchUser();
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout", {});
        } catch (error) {
          console.error("Logout error", error);
        } finally {
          localStorage.removeItem("token");
          set({ user: null, token: null });
          // Clear blog state on logout
          try {
            const { useBlogStore } = await import("./blogStore");
            useBlogStore.getState().clearState();
          } catch {}
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
          } catch {}
        } catch (error) {
          console.error("Failed to fetch user:", error);
          set({ user: null, token: null, isLoading: false });
          localStorage.removeItem("token");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export { useAuthStore };
