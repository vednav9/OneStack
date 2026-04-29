import { Share2, Bookmark, ExternalLink, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useBlogStore } from "../../store/blogStore";
import { formatDate } from "../../utils/formatDate";
import { readingTime } from "../../utils/readingTime";
import Tag from "../ui/Tag";

export default function BlogHeader({ blog }) {
  const { savedBlogs, toggleSave } = useBlogStore();
  const isSaved = savedBlogs.includes(blog.id);

  const date = formatDate(blog.publishedAt || blog.createdAt, "long");
  const estRead = readingTime(blog.content || blog.description || "");
  const company = blog.company || blog.source?.name || "";
  const tags = blog.tags || [];

  const handleShare = async () => {
    try {
      await navigator.share({
        title: blog.title,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <header className="space-y-6 mb-10">
      {/* Tags / category */}
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              to={`/topic/${tag.toLowerCase().replace(/ /g, "-")}`}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
        {blog.title}
      </h1>

      {/* Description / subtitle */}
      {blog.description && (
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {blog.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-y py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {(blog.author?.name || company || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-sm">{blog.author?.name || company || "Anonymous"}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{date}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {estRead}
              </span>
              {company && (
                <>
                  <span>·</span>
                  <span>{company}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Save */}
          <Button
            id="save-article-btn"
            variant="ghost"
            size="icon"
            onClick={() => toggleSave(blog.id)}
            aria-label={isSaved ? "Unsave article" : "Save article"}
            title={isSaved ? "Saved" : "Save to reading list"}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-primary text-primary" : ""}`} />
          </Button>

          {/* Share */}
          <Button
            id="share-article-btn"
            variant="ghost"
            size="icon"
            onClick={handleShare}
            aria-label="Share article"
            title="Share article"
          >
            <Share2 className="h-5 w-5" />
          </Button>

          {/* Open original */}
          {blog.url && (
            <Button
              id="open-original-btn"
              variant="ghost"
              size="icon"
              asChild
            >
              <a href={blog.url} target="_blank" rel="noopener noreferrer" title="Open original source">
                <ExternalLink className="h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Cover image */}
      {(blog.coverImage || blog.thumbnail) && (
        <div className="aspect-video relative rounded-xl overflow-hidden border shadow-sm">
          <img
            src={blog.coverImage || blog.thumbnail}
            alt={blog.title}
            className="object-cover w-full h-full"
            loading="eager"
          />
        </div>
      )}
    </header>
  );
}
