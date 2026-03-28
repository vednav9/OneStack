import { ThumbsUp, ThumbsDown, Bookmark, Share2, ExternalLink } from "lucide-react";
import { useBlogStore } from "../../store/blogStore";
import { cn } from "../../utils/cn";

export default function BlogActions({ blogId, blogUrl, onLike, onSave }) {
  const { savedBlogs, likedBlogs, toggleSave, toggleLike } = useBlogStore();
  const isSaved = savedBlogs.includes(blogId);
  const isLiked = likedBlogs.includes(blogId);

  const handleLike = () => {
    toggleLike(blogId);
    onLike?.(blogId);
  };

  const handleSave = () => {
    toggleSave(blogId);
    onSave?.(blogId);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ url: window.location.href });
    } catch {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  const actionBtn =
    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 hover:bg-secondary";

  return (
    <div className="flex items-center gap-3 flex-wrap my-10 py-6 border-y">
      {/* Like */}
      <button
        id={`action-like-${blogId}`}
        onClick={handleLike}
        className={cn(
          actionBtn,
          isLiked
            ? "bg-primary/10 text-primary border-primary/30"
            : "text-muted-foreground border-border hover:text-foreground"
        )}
        aria-label={isLiked ? "Unlike" : "Like article"}
      >
        <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-primary" : ""}`} />
        {isLiked ? "Liked" : "Like"}
      </button>

      {/* Save */}
      <button
        id={`action-save-${blogId}`}
        onClick={handleSave}
        className={cn(
          actionBtn,
          isSaved
            ? "bg-primary/10 text-primary border-primary/30"
            : "text-muted-foreground border-border hover:text-foreground"
        )}
        aria-label={isSaved ? "Unsave article" : "Save article"}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary" : ""}`} />
        {isSaved ? "Saved" : "Save"}
      </button>

      {/* Share */}
      <button
        id={`action-share-${blogId}`}
        onClick={handleShare}
        className={cn(actionBtn, "text-muted-foreground border-border hover:text-foreground")}
        aria-label="Share article"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {/* Open original */}
      {blogUrl && (
        <a
          id={`action-original-${blogId}`}
          href={blogUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(actionBtn, "text-muted-foreground border-border hover:text-foreground")}
          aria-label="Open original article"
        >
          <ExternalLink className="h-4 w-4" />
          Original Source
        </a>
      )}
    </div>
  );
}
