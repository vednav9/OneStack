import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useFeedStore } from "../../store/feedStore";

const FILTERS = [
  "All",
  "System Design",
  "Machine Learning",
  "DevOps",
  "Databases",
  "Frontend",
  "Backend",
  "Web3",
  "Mobile",
  "Infrastructure",
];

export default function Filters({ activeFilter, onFilterChange, className }) {
  const containerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const sortMode = useFeedStore((state) => state.sortMode);
  const setSortMode = useFeedStore((state) => state.setSortMode);

  // Check scroll position to determine which fade gradients to show
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("relative mb-6", className)}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Sort by
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-secondary/50 p-1">
          <button
            type="button"
            onClick={() => setSortMode("relevant")}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full transition-all",
              sortMode === "relevant"
                ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Relevant
          </button>
          <button
            type="button"
            onClick={() => setSortMode("latest")}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full transition-all",
              sortMode === "latest"
                ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Latest
          </button>
        </div>
      </div>
      {/* Left fade & button */}
      {showLeftScroll && (
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 flex items-center pr-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full shadow-sm bg-background border-border"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Track */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth relative py-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {FILTERS.map((filter) => {
          const isActive =
            activeFilter === filter || (filter === "All" && !activeFilter);

          return (
            <button
              key={filter}
              onClick={() => onFilterChange?.(filter === "All" ? "" : filter)}
              className={cn(
                "whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border"
              )}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Right fade & button */}
      {showRightScroll && (
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 flex items-center justify-end pl-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full shadow-sm bg-background border-border"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
