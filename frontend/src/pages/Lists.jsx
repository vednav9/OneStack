import { useState, useEffect } from "react";
import { List as ListIcon, Plus, Trash2, Lock, Globe, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuthStore } from "../store/authStore";
import { getLists, createList, deleteList } from "../services/listService";
import { Link } from "react-router-dom";

export default function Lists() {
  useDocumentTitle("My Lists");
  const { user } = useAuthStore();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadLists();
  }, [user]);

  function loadLists() {
    setLoading(true);
    getLists()
      .then((data) => setLists(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreating(true);
    try {
      const created = await createList(newListName.trim());
      setLists((prev) => [{ ...created, count: 0, blogs: [] }, ...prev]);
      setNewListName("");
      setShowInput(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b pb-6 mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <ListIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Your Lists</h1>
          </div>
          <p className="text-muted-foreground">Curated collections of engineering blogs.</p>
        </div>
        {user && (
          <Button className="hidden sm:flex" onClick={() => setShowInput(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create List
          </Button>
        )}
      </header>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {/* Create list input */}
      {showInput && (
        <form onSubmit={handleCreate} className="flex gap-2 max-w-md animate-slide-up">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name…"
            autoFocus
            className="flex-1 h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button type="submit" size="sm" isLoading={creating}>
            Create
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowInput(false)}>
            Cancel
          </Button>
        </form>
      )}

      {!user ? (
        <EmptyState
          title="Sign in to manage lists"
          description="Save and organise your favourite engineering blogs into curated lists."
          icon={<ListIcon className="h-8 w-8" />}
          action={
            <Button asChild className="mt-4">
              <Link to="/login">Sign In</Link>
            </Button>
          }
        />
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create new — always visible */}
          <button
            onClick={() => setShowInput(true)}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:border-muted-foreground/50 transition-colors h-[180px]"
          >
            <div className="p-3 bg-background rounded-full mb-3 shadow-sm border border-border">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-medium text-sm">Create new list</span>
          </button>

          {lists.map((list) => (
            <Card
              key={list.id}
              className="hover:border-primary/50 transition-colors cursor-pointer group h-[180px] flex flex-col relative overflow-hidden"
            >
              {/* Gradient top bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 to-transparent group-hover:from-primary/50 transition-colors" />

              <CardHeader className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    <Lock className="h-3 w-3" /> Private
                  </span>
                  <button
                    onClick={() => handleDelete(list.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    title="Delete list"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">{list.name}</CardTitle>
                <CardDescription className="mt-2 line-clamp-2">
                  A curated collection of engineering blogs about {list.name.toLowerCase()}.
                </CardDescription>
              </CardHeader>
              <CardFooter className="py-4 border-t bg-secondary/20">
                <p className="text-xs text-muted-foreground">{list.count ?? list.blogs?.length ?? 0} stories saved</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
