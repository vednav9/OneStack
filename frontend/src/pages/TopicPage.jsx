import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import BlogFeed from "../components/blog/BlogFeed";
import { Hash, Compass } from "lucide-react";
import { Button } from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { getBlogsByTag } from "../services/searchService";

export default function TopicPage() {
  const { topic } = useParams();
  const formattedTopic = topic
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  useDocumentTitle(`${formattedTopic} Articles`);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getBlogsByTag(formattedTopic)
      .then((data) => {
        const arr = Array.isArray(data) ? data : data?.results || [];
        setBlogs(arr);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [formattedTopic]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b pb-8 mb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link to="/explore" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <Compass className="h-3 w-3" /> Explore
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Topics</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary rounded-xl text-muted-foreground border">
              <Hash className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{formattedTopic}</h1>
          </div>

          <Button className="shrink-0 w-full md:w-auto h-11 px-8">Follow Topic</Button>
        </div>
      </header>

      <div className="min-h-[500px]">
        {error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : loading ? (
          <BlogFeed loading={true} />
        ) : blogs.length > 0 ? (
          <BlogFeed blogs={blogs} loading={false} />
        ) : (
          <div className="text-center py-20 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
              <Hash className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No stories yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
              We couldn't find any blogs tagged with "{formattedTopic}".
            </p>
            <Button asChild size="lg">
              <Link to="/explore">Explore All Topics</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
