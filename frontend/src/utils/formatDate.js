/**
 * Format a date string or Date object to a human-readable string.
 * @param {string|Date} date
 * @param {'long'|'short'|'relative'} format
 */
export function formatDate(date, format = "long") {
  if (!date) return "Just now";
  const d = new Date(date);

  if (format === "relative") {
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWk = Math.floor(diffDay / 7);
    const diffMo = Math.floor(diffDay / 30);
    const diffYr = Math.floor(diffDay / 365);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWk < 4) return `${diffWk}w ago`;
    if (diffMo < 12) return `${diffMo}mo ago`;
    return `${diffYr}y ago`;
  }

  if (format === "short") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
