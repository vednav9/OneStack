import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import BlogFeed from "../components/blog/BlogFeed";
import EmptyState from "../components/ui/EmptyState";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuthStore } from "../store/authStore";
import { getLists } from "../services/listService";

export default function LikedBlogs() {
  useDocumentTitle("Liked Articles");
  const { user } = useAuthStore();
  const [liked, setLiked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    getLists()
      .then((data) => {
        const lists = Array.isArray(data) ? data : [];
        const likeList = lists.find((list) => list.id === "default-like") ||
          lists.find((list) => String(list.name || "").toLowerCase() === "like");
        setLiked(Array.isArray(likeList?.blogs) ? likeList.blogs : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b pb-6 mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ThumbsUp className="h-5 w-5 text-primary fill-primary/20" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Liked Articles</h1>
          </div>
          <p className="text-muted-foreground">Blogs you have liked recently.</p>
        </div>
        {!loading && (
          <div className="text-right">
            <span className="text-2xl font-bold">{liked.length}</span>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">LIKED</p>
          </div>
        )}
      </header>

      <div className="min-h-[500px]">
        {!user && !loading ? (
          <EmptyState
            title="Sign in to view liked articles"
            description="Your liked articles are tied to your account."
            icon={<ThumbsUp className="h-8 w-8" />}
            action={
              <Button asChild className="mt-4">
                <Link to="/login">Sign In</Link>
              </Button>
            }
          />
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : loading ? (
          <BlogFeed loading={true} />
        ) : liked.length > 0 ? (
          <BlogFeed blogs={liked} loading={false} />
        ) : (
          <EmptyState
            title="No liked articles yet"
            description="Like a few blogs and they will appear here."
            icon={<ThumbsUp className="h-8 w-8" />}
            action={
              <Button asChild className="mt-4">
                <Link to="/explore">Explore Blogs</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
