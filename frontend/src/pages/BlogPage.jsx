import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import BlogHeader from "../components/blog/BlogHeader";
import BlogActions from "../components/blog/BlogActions";
import SuggestedBlogs from "../components/blog/SuggestedBlogs";
import ReadingControls from "../components/blog/ReadingControls";
import { Skeleton } from "../components/ui/Skeleton";
import useBlog from "../hooks/useBlog";
import useBlogs from "../hooks/useBlogs";
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Zap,
  Sparkles,
  List,
  AlignLeft,
  ChevronDown,
  Lightbulb,
  Globe,
  WandSparkles,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";
import { useReadingStore } from "../store/readingStore";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuthStore } from "../store/authStore";
import * as blogService from "../services/blogService";


// ─── AI Summary Panel ─────────────────────────────────────────────────────────
// Border technique:
//   .ai-border-wrap has overflow:hidden + padding:2px + background = border track.
//   ::before is an oversized (300%×300%) square centred behind the wrapper.
//   Its conic-gradient is mostly transparent — only a narrow ~40deg red arc.
//   overflow:hidden clips the interior, so only the 2px edge strip is visible.
//   @property --ai-angle gives true linear angular interpolation → constant speed
//   on all four sides with zero police-light / interior-sweep effect.

function AISummaryPanel({ blogId }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [triggered, setTriggered]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [summary, setSummary]       = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [summaryView, setSummaryView]     = useState("paragraph");
  const [showTakeaways, setShowTakeaways] = useState(false);

  useEffect(() => {
    setIsOpen(false);
    setTriggered(false);
    setLoading(false);
    setSummary(null);
    setFetchError(false);
    setSummaryView("paragraph");
    setShowTakeaways(false);
  }, [blogId]);

  const borderClass = loading ? "is-loading" : summary ? "is-done" : "";

  async function handleToggle() {
    if (isOpen) { setIsOpen(false); return; }
    setIsOpen(true);
    if (!triggered && !loading) {
      setTriggered(true);
      setLoading(true);
      setFetchError(false);
      try {
        const data = await blogService.getBlogSummary(blogId);
        setSummary(data);
      } catch {
        setFetchError(true);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleRetry() {
    setTriggered(true);
    setFetchError(false);
    setSummary(null);
    setLoading(true);
    try {
      const data = await blogService.getBlogSummary(blogId);
      setSummary(data);
    } catch {
      setFetchError(true);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  const hasSummary   = Boolean(summary);
  const hasKeyPoints = Array.isArray(summary?.keyPoints) && summary.keyPoints.length > 0;
  const hasTakeaways = Array.isArray(summary?.takeaways) && summary.takeaways.length > 0;

  return (
    <div className="mb-8">
      {/* overflow:hidden on .ai-border-wrap clips ::before to border-only */}
      <div className={cn("ai-border-wrap", borderClass, !isOpen && "ai-glow")}>

        {/* Trigger button */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "w-full flex items-center gap-3 px-5 py-4 rounded-[calc(1rem-2px)] text-left",
            "bg-card transition-all duration-300",
            isOpen ? "rounded-b-none" : "hover:bg-secondary/40"
          )}
        >
          {/* Icon */}
          <div className={cn(
            "relative p-2 rounded-lg transition-all duration-300",
            loading ? "bg-primary/15" : isOpen ? "bg-primary/10" : "bg-gradient-to-br from-primary/20 to-primary/5"
          )}>
            {loading
              ? <WandSparkles className="h-4 w-4 text-primary animate-pulse" />
              : <Sparkles className={cn("h-4 w-4 text-primary transition-transform duration-300", isOpen && "scale-110")} />
            }
            {loading && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-ping" />
            )}
          </div>

          {/* Label */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold tracking-wide text-foreground">AI Summary</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {loading
                ? "Summarizing with GPT-4o mini…"
                : triggered && hasSummary
                ? "Powered by GPT-4o mini · Click to collapse"
                : triggered && fetchError
                ? "Summary failed — click to retry"
                : "Click to generate an instant summary"}
            </p>
          </div>

          {/* Status badge */}
          <span className={cn(
            "hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all",
            loading   ? "border-primary/30 bg-primary/10 text-primary"
            : hasSummary ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
            : fetchError ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-border bg-secondary/60 text-muted-foreground"
          )}>
            {loading ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Generating</>
            ) : hasSummary ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Ready</>
            ) : fetchError ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-destructive" />Error</>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />Generate</>
            )}
          </span>

          {/* Chevron */}
          <div className={cn("transition-transform duration-300", isOpen ? "rotate-180" : "")}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>

        {/* Expandable content */}
        {isOpen && (
          <div className="bg-card rounded-b-[calc(1rem-2px)] border-t border-border/60 overflow-hidden animate-slide-up">

            {/* Loading skeleton */}
            {loading && (
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 animate-pulse" />
                  <div className="h-3 w-16 bg-primary/10 rounded animate-pulse" />
                </div>
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[95%]" />
                  <Skeleton className="h-4 w-[88%]" />
                  <Skeleton className="h-4 w-[72%]" />
                </div>
                <div className="border-t pt-4 space-y-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" />
                      <Skeleton className={cn("h-3", i % 2 === 0 ? "w-[85%]" : "w-full")} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {!loading && fetchError && (
              <div className="p-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <Sparkles className="h-5 w-5 text-destructive/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Couldn't generate summary. The article may be too short or unavailable.
                </p>
                <button
                  onClick={handleRetry}
                  className="text-xs px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/70 font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Summary content */}
            {!loading && hasSummary && (
              <div className="p-5 space-y-4 animate-fade-in">

                {/* View toggle */}
                {hasKeyPoints && summary.shortParagraph && (
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">View as</p>
                    <div className="flex items-center bg-secondary/70 rounded-lg p-0.5 gap-0.5">
                      <button
                        onClick={() => setSummaryView("paragraph")}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                          summaryView === "paragraph"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <AlignLeft className="h-3 w-3" />Paragraph
                      </button>
                      <button
                        onClick={() => setSummaryView("bullets")}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                          summaryView === "bullets"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <List className="h-3 w-3" />Points
                      </button>
                    </div>
                  </div>
                )}

                {/* TL;DR */}
                {summary.tldr && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.12em] mb-1.5 flex items-center gap-1.5">
                      <Zap className="h-3 w-3" /> TL;DR
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-foreground">{summary.tldr}</p>
                  </div>
                )}

                {/* Paragraph view */}
                {summaryView === "paragraph" && summary.shortParagraph && (
                  <div className="animate-fade-in">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2 text-blue-500">Overview</p>
                    <p className="text-sm text-muted-foreground leading-[1.85]">{summary.shortParagraph}</p>
                  </div>
                )}

                {/* Bullets view */}
                {summaryView === "bullets" && hasKeyPoints && (
                  <div className="animate-fade-in">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3 text-emerald-500">Key Points</p>
                    <ul className="space-y-2.5">
                      {summary.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground group/item">
                          <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 group-hover/item:scale-125 transition-transform" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Takeaways */}
                {hasTakeaways && (
                  <div className="border-t pt-3">
                    <button
                      onClick={() => setShowTakeaways(v => !v)}
                      className="flex items-center gap-2 text-xs font-semibold w-full hover:text-foreground transition-colors text-muted-foreground"
                    >
                      <span className="text-amber-500 uppercase tracking-[0.12em] text-[10px]">Takeaways</span>
                      <span className="text-muted-foreground/60 text-[10px]">({summary.takeaways.length})</span>
                      <div className={cn("ml-auto transition-transform duration-200", showTakeaways ? "rotate-180" : "")}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </button>
                    {showTakeaways && (
                      <ul className="mt-3 space-y-2 animate-fade-in">
                        {summary.takeaways.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Content Viewer ──────────────────────────────────────────────────────────

function ContentViewer({ blog, fontSize }) {
  const [activePane, setActivePane]     = useState("live");
  const [liveContent, setLiveContent]   = useState(null);
  const [liveLoading, setLiveLoading]   = useState(false);
  const [liveError, setLiveError]       = useState(null);
  const [embedStatus, setEmbedStatus]   = useState(null);
  const [embedLoading, setEmbedLoading] = useState(false);

  const sourceUrl = blog?.sourceURL || blog?.url || "";

  const fetchLiveContent = useCallback(async () => {
    if (!blog?.id) return;
    setLiveLoading(true);
    setLiveError(null);
    try {
      const data = await blogService.getBlogContent(blog.id);
      setLiveContent(data?.content || null);
    } catch {
      setLiveError("Could not fetch live content. The source site may be unavailable.");
    } finally {
      setLiveLoading(false);
    }
  }, [blog?.id]);

  useEffect(() => { fetchLiveContent(); }, [fetchLiveContent]);
  useEffect(() => { setActivePane("live"); }, [blog?.id]);

  useEffect(() => {
    if (!blog?.id || activePane !== "iframe") return;
    let cancelled = false;
    setEmbedLoading(true);
    setEmbedStatus(null);
    blogService.getBlogEmbedStatus(blog.id)
      .then(s  => { if (!cancelled) setEmbedStatus(s); })
      .catch(() => { if (!cancelled) setEmbedStatus({ embeddable: false, reason: "check_failed" }); })
      .finally(() => { if (!cancelled) setEmbedLoading(false); });
    return () => { cancelled = true; };
  }, [blog?.id, activePane]);

  const showIframe = activePane === "iframe";
  const iframeBlocked = showIframe && !embedLoading && (!sourceUrl || !embedStatus?.embeddable);
  const iframeBlockedMessage = !sourceUrl
    ? "Source URL is unavailable for this article."
    : "This website blocks iframe embedding. Open the original article in a new tab.";

  const liveContentPanel = (
    <div className="min-h-[200px]">
      {liveLoading && (
        <div className="space-y-4 animate-pulse py-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      )}
      {!liveLoading && liveError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
          <Globe className="h-10 w-10 text-destructive/40 mx-auto" />
          <p className="text-sm text-destructive/70 font-medium">{liveError}</p>
          <button onClick={fetchLiveContent} className="text-xs px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-colors">
            Try Again
          </button>
        </div>
      )}
      {!liveLoading && !liveError && liveContent && (
        <div
          className="prose-reading transition-all duration-300 ease-in-out"
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: liveContent }}
        />
      )}
      {!liveLoading && !liveError && !liveContent && (
        <div className="rounded-xl border bg-secondary/30 p-8 text-center space-y-3">
          <Globe className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Live content not available.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-secondary/30 p-2 rounded-2xl border shadow-sm backdrop-blur-sm">
        <div className="flex items-center bg-background/70 p-1 rounded-xl border shadow-inner gap-0.5 w-full sm:w-auto">
          <button
            onClick={() => setActivePane("live")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              activePane === "live"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Globe className="h-3.5 w-3.5" /><span>Live Fetch</span>
          </button>
          <button
            onClick={() => setActivePane("iframe")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              activePane === "iframe"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" /><span>IFrame</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground px-2">
          {activePane === "live" && (
            <span className="flex items-center gap-1">
              <span className={cn("w-1.5 h-1.5 rounded-full", liveLoading ? "bg-amber-400 animate-pulse" : "bg-blue-400")} />
              {liveLoading ? "Fetching from source..." : "Live from source"}
            </span>
          )}
          {activePane === "iframe" && !embedLoading && (
            <span className="flex items-center gap-1">
              <span className={cn("w-1.5 h-1.5 rounded-full", iframeBlocked ? "bg-muted-foreground/60" : "bg-emerald-400")} />
              {iframeBlocked ? "Embedding restricted" : "Iframe ready"}
            </span>
          )}
        </div>

        <a
          href={blog.sourceURL || blog.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border bg-background hover:bg-primary/5 hover:border-primary/30 hover:text-primary text-sm font-semibold transition-all shadow-sm group text-muted-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
          <span>Original Site</span>
        </a>
      </div>

      {!showIframe ? (
        <div className="animate-fade-in min-w-0">{liveContentPanel}</div>
      ) : (
        <div className="animate-fade-in rounded-2xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-secondary/20 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original Website</p>
            {!embedLoading && (
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", iframeBlocked ? "text-muted-foreground" : "text-emerald-500")}>
                {iframeBlocked ? "Restricted" : "Embeddable"}
              </span>
            )}
          </div>
          <div className={cn("relative min-h-[420px] h-[calc(100vh-10rem)] bg-muted/20", iframeBlocked ? "grayscale opacity-70" : "")}>
            {embedLoading ? (
              <div className="p-4 space-y-3 animate-pulse">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[92%]" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : iframeBlocked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-3">
                <Globe className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground max-w-xs">{iframeBlockedMessage}</p>
                {sourceUrl && (
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-4 py-2 rounded-lg border bg-background hover:bg-secondary transition-colors">
                    Open Original Site
                  </a>
                )}
              </div>
            ) : (
              <iframe
                src={sourceUrl}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title="Original article preview"
                loading="lazy"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Main BlogPage ────────────────────────────────────────────────────────────

export default function BlogPage() {
  const { id } = useParams();
  const { blog, loading, error, refresh } = useBlog(id);
  const { fontSize } = useReadingStore();
  const [readingProgress, setReadingProgress] = useState(0);

  useDocumentTitle(blog?.title);
  const { user } = useAuthStore();

  useEffect(() => {
    if (blog?.id && user) blogService.readBlog(blog.id).catch(() => {});
  }, [blog?.id, user]);

  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) setReadingProgress((window.scrollY / scrollHeight) * 100);
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const { blogs: allBlogs } = useBlogs();
  const suggested = allBlogs.filter(b => b.id !== id).slice(0, 3);

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
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 animate-fade-in">
        <div className="p-6 rounded-full bg-destructive/10 text-destructive shadow-inner">
          <RefreshCw className="h-10 w-10 animate-spin-slow" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Article Unavailable</h1>
        <p className="text-muted-foreground max-w-sm">
          {error || "The article you are looking for does not exist or has been removed."}
        </p>
        <div className="flex gap-4 mt-4">
          <Button variant="outline" onClick={refresh} className="rounded-full shadow-sm hover:shadow-md transition-shadow">
            Try Again
          </Button>
          <Button asChild className="rounded-full shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-primary to-red-600">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen pb-20 relative">
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-red-500 to-amber-500 z-[60] transition-all duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
      />

      <div className="container mx-auto max-w-[1400px] py-6 md:py-10 px-4 md:px-6 transition-all duration-500">
        <div className="flex items-center justify-between mb-8 sticky top-[3.5rem] md:top-[4rem] z-40 bg-background/80 backdrop-blur-xl py-3 border-b -mx-4 px-4 md:-mx-6 md:px-6 shadow-sm">
          <Link to="/"
            className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground group transition-colors px-2 py-1.5 rounded-lg hover:bg-secondary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <ReadingControls />
          </div>
        </div>

        <BlogHeader blog={blog} />

        <AISummaryPanel blogId={blog?.id} />

        <ContentViewer blog={blog} fontSize={fontSize} />

        <div className="mt-16">
          <BlogActions blog={blog} />
        </div>

        {suggested.length > 0 && (
          <div className="mt-20">
            <SuggestedBlogs blogs={suggested} />
          </div>
        )}
      </div>
    </article>
  );
}