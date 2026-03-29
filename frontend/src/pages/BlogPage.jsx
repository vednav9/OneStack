import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import BlogHeader from "../components/blog/BlogHeader";
import BlogActions from "../components/blog/BlogActions";
import SuggestedBlogs from "../components/blog/SuggestedBlogs";
import ReadingControls from "../components/blog/ReadingControls";
import { Skeleton } from "../components/ui/Skeleton";
import useBlog from "../hooks/useBlog";
import useBlogs from "../hooks/useBlogs";
import { ArrowLeft, RefreshCw, LayoutTemplate, MonitorSmartphone, ExternalLink, Focus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";
import { useReadingStore } from "../store/readingStore";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuthStore } from "../store/authStore";
import * as blogService from "../services/blogService";

export default function BlogPage() {
  const { id } = useParams();
  const { blog, loading, error, refresh } = useBlog(id);
  const { fontSize, readerMode } = useReadingStore();
  const [viewMode, setViewMode] = useState("native"); // "native" | "iframe"
  
  // Progress bar logic
  const [readingProgress, setReadingProgress] = useState(0);

  // Dynamic document title
  useDocumentTitle(blog?.title);

  const { user } = useAuthStore();

  // Record reading history when blog loads
  useEffect(() => {
    if (blog?.id && user) {
      blogService.readBlog(blog.id).catch(() => {}); // fire and forget
    }
  }, [blog?.id, user]);

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
        <div className="p-6 rounded-full bg-destructive/10 text-destructive shadow-inner">
          <RefreshCw className="h-10 w-10 animate-spin-slow" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Article Unavailable</h1>
        <p className="text-muted-foreground max-w-sm">
          {error || "The article you are looking for does not exist or has been removed."}
        </p>
        <div className="flex gap-4 mt-4">
          <Button variant="outline" onClick={refresh} className="rounded-full shadow-sm hover:shadow-md transition-shadow">Try Again</Button>
          <Button asChild className="rounded-full shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-primary to-red-600">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen pb-20 relative">
      {/* Top Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-red-500 to-amber-500 z-[60] transition-all duration-150 ease-out"
        style={{ width: `${readingProgress}%` }}
      />

      <div className={cn("container mx-auto py-6 md:py-10 px-4 md:px-6 transition-all duration-500", readerMode ? "max-w-[700px]" : "max-w-[800px]")}>
        
        {/* Back navigation & Controls row */}
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

        {/* Viewing Mode 3-Way Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/30 p-2 rounded-2xl border mb-10 shadow-sm backdrop-blur-sm">
           <div className="flex items-center w-full sm:w-auto bg-background/50 p-1 rounded-xl border relative shadow-inner">
               {/* 1. Native Render */}
               <button
                  onClick={() => setViewMode("native")}
                  className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 z-10",
                    viewMode === "native" ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                  )}
               >
                 <LayoutTemplate className="h-4 w-4" />
                 Native
               </button>

               {/* 2. Iframe Render */}
               <button
                  onClick={() => setViewMode("iframe")}
                  className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 z-10",
                    viewMode === "iframe" ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                  )}
               >
                 <MonitorSmartphone className="h-4 w-4" />
                 Iframe
               </button>
           </div>
           
           {/* 3. Original Site (External) */}
           <Button
             asChild
             variant="outline"
             className="w-full sm:w-auto rounded-xl bg-background border-border hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-semibold shadow-sm group"
           >
             <a href={blog.sourceURL || blog.url} target="_blank" rel="noopener noreferrer">
                 <Focus className="h-4 w-4 mr-2 text-primary" />
                 Read on Original Site
                 <ExternalLink className="h-3.5 w-3.5 ml-2 text-muted-foreground group-hover:text-primary transition-colors" />
             </a>
           </Button>
        </div>
        
        {/* Content Viewer */}
        <div className="relative animate-fade-in mx-auto">
          {viewMode === "native" ? (
             <div 
               className={cn("prose-reading transition-all duration-300 ease-in-out", readerMode ? "mx-auto" : "")}
               style={{ fontSize: `${fontSize}px` }}
               dangerouslySetInnerHTML={{ __html: blog.content || blog.description }}
             />
          ) : (
             <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-2xl bg-white aspect-[4/5] sm:aspect-video md:aspect-[16/10] ring-1 ring-black/5 dark:ring-white/10 group">
                {/* Simulated browser top bar for aesthetic */}
                <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-900 border-b flex items-center px-4 gap-2">
                   <div className="flex gap-1.5 object-left">
                     <span className="w-3 h-3 rounded-full bg-red-400"></span>
                     <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                     <span className="w-3 h-3 rounded-full bg-green-400"></span>
                   </div>
                   <div className="mx-auto bg-white dark:bg-black rounded-md px-3 py-1 flex items-center max-w-[60%] border shadow-inner">
                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate opacity-70 flex items-center gap-1">
                         <span className="text-green-600 dark:text-green-400 font-bold">🔒</span> {blog.sourceURL || blog.url || "example.com"}
                      </span>
                   </div>
                </div>
                
                {blog.sourceURL || blog.url ? (
                   <iframe 
                     src={blog.sourceURL || blog.url} 
                     className="w-full h-[calc(100%-2.5rem)] border-0 bg-white"
                     sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                     title={blog.title}
                     loading="lazy"
                   />
                ) : (
                   <div className="flex items-center justify-center h-full flex-col gap-4 text-muted-foreground bg-zinc-50 dark:bg-zinc-950">
                      <MonitorSmartphone className="h-12 w-12 opacity-20" />
                      <p>Source URL not available for iframe preview.</p>
                   </div>
                )}
             </div>
          )}
        </div>

        {/* Action bar */}
        {!readerMode && (
          <div className="mt-16 sm:mt-24">
            <BlogActions
              blogId={blog.id}
              blogUrl={blog.sourceURL || blog.url}
            />
            
            {/* Suggested */}
            <SuggestedBlogs blogs={suggested} />
          </div>
        )}
      </div>
    </article>
  );
}