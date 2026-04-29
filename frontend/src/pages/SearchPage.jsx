import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import BlogFeed from "../components/blog/BlogFeed";
import SearchBar from "../components/search/SearchBar";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { searchBlogs } from "../services/searchService";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useDocumentTitle(query ? `Search: ${query}` : "Search");

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchBlogs(query)
      .then((data) => {
        if (!cancelled) {
          // Normalize — backend returns raw rows from raw query
          const blogs = Array.isArray(data) ? data : data?.results || [];
          setResults(blogs);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Search failed.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b pb-8 mb-8">
        <div className="flex flex-col gap-6">
          <div className="w-full max-w-2xl">
            <SearchBar initialQuery={query} autoFocus className="mb-2" />
          </div>

          <div className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold tracking-tight">
              {query ? `Results for "${query}"` : "Search OneStack"}
            </h1>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
          </div>

          {query && !loading && (
            <p className="text-muted-foreground">
              Found {results.length} engineering {results.length === 1 ? "blog" : "blogs"}.
            </p>
          )}
        </div>
      </header>

      <div className="min-h-[500px]">
        {error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : loading ? (
          <BlogFeed loading={true} />
        ) : query ? (
          <BlogFeed blogs={results} loading={false} />
        ) : (
          <div className="text-center py-20 text-muted-foreground max-w-sm mx-auto">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              Enter a keyword to search through thousands of engineering blogs, system architectures, and technical deep-dives.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
