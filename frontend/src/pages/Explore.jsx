import { useState, useEffect } from "react";
import useBlogs from "../hooks/useBlogs";
import BlogFeed from "../components/blog/BlogFeed";
import SearchBar from "../components/search/SearchBar";
import { Compass, Hash } from "lucide-react";
import Tag from "../components/ui/Tag";
import { TOPICS } from "../utils/constants";
import useDocumentTitle from "../hooks/useDocumentTitle";
import api from "../services/api";

export default function Explore() {
  useDocumentTitle("Explore");
  const { blogs, loading } = useBlogs("all");
  const [activeTab, setActiveTab] = useState("topics");
  const [dynamicTopics, setDynamicTopics] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Fetch real tags from backend
  useEffect(() => {
    api.get("/tags")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDynamicTopics(data.slice(0, 40));
        } else {
          setDynamicTopics(TOPICS); // fallback
        }
      })
      .catch(() => setDynamicTopics(TOPICS))
      .finally(() => setTagsLoading(false));
  }, []);

  const topics = dynamicTopics.length > 0 ? dynamicTopics : TOPICS;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="border-b pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
        </div>
        <p className="text-muted-foreground max-w-xl">
          Discover the best engineering blogs across topics, companies, and system designs.
        </p>
      </header>

      <div className="max-w-2xl">
        <SearchBar className="mb-8" />
      </div>

      <div className="flex items-center gap-4 border-b">
        <button
          onClick={() => setActiveTab("topics")}
          className={`text-sm font-medium transition-colors pb-3 -mb-[1px] border-b-2 ${
            activeTab === "topics"
              ? "text-foreground border-primary"
              : "text-muted-foreground border-transparent hover:border-border hover:text-foreground"
          }`}
        >
          Trending Topics
        </button>
        <button
          onClick={() => setActiveTab("latest")}
          className={`text-sm font-medium transition-colors pb-3 -mb-[1px] border-b-2 ${
            activeTab === "latest"
              ? "text-foreground border-primary"
              : "text-muted-foreground border-transparent hover:border-border hover:text-foreground"
          }`}
        >
          Latest Arrivals
        </button>
      </div>

      <div className="pt-2">
        {activeTab === "topics" && (
          <div className="animate-slide-up">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              Popular Engineering Topics
            </h2>
            <div className="flex flex-wrap gap-2 mb-10">
              {tagsLoading
                ? TOPICS.slice(0, 10).map((t) => (
                    <div key={t} className="h-8 w-24 rounded-full bg-secondary animate-pulse" />
                  ))
                : topics.map((topic) => (
                    <Tag
                      key={topic}
                      label={topic}
                      to={`/topic/${topic.toLowerCase().replace(/ /g, "-")}`}
                      className="px-4 py-2 text-sm"
                    />
                  ))}
            </div>

            <h2 className="font-semibold mb-4 text-lg border-b pb-2">Recently Added</h2>
            <BlogFeed blogs={blogs.slice(0, 5)} loading={loading} />
          </div>
        )}

        {activeTab === "latest" && (
          <div className="animate-slide-up">
            <BlogFeed blogs={blogs} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
}