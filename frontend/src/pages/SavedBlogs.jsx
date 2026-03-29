import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import BlogFeed from "../components/blog/BlogFeed";
import EmptyState from "../components/ui/EmptyState";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function SavedBlogs() {
  useDocumentTitle("Saved Articles");
  const { user } = useAuthStore();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get("/user/saved")
      .then((data) => {
        setSaved(Array.isArray(data) ? data : []);
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
              <Bookmark className="h-5 w-5 text-primary fill-primary/20" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Saved Articles</h1>
          </div>
          <p className="text-muted-foreground">Your personal reading list of engineering blogs.</p>
        </div>
        {!loading && (
          <div className="text-right">
            <span className="text-2xl font-bold">{saved.length}</span>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">SAVED</p>
          </div>
        )}
      </header>

      <div className="min-h-[500px]">
        {!user ? (
          <EmptyState
            title="Sign in to view saved articles"
            description="Your saved articles are tied to your account."
            icon={<Bookmark className="h-8 w-8" />}
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
        ) : saved.length > 0 ? (
          <BlogFeed blogs={saved} loading={false} />
        ) : (
          <EmptyState
            title="Your reading list is empty"
            description="When you discover an interesting engineering blog, save it and it will appear here."
            icon={<Bookmark className="h-8 w-8" />}
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
