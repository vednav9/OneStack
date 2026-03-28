import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, Moon, Sun, Compass } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { Button } from "../ui/Button";
import UserMenu from "./UserMenu";

export default function Navbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch(e);
    if (e.key === "Escape") setSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-glass">
      <div className="container flex h-14 max-w-screen-xl mx-auto items-center gap-4 px-4 md:px-6">

        {/* Mobile menu button */}
        <button
          id="mobile-menu-btn"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl shrink-0"
          id="logo-link"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
            <Compass className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-gradient-red hidden sm:block">BlogSphere</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                searchFocused ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <input
              id="navbar-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Search articles, topics, companies…"
              className={`w-full h-9 pl-9 pr-4 rounded-full text-sm bg-secondary border transition-all
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30
                ${searchFocused ? "border-primary bg-background" : "border-transparent"}`}
            />
          </form>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Mobile search */}
          <Button
            id="mobile-search-btn"
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => navigate("/search")}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme toggle */}
          <Button
            id="theme-toggle-btn"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {user ? (
            <>
              {/* Notifications */}
              <Button
                id="notifications-btn"
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 hidden sm:inline-flex"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </Button>
              <UserMenu />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" id="signin-btn">Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link to="/register" id="register-btn">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
