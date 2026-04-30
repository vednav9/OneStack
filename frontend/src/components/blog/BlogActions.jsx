import { ThumbsUp, ThumbsDown, Bookmark, Share2, ExternalLink } from "lucide-react";
import { useBlogStore } from "../../store/blogStore";
import { cn } from "../../utils/cn";

export default function BlogActions({ blog }) {
  const { savedBlogs, upvotedBlogs, downvotedBlogs, toggleSave, toggleUpvote, toggleDownvote, voteDeltas } = useBlogStore();
  const blogId = blog?.id;
  const blogUrl = blog?.url || blog?.sourceURL;
  const isSaved = blogId ? savedBlogs.includes(blogId) : false;
  const isUpvoted = blogId ? upvotedBlogs.includes(blogId) : false;
  const isDownvoted = blogId ? downvotedBlogs.includes(blogId) : false;
  const delta = blogId ? voteDeltas[blogId] || { up: 0, down: 0 } : { up: 0, down: 0 };
  const upvotes = (blog?.upvotes ?? 0) + delta.up;
  const downvotes = (blog?.downvotes ?? 0) + delta.down;

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
      {/* Upvote */}
      <button
        id={`action-upvote-${blogId}`}
        onClick={() => blogId && toggleUpvote(blogId)}
        className={cn(
          actionBtn,
          isUpvoted
            ? "bg-primary/10 text-primary border-primary/30"
            : "text-muted-foreground border-border hover:text-foreground"
        )}
        aria-label={isUpvoted ? "Remove upvote" : "Upvote article"}
      >
        <ThumbsUp className={`h-4 w-4 ${isUpvoted ? "fill-primary" : ""}`} />
        {isUpvoted ? "Upvoted" : "Upvote"}
        <span className="text-xs text-muted-foreground ml-1">{upvotes}</span>
      </button>

      {/* Downvote */}
      <button
        id={`action-downvote-${blogId}`}
        onClick={() => blogId && toggleDownvote(blogId)}
        className={cn(
          actionBtn,
          isDownvoted
            ? "bg-destructive/10 text-destructive border-destructive/30"
            : "text-muted-foreground border-border hover:text-foreground"
        )}
        aria-label={isDownvoted ? "Remove downvote" : "Downvote article"}
      >
        <ThumbsDown className={`h-4 w-4 ${isDownvoted ? "fill-destructive" : ""}`} />
        {isDownvoted ? "Downvoted" : "Downvote"}
        <span className="text-xs text-muted-foreground ml-1">{downvotes}</span>
      </button>

      {/* Save */}
      <button
        id={`action-save-${blogId}`}
        onClick={() => blogId && toggleSave(blogId)}
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
