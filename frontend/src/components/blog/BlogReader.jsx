import { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";
import { useReadingStore } from "../../store/readingStore";

export default function BlogReader({ content, className }) {
  const { fontSize } = useReadingStore();
  const articleRef = useRef(null);

  // Reading progress bar
  useEffect(() => {
    const progressBar = document.createElement("div");
    progressBar.className = "reading-progress";
    progressBar.id = "reading-progress-bar";
    document.body.appendChild(progressBar);

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      progressBar.remove();
    };
  }, []);

  if (!content) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No content available for this article.</p>
      </div>
    );
  }

  return (
    <div
      ref={articleRef}
      className={cn("prose-reading max-w-none", className)}
      style={{ fontSize: `${fontSize}px` }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}