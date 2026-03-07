import { create } from "zustand";

const useBlogStore = create((set) => ({
  savedBlogs: [],
  likedBlogs: [],

  toggleSave: (id) =>
    set((state) => ({
      savedBlogs: state.savedBlogs.includes(id)
        ? state.savedBlogs.filter((b) => b !== id)
        : [...state.savedBlogs, id],
    })),

  toggleLike: (id) =>
    set((state) => ({
      likedBlogs: state.likedBlogs.includes(id)
        ? state.likedBlogs.filter((b) => b !== id)
        : [...state.likedBlogs, id],
    })),
}));

export default useBlogStore;
