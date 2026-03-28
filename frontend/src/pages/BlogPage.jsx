import { useParams, Link } from "react-router-dom";
import BlogHeader from "../components/blog/BlogHeader";
import BlogReader from "../components/blog/BlogReader";
import BlogActions from "../components/blog/BlogActions";
import SuggestedBlogs from "../components/blog/SuggestedBlogs";
import ReadingControls from "../components/blog/ReadingControls";
import { Skeleton } from "../components/ui/Skeleton";
import useBlog from "../hooks/useBlog";
import useBlogs from "../hooks/useBlogs";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function BlogPage() {
  const { id } = useParams();
  const { blog, loading, error, refresh } = useBlog(id);

  // Fetch suggested
  const { blogs: allBlogs } = useBlogs();
  const suggested = allBlogs.filter((b) => b.id !== id).slice(0, 3);

  if (loading) {
    return (
      <div className="container max-w-[800px] mx-auto py-10 px-4 animate-pulse">
        <Skeleton className="h-4 w-32 mb-8" />
        <Skeleton className="h-12 w-4/5 mb-6" />
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="aspect-video w-full rounded-xl mb-10" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 animate-fade-in">
        <div className="p-6 rounded-full bg-destructive/10 text-destructive">
          <RefreshCw className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold">Article Unavailable</h1>
        <p className="text-muted-foreground max-w-sm">
          {error || "The article you are looking for does not exist or has been removed."}
        </p>
        <div className="flex gap-4 mt-4">
          <Button variant="outline" onClick={refresh}>Try Again</Button>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className="container max-w-[800px] mx-auto py-6 md:py-10 px-4 md:px-6 animate-fade-in">
      {/* Back navigation & Reading controls row */}
      <div className="flex items-center justify-between mb-8 sticky top-[4.5rem] z-10 bg-background/95 backdrop-blur-md py-4 border-b -mx-4 px-4 md:-mx-6 md:px-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground group transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </Link>
        <ReadingControls />
      </div>

      <BlogHeader blog={blog} />
      
      {/* Reader Mode wrapper */}
      <div className="mt-8 relative">
        <BlogReader content={blog.content || blog.description} />
      </div>

      {/* Action bar */}
      <BlogActions
        blogId={blog.id}
        blogUrl={blog.url}
      />

      {/* Suggested */}
      <SuggestedBlogs blogs={suggested} />
    </article>
  );
}