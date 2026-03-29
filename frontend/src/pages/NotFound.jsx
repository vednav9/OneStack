import { Link } from "react-router-dom";
import { Compass, Home, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page Not Found");

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="mb-8 relative">
        <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20 italic tracking-tighter">
          404
        </div>
        <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-3">
        Lost in the codebase?
      </h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
        The engineering article or page you are looking for has been moved, deleted, or never existed in the first place.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button asChild className="rounded-full shadow-md min-w-[160px] h-12 text-base">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-full min-w-[160px] h-12 text-base bg-background">
          <Link to="/explore">
            <Search className="mr-2 h-4 w-4" />
            Explore Topics
          </Link>
        </Button>
      </div>
    </div>
  );
}
