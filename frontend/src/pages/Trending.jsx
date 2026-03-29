import useBlogs from "../hooks/useBlogs";
import BlogFeed from "../components/blog/BlogFeed";
import { Flame } from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Trending() {
  useDocumentTitle("Trending");
  // useBlogs("trending") hits /recommendation/trending which the backend already
  // sorts by (likedBy + history count), so no extra client-side sort needed.
  const { blogs, loading, error, refresh } = useBlogs("trending");

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b pb-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Flame className="h-6 w-6 text-red-500 fill-red-500/20 animate-pulse-red" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Trending Now</h1>
        </div>
        <p className="text-muted-foreground">
          The most popular engineering blogs being read right now.
        </p>
      </header>

      <div className="min-h-[500px]">
        {error ? (
          <div className="text-center py-20 border rounded-xl bg-destructive/5">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-background border rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <BlogFeed loading={true} />
        ) : (
          <div className="space-y-6">
            {blogs.map((blog, index) => (
              <div key={blog.id} className="relative group">
                {/* Ranking number */}
                <span className="absolute -left-12 top-4 text-3xl font-extrabold text-muted-foreground/30 group-hover:text-primary/50 transition-colors hidden md:block">
                  #{(index + 1).toString().padStart(2, "0")}
                </span>
                <BlogFeed blogs={[blog]} loading={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
