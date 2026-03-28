import React, { useState, useMemo } from "react";
import useBlogs from "../hooks/useBlogs";
import BlogFeed from "../components/blog/BlogFeed";
import Filters from "../components/search/Filters";
import { useAuthStore } from "../store/authStore";

export default function Home() {
  const { user } = useAuthStore();
  const { blogs, loading, error, refresh } = useBlogs();
  const [activeTab, setActiveTab] = useState("for_you");
  const [activeFilter, setActiveFilter] = useState("");

  const tabs = [
    { id: "for_you", label: "For You" },
    { id: "following", label: "Following" },
  ];

  // Filtering demo
  const filteredBlogs = React.useMemo(() => {
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
          {user ? `Welcome back, ${user.name?.split(" ")[0] || user.username}` : "Discover Engineering"}
        </h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-medium transition-colors hover:text-foreground focus:outline-none pb-4 -mb-[17px] border-b-2 ${
                  activeTab === tab.id
                    ? "text-foreground border-primary"
                    : "text-muted-foreground border-transparent hover:border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters (only show on "for you" tab) */}
      {activeTab === "for_you" && (
        <Filters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      )}

      {/* Content */}
      <div className="min-h-[500px]">
        {error ? (
          <div className="text-center py-20 px-6 border rounded-xl bg-destructive/5">
            <p className="text-destructive mb-4 font-medium">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-background border rounded-lg hover:bg-secondary transition-colors"
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
