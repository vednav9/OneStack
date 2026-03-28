import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LogOut, User, LayoutDashboard, Settings, Bookmark, Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/Avatar";
import { Button } from "../ui/Button";

export default function UserMenu() {
  const { user, logout } = useAuthStore();
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

  if (!user) return null;

  const menuItems = [
    { icon: User, label: "Profile", to: `/profile/${user.username || "me"}` },
    { icon: Bookmark, label: "Saved", to: "/saved" },
    { icon: Clock, label: "History", to: "/history" },
    { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
    { icon: Settings, label: "Settings", to: "/settings" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <Button
        id="user-menu-btn"
        variant="ghost"
        className="relative h-9 w-9 rounded-full p-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.profilePicture} alt={user.username} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {(user.username || user.name || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border bg-popover shadow-xl z-50 animate-slide-down overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {(user.username || user.name || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user.fullName || user.username || user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                id={`usermenu-${label.toLowerCase()}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t py-1">
            <button
              id="logout-btn"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => {
                logout();
                setIsOpen(false);
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}