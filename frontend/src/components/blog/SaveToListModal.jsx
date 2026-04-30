import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Check, List, Plus, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuthStore } from "../../store/authStore";
import { addBlogToList, createList, getLists } from "../../services/listService";
import { cn } from "../../utils/cn";

export default function SaveToListModal({
  open,
  onClose,
  blogId,
  isSaved,
  onToggleSave,
}) {
  const { user } = useAuthStore();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(null);
  const [error, setError] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [addedLists, setAddedLists] = useState(() => new Set());

  const customLists = useMemo(
    () => (Array.isArray(lists) ? lists.filter((list) => !list.isDefault) : []),
    [lists]
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNewListName("");
    setAddedLists(new Set());

    if (!user) {
      setLists([]);
      return;
    }

    setLoading(true);
    getLists()
      .then((data) => setLists(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load lists"))
      .finally(() => setLoading(false));
  }, [open, user, blogId]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  async function handleCreateList(e) {
    e.preventDefault();
    const name = newListName.trim();
    if (!name || !blogId) return;

    setCreating(true);
    setError(null);
    try {
      const created = await createList(name);
      const nextList = { ...created, count: created?.count ?? 0, blogs: [] };
      setLists((prev) => [nextList, ...(Array.isArray(prev) ? prev : [])]);
      setNewListName("");

      await handleAddToList(created.id);
    } catch (err) {
      setError(err.message || "Failed to create list");
    } finally {
      setCreating(false);
    }
  }

  async function handleAddToList(listId) {
    if (!blogId || !listId) return;
    setAdding(listId);
    setError(null);
    try {
      await addBlogToList(listId, blogId);
      setAddedLists((prev) => {
        const next = new Set(prev);
        next.add(listId);
        return next;
      });
    } catch (err) {
      setError(err.message || "Failed to add to list");
    } finally {
      setAdding(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-label="Close save dialog"
      />

      <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl border bg-card shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <List className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Save this blog</p>
              <p className="text-xs text-muted-foreground">Choose where to keep it for later.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!user ? (
            <div className="rounded-xl border bg-secondary/30 p-4 text-sm text-muted-foreground">
              Sign in to save blogs and organize them into lists.
              <div className="mt-3 flex items-center gap-2">
                <Button asChild size="sm">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-secondary/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center",
                    isSaved ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                  )}>
                    <Bookmark className={cn("h-4 w-4", isSaved && "fill-primary")} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Reading list</p>
                    <p className="text-xs text-muted-foreground">Your default saved collection.</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isSaved ? "secondary" : "default"}
                  onClick={onToggleSave}
                >
                  {isSaved ? "Remove" : "Save"}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Add to list</p>
                    <p className="text-xs text-muted-foreground">Choose one of your custom lists.</p>
                  </div>
                  {loading && <span className="text-xs text-muted-foreground">Loading…</span>}
                </div>

                {customLists.length === 0 && !loading && (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    You don&apos;t have any custom lists yet. Create one below.
                  </div>
                )}

                <div className="space-y-2">
                  {customLists.map((list) => {
                    const isAdded = addedLists.has(list.id);
                    const isLoading = adding === list.id;

                    return (
                      <div
                        key={list.id}
                        className="flex items-center justify-between rounded-xl border bg-background/70 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{list.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {list.count ?? list.blogs?.length ?? 0} stories
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isAdded ? "secondary" : "default"}
                          onClick={() => handleAddToList(list.id)}
                          disabled={isLoading || isAdded}
                        >
                          {isAdded ? (
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" /> Added
                            </span>
                          ) : isLoading ? "Adding…" : "Add"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleCreateList} className="rounded-xl border bg-secondary/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold">Create a new list</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="List name"
                    className="h-10"
                  />
                  <Button type="submit" size="sm" isLoading={creating}>
                    Create
                  </Button>
                </div>
              </form>

              {error && <p className="text-xs text-destructive">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
