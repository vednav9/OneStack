import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  saveBlog,
  unsaveBlog,
  upvoteBlog,
  removeUpvoteBlog,
  downvoteBlog,
  removeDownvoteBlog,
} from "../services/blogService";
import api from "../services/api";

const useBlogStore = create(
  persist(
    (set, get) => ({
      savedBlogs: [],  // array of blog IDs
      upvotedBlogs: [],  // array of blog IDs
      downvotedBlogs: [],  // array of blog IDs
      voteDeltas: {}, // { [blogId]: { up: number, down: number } }

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

      // Toggle upvote/downvote with optimistic UI
      toggleUpvote: async (id) => {
        const prevState = get();
        const isUpvoted = prevState.upvotedBlogs.includes(id);
        const isDownvoted = prevState.downvotedBlogs.includes(id);

        const nextUpvoted = isUpvoted
          ? prevState.upvotedBlogs.filter((b) => b !== id)
          : [...prevState.upvotedBlogs, id];
        const nextDownvoted = isDownvoted
          ? prevState.downvotedBlogs.filter((b) => b !== id)
          : prevState.downvotedBlogs;

        const deltaUp = isUpvoted ? -1 : 1;
        const deltaDown = isDownvoted ? -1 : 0;
        const currentDelta = prevState.voteDeltas[id] || { up: 0, down: 0 };
        const voteDeltas = {
          ...prevState.voteDeltas,
          [id]: {
            up: currentDelta.up + deltaUp,
            down: currentDelta.down + deltaDown,
          },
        };

        set({ upvotedBlogs: nextUpvoted, downvotedBlogs: nextDownvoted, voteDeltas });

        try {
          if (isUpvoted) {
            await removeUpvoteBlog(id);
          } else {
            await upvoteBlog(id);
          }
        } catch (err) {
          set({
            upvotedBlogs: prevState.upvotedBlogs,
            downvotedBlogs: prevState.downvotedBlogs,
            voteDeltas: prevState.voteDeltas,
          });
          console.error("Failed to toggle upvote:", err);
        }
      },

      toggleDownvote: async (id) => {
        const prevState = get();
        const isUpvoted = prevState.upvotedBlogs.includes(id);
        const isDownvoted = prevState.downvotedBlogs.includes(id);

        const nextDownvoted = isDownvoted
          ? prevState.downvotedBlogs.filter((b) => b !== id)
          : [...prevState.downvotedBlogs, id];
        const nextUpvoted = isUpvoted
          ? prevState.upvotedBlogs.filter((b) => b !== id)
          : prevState.upvotedBlogs;

        const deltaDown = isDownvoted ? -1 : 1;
        const deltaUp = isUpvoted ? -1 : 0;
        const currentDelta = prevState.voteDeltas[id] || { up: 0, down: 0 };
        const voteDeltas = {
          ...prevState.voteDeltas,
          [id]: {
            up: currentDelta.up + deltaUp,
            down: currentDelta.down + deltaDown,
          },
        };

        set({ upvotedBlogs: nextUpvoted, downvotedBlogs: nextDownvoted, voteDeltas });

        try {
          if (isDownvoted) {
            await removeDownvoteBlog(id);
          } else {
            await downvoteBlog(id);
          }
        } catch (err) {
          set({
            upvotedBlogs: prevState.upvotedBlogs,
            downvotedBlogs: prevState.downvotedBlogs,
            voteDeltas: prevState.voteDeltas,
          });
          console.error("Failed to toggle downvote:", err);
        }
      },

      // Load saved/voted IDs from backend after login
      syncFromServer: async () => {
        try {
          const [savedData, upvotedData, downvotedData] = await Promise.all([
            api.get("/user/saved"),
            api.get("/user/upvotes"),
            api.get("/user/downvotes"),
          ]);

          set({
            savedBlogs: Array.isArray(savedData) ? savedData.map((b) => b.id) : [],
            upvotedBlogs: Array.isArray(upvotedData) ? upvotedData.map((b) => b.id) : [],
            downvotedBlogs: Array.isArray(downvotedData) ? downvotedData.map((b) => b.id) : [],
          });
        } catch (err) {
          console.error("Failed to sync blog state:", err);
        }
      },

      clearState: () => set({ savedBlogs: [], upvotedBlogs: [], downvotedBlogs: [], voteDeltas: {} }),
    }),
    {
      name: "blog-storage",
      partialize: (state) => ({
        savedBlogs: state.savedBlogs,
        upvotedBlogs: state.upvotedBlogs,
        downvotedBlogs: state.downvotedBlogs,
      }),
    }
  )
);

export { useBlogStore };
