import { Home, Compass, TrendingUp, Bookmark, Clock, List, Hash, Zap } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { useAuthStore } from "../../store/authStore";

export default function LeftSidebar() {
  const { user } = useAuthStore();

  const navItems = [
    { name: "Home", icon: Home, path: "/", end: true },
    { name: "Explore", icon: Compass, path: "/explore" },
    { name: "Trending", icon: TrendingUp, path: "/trending" },
    { name: "Saved", icon: Bookmark, path: "/saved" },
    { name: "History", icon: Clock, path: "/history" },
    { name: "Lists", icon: List, path: "/lists" },
  ];

  return (
    <div className="flex flex-col gap-1 h-full">
      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path + item.name}
              to={item.path}
              end={item.end}
              id={`sidebar-${item.name.toLowerCase()}`}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Upgrade card */}
      {!user && (
        <div className="mt-auto pt-6">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Join BlogSphere</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Save blogs, get personalized recommendations, and join the community.
            </p>
            <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link to="/register" id="sidebar-get-started-btn">Get Started Free</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
