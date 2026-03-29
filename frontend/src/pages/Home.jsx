import React, { useState, useMemo } from "react";
import useBlogs from "../hooks/useBlogs";
import BlogFeed from "../components/blog/BlogFeed";
import Filters from "../components/search/Filters";
import { useAuthStore } from "../store/authStore";
import useDocumentTitle from "../hooks/useDocumentTitle";

// Map tab IDs to the useBlogs() endpoint type
const TAB_CONFIG = [
  { id: "all",       label: "For You",   endpoint: "all" },
  { id: "trending",  label: "Trending",  endpoint: "trending" },
  { id: "following", label: "Following", endpoint: "feed", requiresAuth: true },
];

export default function Home() {
  const { user } = useAuthStore();
  useDocumentTitle("Home");
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilter, setActiveFilter] = useState("");

  const currentTab = TAB_CONFIG.find((t) => t.id === activeTab) || TAB_CONFIG[0];

  // Fetch blogs based on selected tab's endpoint
  const { blogs, loading, error, refresh } = useBlogs(currentTab.endpoint);

  const filteredBlogs = useMemo(() => {
    if (!activeFilter) return blogs;
    return blogs.filter((b) =>
      b.tags?.some((t) => t.toLowerCase() === activeFilter.toLowerCase())
    );
  }, [blogs, activeFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="border-b pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
          {user
            ? `Welcome back, ${user.name?.split(" ")[0] || "there"} 👋`
            : "Discover Engineering"}
        </h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {TAB_CONFIG.map((tab) => {
              // Hide auth-required tabs for guests
              if (tab.requiresAuth && !user) return null;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveFilter(""); // reset filter on tab switch
                  }}
                  className={`text-sm font-medium transition-colors hover:text-foreground focus:outline-none pb-4 -mb-[17px] border-b-2 ${
                    activeTab === tab.id
                      ? "text-foreground border-primary"
                      : "text-muted-foreground border-transparent hover:border-border"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters (only on "all" / For You tab) */}
      {activeTab === "all" && (
        <Filters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      )}

      {/* Content */}
      <div className="min-h-[500px]">
        {error ? (
          <div className="text-center py-20 px-6 border rounded-xl bg-destructive/5">
            <p className="text-destructive mb-4 font-medium">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-background border rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        ) : (
          <BlogFeed blogs={filteredBlogs} loading={loading} />
        )}
      </div>
    </div>
  );
}
