import { Link } from "react-router-dom";
import { Bookmark, Clock, ThumbsUp, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { useBlogStore } from "../../store/blogStore";
import { formatDate } from "../../utils/formatDate";
import { readingTime } from "../../utils/readingTime";
import Tag from "../ui/Tag";

export default function BlogCard({ blog }) {
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
  const authorAvatar = typeof blog.author === "object" ? blog.author?.image : undefined;
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
      className="group relative p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 animate-fade-in"
    >
      <div className="flex gap-4">
        {/* Text content */}
        <div className="flex-1 min-w-0">
          {/* Author */}
          {hasAuthor && (
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Avatar className="h-5 w-5">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                  {(authorName || "?").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-muted-foreground">
                {authorName}
              </span>
            </div>
          )}

          {/* Stretched Invisible Link for Whole Card Clickability */}
          <Link to={`/blog/${blog.id}`} className="absolute inset-0 z-0" aria-label={`Read ${blog.title}`} />
          
          {/* Title */}
          <h2 className="text-base font-bold leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2 relative z-10 pointer-events-none">
            {blog.title}
          </h2>

          {(publishedDate || sourceLabel) && (
            <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground relative z-10 pointer-events-none">
              {publishedDate && <span>{publishedDate}</span>}
              {publishedDate && sourceLabel && <span className="opacity-50">·</span>}
              {sourceLabel && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground shadow-sm pointer-events-auto transition-colors hover:bg-secondary/80">
                  {faviconUrl && <img src={faviconUrl} alt="favicon" className="w-3.5 h-3.5 rounded-sm bg-white" />}
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

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3 relative z-10">
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  label={tag}
                  to={`/topic/${tag.toLowerCase().replace(/ /g, "-")}`}
                />
              ))}
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between gap-2 relative z-10">
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
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {thumbnail && (
          <Link to={`/blog/${blog.id}`} className="shrink-0 hidden sm:block">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border">
              <img
                src={thumbnail}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
