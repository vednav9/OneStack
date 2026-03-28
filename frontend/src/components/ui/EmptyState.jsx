import { cn } from "../../utils/cn";

/**
 * EmptyState: shown when a list/page has no content.
 * @param {string} title
 * @param {string} [description]
 * @param {React.ReactNode} [icon]
 * @param {React.ReactNode} [action]
 */
export default function EmptyState({ title, description, icon, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 px-6 text-center", className)}>
      {icon && (
        <div className="mb-4 p-4 rounded-full bg-secondary text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
}
