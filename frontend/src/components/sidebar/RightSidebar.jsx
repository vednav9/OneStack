import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Button } from "../ui/Button";
import { TOPICS } from "../../utils/constants";
import api from "../../services/api";

const DEFAULT_TRENDING_SOURCES = [
  { id: 1, name: "Netflix Tech Blog", company: "Netflix", tag: "Distributed Systems", color: "bg-red-500" },
  { id: 2, name: "Uber Engineering", company: "Uber", tag: "Real-time Systems", color: "bg-gray-800" },
  { id: 3, name: "Airbnb Engineering", company: "Airbnb", tag: "ML Platform", color: "bg-red-600" },
  { id: 4, name: "Meta Engineering", company: "Meta", tag: "Infrastructure", color: "bg-blue-600" },
  { id: 5, name: "Stripe Tech", company: "Stripe", tag: "Payments API", color: "bg-indigo-600" },
];

const SOURCE_COLORS = [
  "bg-red-500",
  "bg-gray-800",
  "bg-red-600",
  "bg-blue-600",
  "bg-indigo-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-slate-700",
];

export default function RightSidebar() {
  const [sources, setSources] = useState(DEFAULT_TRENDING_SOURCES);
  const [topics, setTopics] = useState(TOPICS.slice(0, 10));

  useEffect(() => {
    let cancelled = false;

    api.get("/sources")
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setSources(data);
        }
      })
      .catch(() => {});

    api.get("/tags")
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setTopics(data.slice(0, 10));
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  const displaySources = useMemo(() => (
    Array.isArray(sources) && sources.length > 0 ? sources : DEFAULT_TRENDING_SOURCES
  ), [sources]);

  const displayTopics = useMemo(() => (
    Array.isArray(topics) && topics.length > 0 ? topics : TOPICS.slice(0, 10)
  ), [topics]);

  return (
    <div className="space-y-8 py-2">
      {/* Trending Sources */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Trending Sources</h3>
        </div>
        <div className="space-y-3">
          {displaySources.map((source, index) => {
            const name = source?.name || source?.company || source?.sourceSite || "Source";
            const subtitle = source?.tag || (source?.count ? `${source.count} posts` : source?.sourceSite || "");
            const query = source?.query || source?.sourceSite || source?.name || source?.company || "";
            const color = source?.color || SOURCE_COLORS[index % SOURCE_COLORS.length];
            const iconChar = name.charAt(0).toUpperCase();
            const linkTarget = query ? `/search?q=${encodeURIComponent(query)}` : "/search";

            return (
            <Link
              key={source.id || `${name}-${index}`}
              to={linkTarget}
              id={`trending-source-${source.id || index}`}
              className="flex items-center gap-3 group"
            >
              <div
                className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white text-xs font-bold shrink-0 group-hover:scale-105 transition-transform`}
              >
                {iconChar}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t" />

      {/* Recommended Topics */}
      <section>
        <h3 className="font-semibold text-sm mb-4">Recommended Topics</h3>
        <div className="flex flex-wrap gap-2">
          {displayTopics.map((topic) => (
            <Link
              key={topic}
              to={`/topic/${topic.toLowerCase().replace(/ /g, "-")}`}
              id={`topic-${topic.toLowerCase().replace(/ /g, "-")}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all duration-150"
            >
              {topic}
            </Link>
          ))}
        </div>
        <Button variant="link" className="px-0 mt-3 text-primary h-auto text-sm" asChild>
          <Link to="/explore">See all topics →</Link>
        </Button>
      </section>

      {/* Divider */}
      <div className="border-t" />

      {/* Footer */}
      <div className="text-xs text-muted-foreground space-x-2">
        <Link to="#" className="hover:text-foreground transition-colors">Help</Link>
        <span>·</span>
        <Link to="#" className="hover:text-foreground transition-colors">Status</Link>
        <span>·</span>
        <Link to="#" className="hover:text-foreground transition-colors">About</Link>
        <span>·</span>
        <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
        <p className="mt-2">© {new Date().getFullYear()} OneStack</p>
      </div>
    </div>
  );
}
