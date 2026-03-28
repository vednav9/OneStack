import { useReadingStore } from "../../store/readingStore";
import { Type, BookOpen } from "lucide-react";

export default function ReadingControls() {
  const { fontSize, increaseFont, decreaseFont, readerMode, toggleReader } = useReadingStore();

  return (
    <div
      id="reading-controls"
      className="flex items-center gap-2 p-3 rounded-xl border bg-card shadow-sm w-fit"
    >
      {/* Decrease font */}
      <button
        id="font-decrease-btn"
        onClick={decreaseFont}
        disabled={fontSize <= 12}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium border hover:bg-secondary transition-colors disabled:opacity-40"
        aria-label="Decrease font size"
        title="Smaller text"
      >
        A
      </button>

      {/* Font size indicator */}
      <span className="text-xs text-muted-foreground w-8 text-center">{fontSize}px</span>

      {/* Increase font */}
      <button
        id="font-increase-btn"
        onClick={increaseFont}
        disabled={fontSize >= 24}
        className="flex items-center justify-center w-8 h-8 rounded-lg font-bold border hover:bg-secondary transition-colors disabled:opacity-40"
        aria-label="Increase font size"
        title="Larger text"
      >
        A
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-border mx-1" />

      {/* Reader mode */}
      <button
        id="reader-mode-btn"
        onClick={toggleReader}
        className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border transition-colors ${
          readerMode
            ? "bg-primary/10 text-primary border-primary/30"
            : "hover:bg-secondary text-muted-foreground"
        }`}
        aria-label="Toggle reader mode"
        title="Reader mode"
      >
        <BookOpen className="h-3.5 w-3.5" />
        {readerMode ? "Exit" : "Reader"}
      </button>
    </div>
  );
}
