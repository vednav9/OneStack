import { useState, useEffect } from "react";
import { List as ListIcon } from "lucide-react";
import BlogFeed from "../components/blog/BlogFeed";
import EmptyState from "../components/ui/EmptyState";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuthStore } from "../store/authStore";
import { getLists } from "../services/listService";

export default function ListDetail() {
  const { listId } = useParams();
  const { user } = useAuthStore();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentTitle(list?.name ? `${list.name} | List` : "List");

  useEffect(() => {
    if (!user) return;

    getLists()
      .then((data) => {
        const lists = Array.isArray(data) ? data : [];
        const found = lists.find((item) => item.id === listId);
        setList(found || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, listId]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b pb-6 mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ListIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{list?.name || "List"}</h1>
          </div>
          <p className="text-muted-foreground">Blogs in this collection.</p>
        </div>
        {!loading && list && (
          <div className="text-right">
            <span className="text-2xl font-bold">{Array.isArray(list.blogs) ? list.blogs.length : 0}</span>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">STORIES</p>
          </div>
        )}
      </header>

      <div className="min-h-[500px]">
        {!user && !loading ? (
          <EmptyState
            title="Sign in to view lists"
            description="Your lists are tied to your account."
            icon={<ListIcon className="h-8 w-8" />}
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
        ) : !list ? (
          <EmptyState
            title="List not found"
            description="This list may have been removed."
            icon={<ListIcon className="h-8 w-8" />}
            action={
              <Button asChild className="mt-4">
                <Link to="/lists">Back to Lists</Link>
              </Button>
            }
          />
        ) : Array.isArray(list.blogs) && list.blogs.length > 0 ? (
          <BlogFeed blogs={list.blogs} loading={false} />
        ) : (
          <EmptyState
            title="This list is empty"
            description="Add or save blogs to see them here."
            icon={<ListIcon className="h-8 w-8" />}
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
