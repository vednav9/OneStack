import { create } from "zustand";
import { persist } from "zustand/middleware";
import { saveBlog, unsaveBlog, likeBlog, unlikeBlog } from "../services/blogService";
import api from "../services/api";

const useBlogStore = create(
  persist(
    (set, get) => ({
      savedBlogs: [],  // array of blog IDs
      likedBlogs: [],  // array of blog IDs

      // Toggle save — optimistic UI + correct REST verb
      toggleSave: async (id) => {
        const isSaved = get().savedBlogs.includes(id);
        // Optimistic update
        set((state) => ({
          savedBlogs: isSaved
            ? state.savedBlogs.filter((b) => b !== id)
            : [...state.savedBlogs, id],
        }));
        try {
          if (isSaved) {
            await unsaveBlog(id);
          } else {
            await saveBlog(id);
          }
        } catch (err) {
          // Rollback
          set((state) => ({
            savedBlogs: isSaved
              ? [...state.savedBlogs, id]
              : state.savedBlogs.filter((b) => b !== id),
          }));
          console.error("Failed to toggle save:", err);
        }
      },

      // Toggle like — optimistic UI + correct REST verb
      toggleLike: async (id) => {
        const isLiked = get().likedBlogs.includes(id);
        // Optimistic update
        set((state) => ({
          likedBlogs: isLiked
            ? state.likedBlogs.filter((b) => b !== id)
            : [...state.likedBlogs, id],
        }));
        try {
          if (isLiked) {
            await unlikeBlog(id);
          } else {
            await likeBlog(id);
          }
        } catch (err) {
          // Rollback
          set((state) => ({
            likedBlogs: isLiked
              ? [...state.likedBlogs, id]
              : state.likedBlogs.filter((b) => b !== id),
          }));
          console.error("Failed to toggle like:", err);
        }
      },

      // Load saved IDs from backend after login
      syncFromServer: async () => {
        try {
          const savedData = await api.get("/user/saved");
          if (Array.isArray(savedData)) {
            set({ savedBlogs: savedData.map((b) => b.id) });
          }
        } catch (err) {
          console.error("Failed to sync blog state:", err);
        }
      },

      clearState: () => set({ savedBlogs: [], likedBlogs: [] }),
    }),
    {
      name: "blog-storage",
      partialize: (state) => ({
        savedBlogs: state.savedBlogs,
        likedBlogs: state.likedBlogs,
      }),
    }
  )
);

export { useBlogStore };
