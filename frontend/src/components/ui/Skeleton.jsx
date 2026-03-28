import { cn } from "../../utils/cn";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted relative overflow-hidden",
        "after:absolute after:inset-0 after:bg-gradient-to-r",
        "after:from-transparent after:via-background/30 after:to-transparent",
        "after:animate-shimmer after:bg-[length:200%_100%]",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
