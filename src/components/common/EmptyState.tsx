import { cn } from "@/lib/utils";
import { Compass } from "lucide-react";

/** EmptyState editorial — usado quando ainda não há dados reais. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-input bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <Compass className="mx-auto size-6 text-engineering" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-semibold text-road">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
