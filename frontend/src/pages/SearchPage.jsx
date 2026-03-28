import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import BlogFeed from "../components/blog/BlogFeed";
import useBlogs from "../hooks/useBlogs";
import SearchBar from "../components/search/SearchBar";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { blogs, loading } = useBlogs();

  // Simple simulated search across title, description, company, and tags
  const lowercaseQuery = query.toLowerCase();
  const results = blogs.filter(
    (b) =>
      b.title?.toLowerCase().includes(lowercaseQuery) ||
      b.company?.toLowerCase().includes(lowercaseQuery) ||
      b.tags?.some((t) => t.toLowerCase().includes(lowercaseQuery)) ||
      b.description?.toLowerCase().includes(lowercaseQuery)
  );

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
              {query ? `Search results for "${query}"` : "Search BlogSphere"}
            </h1>
          </div>
          
          {query && (
            <p className="text-muted-foreground">
              Found {results.length} related engineering {results.length === 1 ? 'blog' : 'blogs'}.
            </p>
          )}
        </div>
      </header>

      <div className="min-h-[500px]">
        {loading ? (
          <BlogFeed loading={true} />
        ) : query ? (
          <BlogFeed blogs={results} loading={false} />
        ) : (
          <div className="text-center py-20 text-muted-foreground max-w-sm mx-auto">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Enter a keyword to search through thousands of engineering blogs, system architectures, and technical deep-dives.</p>
          </div>
        )}
      </div>
    </div>
  );
}
