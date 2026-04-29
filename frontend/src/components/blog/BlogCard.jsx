import { useNavigate } from "react-router-dom";
import { Bookmark, Clock, ThumbsUp, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import { useBlogStore } from "../../store/blogStore";
import { formatDate } from "../../utils/formatDate";
import { readingTime } from "../../utils/readingTime";
import Tag from "../ui/Tag";

export default function BlogCard({ blog }) {
  const navigate = useNavigate();
  const { savedBlogs, likedBlogs, toggleSave, toggleLike } = useBlogStore();
  const isSaved = savedBlogs.includes(blog.id);
  const isLiked = likedBlogs.includes(blog.id);

  const estRead = readingTime(blog.content || blog.description || "");
  const tags = (blog.tags || []).slice(0, 3);
  const originalUrl = blog.url || blog.sourceURL;
  const publishedAt = blog.publishedAt || blog.createdAt;
  const publishedDate = publishedAt ? formatDate(publishedAt, "short") : null;
  const thumbnail = blog.coverImage || blog.thumbnail;
  const authorName = typeof blog.author === "string" ? blog.author : blog.author?.name;
  const hasAuthor = typeof authorName === "string" && authorName.trim() !== "" && authorName.trim().toLowerCase() !== "null";
  
  let faviconUrl = "";
  if (originalUrl) {
    try {
      const urlObj = new URL(originalUrl);
      faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${urlObj.hostname}`;
    } catch {
      faviconUrl = "";
    }
  }

  const sourceLabel =
    blog.company ||
    blog.source?.name ||
    blog.sourceSite ||
    (() => {
      if (!originalUrl) return "";
      try {
        const urlObj = new URL(originalUrl);
        const host = urlObj.hostname.replace(/^www\./, "");
        const mainPart = host.split(".")[0];
        return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
      } catch {
        return "";
      }
    })();

  return (
    <article
      id={`blog-card-${blog.id}`}
      className="group relative overflow-hidden rounded-2xl border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/blog/${blog.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/blog/${blog.id}`);
        }
      }}
    >

      <div className="relative z-10">
        {/* Thumbnail */}
        {thumbnail && (
          <div className="relative">
            <div className="h-52 sm:h-60 md:h-64 lg:h-72 w-full overflow-hidden">
              <img
                src={thumbnail}
                alt={blog.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          </div>
        )}

        {/* Text content */}
        <div className="relative z-10 min-w-0 p-5 md:p-6">
          {(publishedDate || sourceLabel) && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
              {publishedDate && <span>{publishedDate}</span>}
              {publishedDate && sourceLabel && <span className="opacity-50">·</span>}
              {sourceLabel && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground shadow-sm pointer-events-auto transition-colors hover:bg-secondary/80">
                  {faviconUrl && (
                    <img src={faviconUrl} alt="favicon" className="w-3.5 h-3.5 rounded-sm bg-white" />
                  )}
                  {originalUrl ? (
                    <a
                      href={originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {sourceLabel}
                    </a>
                  ) : (
                    <span>{sourceLabel}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h2>

          {hasAuthor && (
            <div className="mt-2 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {(authorName || "?").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-muted-foreground">
                {authorName}
              </span>
            </div>
          )}

          {blog.description && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {blog.description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-3">
              {tags.map((tag) => (
                <span key={tag} onClick={(e) => e.stopPropagation()} className="pointer-events-auto">
                  <Tag
                    label={tag}
                    to={`/topic/${tag.toLowerCase().replace(/ /g, "-")}`}
                  />
                </span>
              ))}
            </div>
          )}

          {/* Footer row */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground pointer-events-none">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {estRead}
              </span>
              {blog.likes !== undefined && (
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {blog.likes || 0}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Like */}
              <button
                id={`like-btn-${blog.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleLike(blog.id);
                }}
                className={`p-1.5 rounded-md transition-all hover:bg-secondary ${
                  isLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>

              {/* Save */}
              <button
                id={`save-btn-${blog.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSave(blog.id);
                }}
                className={`p-1.5 rounded-md transition-all hover:bg-secondary ${
                  isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={isSaved ? "Unsave" : "Save"}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-primary" : ""}`} />
              </button>

              {/* Open original */}
              {originalUrl && (
                <a
                  href={originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`external-link-${blog.id}`}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  aria-label="Open original"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
