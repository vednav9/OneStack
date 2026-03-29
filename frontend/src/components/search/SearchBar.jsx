import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

export default function SearchBar({ className, initialQuery = "", autoFocus = false }) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
    document.getElementById("search-input-field")?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // CMD + K or CTRL + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("search-input-field")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <form
      id="search-form"
      onSubmit={handleSearch}
      className={cn(
        "relative flex items-center transition-all duration-200",
        className
      )}
    >
      <div
        className={cn(
          "absolute left-3 p-1 rounded-md transition-colors",
          isFocused ? "text-primary bg-primary/10" : "text-muted-foreground"
        )}
      >
        <Search className="h-4 w-4" />
      </div>
      
      <input
        id="search-input-field"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        placeholder="Search for tags, authors, or companies..."
        className={cn(
          "h-12 w-full rounded-xl border bg-card pl-11 pr-10 text-sm shadow-sm transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary",
          isFocused ? "border-primary" : "border-border"
        )}
      />

      {!query && !isFocused && (
        <div className="absolute right-4 hidden sm:flex items-center gap-1 opacity-50 pointer-events-none">
          <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-semibold border rounded-md shadow-[0_2px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_2px_0_0_rgba(255,255,255,0.1)] bg-background">⌘</kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-semibold border rounded-md shadow-[0_2px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_2px_0_0_rgba(255,255,255,0.1)] bg-background">K</kbd>
        </div>
      )}

      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}