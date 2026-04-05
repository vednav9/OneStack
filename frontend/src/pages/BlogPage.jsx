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
  LayoutTemplate,
  ExternalLink,
  Zap,
  Sparkles,
  List,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Brain,
  Target,
  Lightbulb,
  Globe,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";
import { useReadingStore } from "../store/readingStore";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuthStore } from "../store/authStore";
import * as blogService from "../services/blogService";

// ─── AI Summary Panel ───────────────────────────────────────────────────────

function AISummaryPanel({ summary, loading }) {
  const [summaryView, setSummaryView] = useState("paragraph"); // "paragraph" | "bullets"
  const [showTakeaways, setShowTakeaways] = useState(false);

  if (loading) {
    return (
      <section className="mb-8 rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Brain className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-muted-foreground">AI Summary</h2>
          <span className="ml-auto text-xs text-muted-foreground animate-pulse">Generating…</span>
        </div>
        <div className="p-5 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      </section>
    );
  }

  if (!summary) {
    return (
      <section className="mb-8 rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-muted-foreground">AI Summary</h2>
        </div>
        <p className="p-5 text-sm text-muted-foreground">Summary unavailable for this article.</p>
      </section>
    );
  }

  const hasKeyPoints = Array.isArray(summary.keyPoints) && summary.keyPoints.length > 0;
  const hasTakeaways = Array.isArray(summary.takeaways) && summary.takeaways.length > 0;

  return (
    <section className="mb-8 rounded-2xl border bg-card overflow-hidden shadow-sm animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-foreground">AI Summary</h2>
          {summary.generatedBy === "gemini" && (
            <p className="text-[10px] text-muted-foreground mt-0.5">Powered by Gemini</p>
          )}
        </div>

        {/* Paragraph / Bullets toggle (only if we have both) */}
        {hasKeyPoints && summary.shortParagraph && (
          <div className="ml-auto flex items-center bg-secondary/60 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setSummaryView("paragraph")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                summaryView === "paragraph"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <AlignLeft className="h-3 w-3" />
              Paragraph
            </button>
            <button
              onClick={() => setSummaryView("bullets")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                summaryView === "bullets"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3 w-3" />
              Points
            </button>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* TL;DR */}
        {summary.tldr && (
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-3 w-3 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-1">TL;DR</p>
              <p className="text-sm font-medium leading-relaxed text-foreground">{summary.tldr}</p>
            </div>
          </div>
        )}

        {/* Divider */}
        {(summary.shortParagraph || hasKeyPoints) && (
          <div className="border-t" />
        )}

        {/* Paragraph view */}
        {summaryView === "paragraph" && summary.shortParagraph && (
          <div className="flex gap-3 animate-fade-in">
            <div className="mt-0.5 shrink-0">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlignLeft className="h-3 w-3 text-blue-500" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-widest mb-1">Overview</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{summary.shortParagraph}</p>
            </div>
          </div>
        )}

        {/* Bullets view */}
        {summaryView === "bullets" && hasKeyPoints && (
          <div className="flex gap-3 animate-fade-in">
            <div className="mt-0.5 shrink-0">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <List className="h-3 w-3 text-emerald-500" />
              </div>
            </div>
            <div className="w-full">
              <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-widest mb-2">Key Points</p>
              <ul className="space-y-2">
                {summary.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Takeaways toggle */}
        {hasTakeaways && (
          <>
            <div className="border-t" />
            <button
              onClick={() => setShowTakeaways((v) => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-full group"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Target className="h-3 w-3 text-amber-500" />
              </div>
              <span className="text-amber-500 uppercase tracking-widest text-[11px]">Takeaways</span>
              <span className="ml-1 text-muted-foreground text-[11px]">({summary.takeaways.length})</span>
              {showTakeaways
                ? <ChevronUp className="h-3.5 w-3.5 ml-auto" />
                : <ChevronDown className="h-3.5 w-3.5 ml-auto" />
              }
            </button>

            {showTakeaways && (
              <ul className="space-y-2 pl-7 animate-fade-in">
                {summary.takeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─── Content Viewer ──────────────────────────────────────────────────────────

function ContentViewer({ blog, fontSize, readerMode }) {
  const [viewMode, setViewMode] = useState("native"); // "native" | "live"
  const [liveContent, setLiveContent] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  const fetchLiveContent = useCallback(async () => {
    if (!blog?.id) return;
    setLiveLoading(true);
    setLiveError(null);
    try {
      const data = await blogService.getBlogContent(blog.id);
      setLiveContent(data?.content || null);
    } catch (err) {
      setLiveError("Could not fetch live content. The source site may be unavailable.");
    } finally {
      setLiveLoading(false);
    }
  }, [blog?.id]);

  const handleViewMode = (mode) => {
    setViewMode(mode);
    if (mode === "live" && !liveContent && !liveLoading) {
      fetchLiveContent();
    }
  };

  const contentHtml = blog.content || blog.description || "";

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-secondary/30 p-2 rounded-2xl border shadow-sm backdrop-blur-sm">
        <div className="flex items-center bg-background/70 p-1 rounded-xl border shadow-inner gap-0.5 w-full sm:w-auto">
          {/* Native (cached DB content) */}
          <button
            onClick={() => handleViewMode("native")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              viewMode === "native"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reader</span>
          </button>

          {/* Live Fetch (server-side scrape) */}
          <button
            onClick={() => handleViewMode("live")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              viewMode === "live"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Live Fetch</span>
          </button>
        </div>

        {/* Info labels */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground px-2">
          {viewMode === "native" && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Cached reader view
            </span>
          )}
          {viewMode === "live" && (
            <span className="flex items-center gap-1">
              <span className={cn("w-1.5 h-1.5 rounded-full", liveLoading ? "bg-amber-400 animate-pulse" : "bg-blue-400")} />
              {liveLoading ? "Fetching from source…" : "Live from source"}
            </span>
          )}
        </div>

        {/* External link */}
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

      {/* Content Area */}
      <div className="relative animate-fade-in">
        {viewMode === "native" && (
          <div
            className={cn("prose-reading transition-all duration-300 ease-in-out", readerMode ? "mx-auto" : "")}
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}

        {viewMode === "live" && (
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
                <button
                  onClick={fetchLiveContent}
                  className="text-xs px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {!liveLoading && !liveError && liveContent && (
              <div
                className={cn("prose-reading transition-all duration-300 ease-in-out", readerMode ? "mx-auto" : "")}
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
        )}
      </div>
    </div>
  );
}

// ─── Main BlogPage ────────────────────────────────────────────────────────────

export default function BlogPage() {
  const { id } = useParams();
  const { blog, loading, error, refresh } = useBlog(id);
  const { fontSize, readerMode } = useReadingStore();
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useDocumentTitle(blog?.title);
  const { user } = useAuthStore();

  // Record reading history when blog loads
  useEffect(() => {
    if (blog?.id && user) {
      blogService.readBlog(blog.id).catch(() => {});
    }
  }, [blog?.id, user]);

  // Reading progress bar
  useEffect(() => {
    const updateProgress = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setReadingProgress((currentScroll / scrollHeight) * 100);
      }
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  // Load AI summary
  useEffect(() => {
    let mounted = true;
    async function loadSummary() {
      if (!blog?.id) return;
      setSummaryLoading(true);
      try {
        const data = await blogService.getBlogSummary(blog.id);
        if (mounted) setSummary(data);
      } catch {
        if (mounted) setSummary(null);
      } finally {
        if (mounted) setSummaryLoading(false);
      }
    }
    loadSummary();
    return () => { mounted = false; };
  }, [blog?.id]);

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
      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-red-500 to-amber-500 z-[60] transition-all duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
      />

      <div className={cn("container mx-auto py-6 md:py-10 px-4 md:px-6 transition-all duration-500", readerMode ? "max-w-[700px]" : "max-w-[800px]")}>

        {/* Back nav + Controls */}
        <div className="flex items-center justify-between mb-8 sticky top-[3.5rem] md:top-[4rem] z-40 bg-background/80 backdrop-blur-xl py-3 border-b -mx-4 px-4 md:-mx-6 md:px-6 shadow-sm">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground group transition-colors px-2 py-1.5 rounded-lg hover:bg-secondary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <ReadingControls />
          </div>
        </div>

        {!readerMode && <BlogHeader blog={blog} />}

        {/* AI Summary */}
        <AISummaryPanel summary={summary} loading={summaryLoading} />

        {/* Content Viewer (Reader + Live Fetch) */}
        <ContentViewer blog={blog} fontSize={fontSize} readerMode={readerMode} />

        {/* Action bar */}
        {!readerMode && (
          <div className="mt-16 sm:mt-24">
            <BlogActions
              blogId={blog.id}
              blogUrl={blog.sourceURL || blog.url}
            />
            <SuggestedBlogs blogs={suggested} />
          </div>
        )}
      </div>
    </article>
  );
}