import { cn } from "../../utils/cn";
import { Link } from "react-router-dom";

/**
 * Topic/category tag pill.
 * @param {string} label
 * @param {string} [to] - Optional link path
 * @param {string} [className]
 */
export default function Tag({ label, to, className }) {
  const base = cn(
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
    "bg-secondary text-secondary-foreground",
    "hover:bg-primary/10 hover:text-primary",
    "border border-transparent hover:border-primary/20",
    "transition-all duration-150 cursor-pointer",
    className
  );

  if (to) {
    return (
      <Link to={to} className={base}>
        {label}
      </Link>
    );
  }
  return <span className={base}>{label}</span>;
}