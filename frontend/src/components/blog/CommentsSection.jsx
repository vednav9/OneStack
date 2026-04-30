import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "../ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../utils/formatDate";
import * as commentService from "../../services/commentService";

const MAX_COMMENT_LENGTH = 2000;

function sortComments(a, b) {
  if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
  if ((b.upvotes ?? 0) !== (a.upvotes ?? 0)) return (b.upvotes ?? 0) - (a.upvotes ?? 0);
  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}

export default function CommentsSection({ blogId }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "ADMIN";
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!blogId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    commentService.getBlogComments(blogId)
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setComments(list.sort(sortComments));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load comments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [blogId]);

  const remaining = MAX_COMMENT_LENGTH - content.length;

  const handleAuthRedirect = () => {
    const nextPath = `${location.pathname}${location.search}${location.hash}`;
    navigate(`/login?next=${encodeURIComponent(nextPath)}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      handleAuthRedirect();
      return;
    }

    const message = content.trim();
    if (!message) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await commentService.createBlogComment(blogId, message);
      setComments((prev) => [created, ...prev].sort(sortComments));
      setContent("");
    } catch (err) {
      setError(err.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (commentId, direction) => {
    if (!user) {
      handleAuthRedirect();
      return;
    }

    const prev = comments;
    const next = comments.map((comment) => {
      if (comment.id !== commentId) return comment;

      const isUp = comment.userVote === "up";
      const isDown = comment.userVote === "down";
      let upvotes = comment.upvotes ?? 0;
      let downvotes = comment.downvotes ?? 0;
      let userVote = comment.userVote;

      if (direction === "up") {
        if (isUp) {
          upvotes -= 1;
          userVote = null;
        } else {
          upvotes += 1;
          if (isDown) downvotes -= 1;
          userVote = "up";
        }
      }

      if (direction === "down") {
        if (isDown) {
          downvotes -= 1;
          userVote = null;
        } else {
          downvotes += 1;
          if (isUp) upvotes -= 1;
          userVote = "down";
        }
      }

      return {
        ...comment,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
        userVote,
      };
    });

    setComments(next.sort(sortComments));

    try {
      const comment = prev.find((item) => item.id === commentId);
      const isUp = comment?.userVote === "up";
      const isDown = comment?.userVote === "down";

      if (direction === "up") {
        if (isUp) {
          await commentService.removeUpvoteComment(commentId);
        } else {
          await commentService.upvoteComment(commentId);
        }
      }

      if (direction === "down") {
        if (isDown) {
          await commentService.removeDownvoteComment(commentId);
        } else {
          await commentService.downvoteComment(commentId);
        }
      }
    } catch (err) {
      setComments(prev);
    }
  };

  const hasComments = comments.length > 0;
  const commentCountLabel = useMemo(() => (
    `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`
  ), [comments.length]);

  return (
    <section className="mt-16 border-t pt-10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Comments</h2>
          <p className="text-xs text-muted-foreground">{commentCountLabel}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={user ? "Share your thoughts..." : "Sign in to join the discussion"}
          className="w-full min-h-[120px] rounded-xl border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          maxLength={MAX_COMMENT_LENGTH}
          disabled={!user || submitting}
        />
        <div className="flex items-center justify-between">
          <span className={`text-xs ${remaining < 0 ? "text-destructive" : "text-muted-foreground"}`}>
            {remaining} characters left
          </span>
          <div className="flex items-center gap-2">
            {!user && (
              <Button type="button" variant="outline" onClick={handleAuthRedirect}>
                Sign in
              </Button>
            )}
            <Button type="submit" isLoading={submitting} disabled={!user || !content.trim()}>
              Post comment
            </Button>
          </div>
        </div>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : !hasComments ? (
        <div className="rounded-xl border bg-secondary/20 p-6 text-sm text-muted-foreground">
          Be the first to comment on this article.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={comment.user?.userPhoto || ""} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {(comment.user?.name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{comment.user?.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt, "relative")}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Score {comment.score ?? 0}</div>
              </div>

              <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>

              {!isAdmin && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleVote(comment.id, "up")}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                      comment.userVote === "up"
                        ? "border-primary/30 text-primary bg-primary/10"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="Upvote comment"
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${comment.userVote === "up" ? "fill-primary" : ""}`} />
                    {comment.upvotes ?? 0}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVote(comment.id, "down")}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                      comment.userVote === "down"
                        ? "border-destructive/30 text-destructive bg-destructive/10"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="Downvote comment"
                  >
                    <ThumbsDown className={`h-3.5 w-3.5 ${comment.userVote === "down" ? "fill-destructive" : ""}`} />
                    {comment.downvotes ?? 0}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
