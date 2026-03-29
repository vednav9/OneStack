import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import BlogFeed from "../components/blog/BlogFeed";
import EmptyState from "../components/ui/EmptyState";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function History() {
  useDocumentTitle("Reading History");
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get("/user/history")
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b pb-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reading History</h1>
        </div>
        <p className="text-muted-foreground">Your recently read engineering blogs.</p>
      </header>

      <div className="min-h-[500px]">
        {!user ? (
          <EmptyState
            title="Sign in to view history"
            description="Your reading history is saved to your account."
            icon={<Clock className="h-8 w-8" />}
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
