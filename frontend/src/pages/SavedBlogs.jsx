import { Bookmark } from "lucide-react";
import { useBlogStore } from "../store/blogStore";
import useBlogs from "../hooks/useBlogs";
import BlogFeed from "../components/blog/BlogFeed";
import EmptyState from "../components/ui/EmptyState";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function SavedBlogs() {
  const { savedBlogs } = useBlogStore();
  const { blogs, loading } = useBlogs();

  const saved = blogs.filter((blog) => savedBlogs.includes(blog.id));

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
          <p className="text-muted-foreground">
            Your personal reading list of engineering blogs.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{saved.length}</span>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">SAVED</p>
        </div>
      </header>

      <div className="min-h-[500px]">
        {loading ? (
          <BlogFeed loading={true} />
        ) : saved.length > 0 ? (
          <BlogFeed blogs={saved} loading={false} />
        ) : (
          <EmptyState
            title="Your reading list is empty"
            description="When you discover an interesting engineering blog you'd like to read later, save it and it will appear here."
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
