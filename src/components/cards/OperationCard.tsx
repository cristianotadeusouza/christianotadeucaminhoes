import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { OperationCategory } from "@/types";

export function OperationCard({ operation }: { operation: OperationCategory }) {
  return (
    <Link
      to="/operacoes"
      hash={operation.slug}
      className="group flex flex-col rounded-lg border border-border bg-card p-5 shadow-card transition-all duration-200 hover:border-engineering/40 hover:shadow-raised"
    >
      <h3 className="text-base font-semibold text-road">{operation.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {operation.context}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-engineering">
        Ver critérios de escolha
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
