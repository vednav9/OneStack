import { useEffect } from "react";
import { X, Home, Compass, TrendingUp, Bookmark, Clock, List, Hash } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

export default function MobileSidebar({ open, onClose }) {
  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Explore", icon: Compass, path: "/explore" },
    { name: "Trending", icon: TrendingUp, path: "/trending" },
    { name: "Topics", icon: Hash, path: "/explore" },
    { name: "Saved", icon: Bookmark, path: "/saved" },
    { name: "History", icon: Clock, path: "/history" },
    { name: "Lists", icon: List, path: "/lists" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-background border-r z-50 md:hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="font-bold text-lg text-gradient-red">BlogSphere</span>
          <button
            id="mobile-sidebar-close"
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path + item.name}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium mb-0.5 transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer note */}
        <div className="px-5 py-4 border-t">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BlogSphere
          </p>
        </div>
      </div>
    </>
  );
}
