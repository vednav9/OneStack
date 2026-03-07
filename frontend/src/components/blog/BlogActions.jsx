import { ThumbsUp, Bookmark, Share2 } from "lucide-react";
import useBlogStore from "../../store/blogStore";

export default function BlogActions({ blogId, likes }) {
  const { toggleSave, toggleLike, savedBlogs, likedBlogs } = useBlogStore();

  const isSaved = savedBlogs.includes(blogId);
  const isLiked = likedBlogs.includes(blogId);

  return (
    <div className="flex items-center gap-4 mt-3">
      <button
        onClick={() => toggleLike(blogId)}
        className={`flex items-center gap-1 text-sm ${
          isLiked ? "text-red-500" : ""
        }`}
      >
        <ThumbsUp size={16} />
        {likes}
      </button>
      <button
        onClick={() => toggleSave(blogId)}
        className={`${isSaved ? "text-blue-500" : ""}`}
      >
        <Bookmark size={16} />
      </button>

      <button>
        <Share2 size={16} />
      </button>
    </div>
  );
}
