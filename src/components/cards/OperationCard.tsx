import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { OperationCategory } from "@/types";

export function OperationCard({
  operation,
  index,
}: {
  operation: OperationCategory;
  index?: number;
}) {
  return (
    <Link
      to="/operacoes"
      hash={operation.slug}
      className="card-lift group relative flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card"
    >
      <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-action transition-transform duration-300 group-hover:scale-x-100" />
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-road">{operation.name}</h3>
        {index && (
          <span className="text-technical text-xs font-bold tracking-[0.12em] text-silver">
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {operation.context}
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-engineering">
        Ver critérios de escolha
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
