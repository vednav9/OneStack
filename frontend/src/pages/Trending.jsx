import useBlogs from "../hooks/useBlogs";
import BlogFeed from "../components/blog/BlogFeed";
import { TrendingUp, Flame } from "lucide-react";

export default function Trending() {
  const { blogs, loading } = useBlogs("trending");

  // In a real app the API would return these sorted by trending score
  const trendingBlogs = [...blogs].sort((a, b) => (b.likes || 0) - (a.likes || 0));

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
        {loading ? (
          <BlogFeed loading={true} />
        ) : (
          <div className="space-y-6">
            {trendingBlogs.map((blog, index) => (
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
