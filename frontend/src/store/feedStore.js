import { create } from "zustand";
import { persist } from "zustand/middleware";

const useFeedStore = create(
  persist(
    (set) => ({
      sortMode: "relevant",
      setSortMode: (mode) => set({ sortMode: mode }),
    }),
    {
      name: "feed-storage",
      partialize: (state) => ({ sortMode: state.sortMode }),
    }
  )
);

export { useFeedStore };
