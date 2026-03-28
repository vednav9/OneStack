import { Clock } from "lucide-react";
import useBlogs from "../hooks/useBlogs";
import BlogFeed from "../components/blog/BlogFeed";
import EmptyState from "../components/ui/EmptyState";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function History() {
  const { blogs, loading } = useBlogs();

  // In a real app, this would fetch from a /history API.
  // We'll simulate by picking a few random ones.
  const history = blogs.slice(2, 5).sort(() => Math.random() - 0.5);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b pb-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reading History</h1>
        </div>
        <p className="text-muted-foreground">
          Your recently read engineering blogs.
        </p>
      </header>

      <div className="min-h-[500px]">
        {loading ? (
          <BlogFeed loading={true} />
        ) : history.length > 0 ? (
          <BlogFeed blogs={history} loading={false} />
        ) : (
          <EmptyState
            title="Your history is empty"
            description="You haven't read any engineering blogs yet."
            icon={<Clock className="h-8 w-8" />}
            action={
              <Button asChild className="mt-4">
                <Link to="/">Start Reading</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
