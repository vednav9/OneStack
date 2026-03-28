import { Link } from "react-router-dom";
import { Bookmark, Clock, ThumbsUp, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useBlogStore } from "../../store/blogStore";
import { formatDate } from "../../utils/formatDate";
import { readingTime } from "../../utils/readingTime";
import Tag from "../ui/Tag";

export default function BlogCard({ blog }) {
  const { savedBlogs, likedBlogs, toggleSave, toggleLike } = useBlogStore();
  const isSaved = savedBlogs.includes(blog.id);
  const isLiked = likedBlogs.includes(blog.id);

  const date = formatDate(blog.publishedAt || blog.createdAt, "relative");
  const estRead = readingTime(blog.content || blog.description || "");
  const tags = (blog.tags || []).slice(0, 3);
  const company = blog.company || blog.source?.name || "";

  return (
    <article
      id={`blog-card-${blog.id}`}
      className="group relative p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 animate-fade-in"
    >
      {/* Company badge */}
      {company && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-[9px] font-bold">{company.charAt(0)}</span>
            </div>
            {company}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Text content */}
        <div className="flex-1 min-w-0">
          {/* Author */}
          {blog.author && (
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={blog.author?.image} alt={blog.author?.name} />
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                  {(blog.author?.name || "?").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-muted-foreground">
                {blog.author?.name || "Anonymous"}
              </span>
              {!company && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{date}</span>
                </>
              )}
            </div>
          )}

          {/* Title */}
          <Link
            to={`/blog/${blog.id}`}
            id={`blog-link-${blog.id}`}
            className="block group/title"
          >
            <h2 className="text-base font-bold leading-snug mb-1.5 group-hover/title:text-primary transition-colors line-clamp-2">
              {blog.title}
            </h2>
          </Link>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {blog.description ||
              (blog.content && blog.content.substring(0, 150)) ||
              "Read this engineering blog to learn more."}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
              {blog.url && (
                <a
                  href={blog.url}
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
        {blog.coverImage && (
          <Link to={`/blog/${blog.id}`} className="shrink-0 hidden sm:block">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border">
              <img
                src={blog.coverImage}
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
