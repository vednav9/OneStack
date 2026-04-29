import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Button } from "../ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { TOPICS } from "../../utils/constants";

// Static trending sources for now (will be API-driven)
const TRENDING_SOURCES = [
  { id: 1, name: "Netflix Tech Blog", company: "Netflix", tag: "Distributed Systems", color: "bg-red-500" },
  { id: 2, name: "Uber Engineering", company: "Uber", tag: "Real-time Systems", color: "bg-gray-800" },
  { id: 3, name: "Airbnb Engineering", company: "Airbnb", tag: "ML Platform", color: "bg-red-600" },
  { id: 4, name: "Meta Engineering", company: "Meta", tag: "Infrastructure", color: "bg-blue-600" },
  { id: 5, name: "Stripe Tech", company: "Stripe", tag: "Payments API", color: "bg-indigo-600" },
];

export default function RightSidebar() {
  const displayTopics = TOPICS.slice(0, 10);

  return (
    <div className="space-y-8 py-2">
      {/* Trending Sources */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Trending Sources</h3>
        </div>
        <div className="space-y-3">
          {TRENDING_SOURCES.map((source) => (
            <Link
              key={source.id}
              to={`/topic/${source.company.toLowerCase()}`}
              id={`trending-source-${source.id}`}
              className="flex items-center gap-3 group"
            >
              <div
                className={`w-8 h-8 rounded-lg ${source.color} flex items-center justify-center text-white text-xs font-bold shrink-0 group-hover:scale-105 transition-transform`}
              >
                {source.company.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {source.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{source.tag}</p>
              </div>
            </Link>
          ))}
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
