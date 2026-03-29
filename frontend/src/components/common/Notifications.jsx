import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Bookmark, MessageSquare, UserPlus, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { Button } from "../ui/Button";

// Fake mock data for aesthetic
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "save",
    title: "Reading List Update",
    message: "You have 3 unread articles in your saved list.",
    time: "2h ago",
    read: false,
    icon: Bookmark,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: 2,
    type: "system",
    title: "New AI Content Available",
    message: "OpenAI just published a new engineering deep-dive on their scaling infrastructure.",
    time: "5h ago",
    read: false,
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    id: 3,
    type: "follow",
    title: "New Follower",
    message: "@tech_lead started following your reading lists.",
    time: "1d ago",
    read: true,
    icon: UserPlus,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const menuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        id="notifications-btn"
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hidden sm:inline-flex"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse-red" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-popover shadow-xl z-50 animate-slide-down overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto overscroll-contain">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 border-b last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer ${
                      notif.read ? "opacity-75" : "bg-primary/5"
                    }`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notif.bg} ${notif.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground mb-0.5">{notif.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1.5">{notif.time}</p>
                    </div>
                    {!notif.read && (
                       <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center px-4">
                <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1">We'll let you know when something important happens.</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
             <div className="p-2 border-t bg-card text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
                   View past notifications
                </Button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
