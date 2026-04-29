import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light", // 'light' | 'dark'

      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        // Apply/remove dark class from html
        document.documentElement.classList.toggle("dark", next === "dark");
      },

      initTheme: () => {
        const { theme } = get();
        document.documentElement.classList.toggle("dark", theme === "dark");
      },
    }),
    {
      name: "OneStack-theme",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export { useThemeStore };
