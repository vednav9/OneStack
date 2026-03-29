import { Link } from "react-router-dom";
import { ExternalLink, Clock } from "lucide-react";
import { readingTime } from "../../utils/readingTime";
import { formatDate } from "../../utils/formatDate";

export default function SuggestedBlogs({ blogs = [] }) {
  if (!blogs.length) return null;

  return (
    <section className="mt-14 pt-8 border-t">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.slice(0, 3).map((blog) => (
          <Link
            key={blog.id}
            to={`/blog/${blog.id}`}
            id={`suggested-${blog.id}`}
            className="group block p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200"
          >
            {/* Company / source */}
            {(blog.company || blog.source?.name) && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-[9px] font-bold">
                    {(blog.company || blog.source?.name).charAt(0)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {blog.company || blog.source?.name}
                </span>
              </div>
            )}

            <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {blog.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
              <Clock className="h-3 w-3" />
              <span>{readingTime(blog.content || blog.description || "")}</span>
              <span>·</span>
              <span>{formatDate(blog.publishedAt || blog.createdAt, "relative")}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}