import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import BlogCard from "./BlogCard";
import { Skeleton } from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import { BookOpen } from "lucide-react";

function BlogCardSkeleton() {
  return (
    <div className="p-5 rounded-xl border bg-card space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export default function BlogFeed({ blogs = [], loading = false, loadMore, hasMore = false }) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasMore && typeof loadMore === "function") {
      loadMore();
    }
  }, [inView, hasMore, loadMore]);

  if (loading && blogs.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!loading && blogs.length === 0) {
    return (
      <EmptyState
        title="No articles found"
        description="We couldn't find any articles here. Try exploring other topics or check back later."
        icon={<BookOpen className="h-6 w-6" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      {blogs.map((blog, i) => (
        <div
          key={blog.id ?? i}
          className="animate-slide-up"
          style={{ animationDelay: `${Math.min(i * 50, 300)}ms`, animationFillMode: "both" }}
        >
          <BlogCard blog={blog} />
        </div>
      ))}

      {/* Infinite scroll trigger */}
      <div ref={ref} className="h-4" aria-hidden="true" />

      {loading && blogs.length > 0 && (
        <div className="space-y-4">
          <BlogCardSkeleton />
          <BlogCardSkeleton />
        </div>
      )}
    </div>
  );
}