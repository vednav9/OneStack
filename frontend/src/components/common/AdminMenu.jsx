import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { clearAdminToken } from "../../services/adminService";

export default function AdminMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        id="admin-menu-btn"
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-full p-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Admin menu"
      >
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            A
          </AvatarFallback>
        </Avatar>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border bg-popover shadow-xl z-50 animate-slide-down overflow-hidden">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">Admin access</p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <Link
              to="/admin"
              id="admin-dashboard-link"
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              <span>Dashboard</span>
            </Link>
          </div>

          <div className="border-t py-1">
            <button
              id="admin-logout-btn"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => {
                clearAdminToken();
                setIsOpen(false);
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out admin</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
